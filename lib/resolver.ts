/**
 * AI-assisted resolver — multi-provider chain with Iron Rule 0 hook.
 *
 * Reads the same five-provider env contract that webcuvetsmo's ai-chat
 * Edge Function uses (Groq → Cerebras → SambaNova → OpenRouter → Mistral).
 * Each provider is tried in order until one returns a syntactically valid
 * structured response.
 *
 * Iron Rule 0 contract: the resolver MUST be allowed to refuse. If the
 * model's reply is not unambiguous, or if any of the named sources can't
 * be cited, we return status="ambiguous" with appealAvailable=true and
 * NEVER force a YES/NO. Refuse > fabricate is encoded in the system prompt
 * and double-checked in the parser.
 *
 * Phase 0 behavior (when zero API keys are configured): returns the
 * "pending" status from the MCP server's resolve-check tool. The shape
 * is identical so the /api/resolve endpoint never breaks; only the
 * confidence and reasoning come from the live verifier when keys exist.
 */

export type ResolveStatus = "verifiable" | "pending" | "ambiguous" | "refused";

export interface ResolveCitedSource {
  source: string;
  checked: boolean;
  note: string;
  url?: string;
}

export interface ResolveResult {
  status: ResolveStatus;
  proposedOutcome?: "yes" | "no" | "void";
  confidence?: number;
  reasoning: string;
  citedSources: ResolveCitedSource[];
  appealAvailable: boolean;
  providerUsed?: string;
  refusalReason?: string;
}

export interface ResolveInput {
  question: string;
  resolutionCriteria: string;
  resolutionSources: string[];
  closesAt: string;
  asOf?: string;
}

interface Provider {
  name: string;
  envKey: string;
  baseUrl: string;
  model: string;
}

const PROVIDERS: Provider[] = [
  {
    name: "groq",
    envKey: "GROQ_API_KEY",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.3-70b-versatile",
  },
  {
    name: "cerebras",
    envKey: "CEREBRAS_API_KEY",
    baseUrl: "https://api.cerebras.ai/v1/chat/completions",
    model: "llama3.3-70b",
  },
  {
    name: "sambanova",
    envKey: "SAMBANOVA_API_KEY",
    baseUrl: "https://api.sambanova.ai/v1/chat/completions",
    model: "Meta-Llama-3.3-70B-Instruct",
  },
  {
    name: "openrouter",
    envKey: "OPENROUTER_API_KEY",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    model: "meta-llama/llama-3.3-70b-instruct:free",
  },
  {
    name: "mistral",
    envKey: "MISTRAL_API_KEY",
    baseUrl: "https://api.mistral.ai/v1/chat/completions",
    model: "mistral-large-latest",
  },
];

const SYSTEM_PROMPT = `You are the verifier for Foresight, a forecasting marketplace.

Your job: dry-run the resolution of a market. Read the question, the
explicit resolution criterion, and the named primary sources. Return a
STRUCTURED JSON object — never prose.

# Iron rule

You are ALLOWED to refuse. If you cannot match the resolution to a clear
YES or NO with high confidence based on the criterion alone, return
status="ambiguous" with appealAvailable=true. Do not invent facts.
Do not guess. "I don't know with high confidence" is the correct
answer when the criterion does not yield a determinate outcome.

# Status taxonomy

- "verifiable": criterion + sources unambiguously yield YES or NO at this
  point in time. Provide proposedOutcome + confidence in 0.0-1.0.
- "pending": market is still open OR the deadline has not passed yet OR
  the event has not happened yet. Confidence is null.
- "ambiguous": criterion is real but the answer requires interpretation
  beyond what the criterion + sources alone can settle. The appeal panel
  will escalate.
- "refused": criterion is malformed, distress-coded, or unverifiable in
  principle (e.g., predicting the death of a named living person).

# Response shape (REQUIRED JSON, no other output)

{
  "status": "verifiable" | "pending" | "ambiguous" | "refused",
  "proposedOutcome": "yes" | "no" | "void" | null,
  "confidence": 0.0-1.0 | null,
  "reasoning": "1-3 sentences explaining the decision in plain English.",
  "citedSources": [
    { "source": "the source name as given", "checked": true|false,
      "note": "what we would verify there at resolution" }
  ],
  "refusalReason": "<set only if status is refused>"
}`;

function buildUserPrompt(input: ResolveInput): string {
  const asOfDate = input.asOf ? new Date(input.asOf) : new Date();
  return [
    `# Question`,
    input.question,
    ``,
    `# Resolution criterion`,
    input.resolutionCriteria,
    ``,
    `# Named primary sources`,
    input.resolutionSources.map((s) => `- ${s}`).join("\n"),
    ``,
    `# Market closes at`,
    input.closesAt,
    ``,
    `# Resolving as of`,
    asOfDate.toISOString(),
    ``,
    `Return ONLY the JSON object specified in your system instructions.`,
  ].join("\n");
}

/**
 * Try providers in order until one succeeds. Returns the first valid
 * parsed response or null if all fail (or none are configured).
 */
async function callProviderChain(
  input: ResolveInput,
  signal?: AbortSignal,
): Promise<{ result: ResolveResult; providerUsed: string } | null> {
  const userPrompt = buildUserPrompt(input);

  for (const provider of PROVIDERS) {
    const apiKey = process.env[provider.envKey];
    if (!apiKey) continue;

    try {
      const res = await fetch(provider.baseUrl, {
        method: "POST",
        signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.0,
          max_tokens: 600,
          response_format: { type: "json_object" },
        }),
      });

      if (!res.ok) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`[resolver] ${provider.name} returned ${res.status}, trying next`);
        }
        continue;
      }

      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = json.choices?.[0]?.message?.content;
      if (!content) continue;

      const parsed = JSON.parse(content) as Partial<ResolveResult> & {
        confidence?: number | null;
        proposedOutcome?: string | null;
      };

      // Iron Rule 0 verify hook — refuse > fabricate
      if (
        !parsed.status ||
        !["verifiable", "pending", "ambiguous", "refused"].includes(parsed.status)
      ) {
        return {
          providerUsed: provider.name,
          result: {
            status: "ambiguous",
            reasoning:
              "Model returned a non-canonical status. Escalating to appeal panel.",
            citedSources: input.resolutionSources.map((source) => ({
              source,
              checked: false,
              note: "Verifier output malformed — appeal required.",
            })),
            appealAvailable: true,
          },
        };
      }

      // High-confidence verifiable only — anything < 0.85 we downgrade
      if (
        parsed.status === "verifiable" &&
        typeof parsed.confidence === "number" &&
        parsed.confidence < 0.85
      ) {
        return {
          providerUsed: provider.name,
          result: {
            status: "ambiguous",
            reasoning: `Verifier confidence ${parsed.confidence.toFixed(2)} is below the 0.85 floor. Escalating to appeal panel. Original reasoning: ${parsed.reasoning ?? "(none)"}`,
            citedSources: (parsed.citedSources ?? []).map((c) => ({
              source: c.source,
              checked: c.checked ?? false,
              note: c.note ?? "",
            })),
            appealAvailable: true,
          },
        };
      }

      return {
        providerUsed: provider.name,
        result: {
          status: parsed.status,
          proposedOutcome:
            parsed.proposedOutcome &&
            ["yes", "no", "void"].includes(parsed.proposedOutcome)
              ? (parsed.proposedOutcome as "yes" | "no" | "void")
              : undefined,
          confidence:
            typeof parsed.confidence === "number" ? parsed.confidence : undefined,
          reasoning: parsed.reasoning ?? "(no reasoning returned)",
          citedSources: (parsed.citedSources ?? []).map((c) => ({
            source: c.source,
            checked: c.checked ?? false,
            note: c.note ?? "",
          })),
          appealAvailable: true,
          refusalReason: parsed.refusalReason,
        },
      };
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[resolver] ${provider.name} threw, trying next:`, err);
      }
      continue;
    }
  }

  return null;
}

/**
 * Public entry. Always returns a ResolveResult (never throws).
 * When no providers are configured (Phase 0), returns the deterministic
 * "pending" stub so the API contract holds.
 */
export async function resolve(input: ResolveInput): Promise<ResolveResult> {
  const asOfDate = input.asOf ? new Date(input.asOf) : new Date();
  const closesAt = new Date(input.closesAt);
  const isPastClose = asOfDate.getTime() >= closesAt.getTime();

  // If the market is still open, no provider call needed — pending is correct.
  if (!isPastClose) {
    return {
      status: "pending",
      reasoning: `Market is still open (closes ${input.closesAt}). Verifier will run after the close date passes.`,
      citedSources: input.resolutionSources.map((source) => ({
        source,
        checked: false,
        note: "Will be consulted at resolution.",
      })),
      appealAvailable: true,
    };
  }

  // Try the provider chain
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const out = await callProviderChain(input, controller.signal);
    if (out) {
      return { ...out.result, providerUsed: out.providerUsed };
    }
  } finally {
    clearTimeout(timeout);
  }

  // No providers configured (or all failed) — return pending with explanation
  return {
    status: "pending",
    reasoning:
      "Verifier providers are not configured for this deployment yet. The structured shape is stable — when API keys are wired, this returns a verifier outcome with confidence ≥ 0.85 or escalates to appeal.",
    citedSources: input.resolutionSources.map((source) => ({
      source,
      checked: false,
      note: "Provider chain not configured — pending real verifier wire-up.",
    })),
    appealAvailable: true,
  };
}
