import { getSupabase } from "./supabase";
import type { MarketCategory } from "./types";

export type ReviewStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "revisions-requested";

export interface MarketProposal {
  id: string;
  draftId: string;
  question: string;
  questionEn?: string;
  category: MarketCategory;
  closesAt: string;
  resolutionCriteria: string;
  resolutionSources: string[];
  tags: string[];
  proposedBy: string | null;
  proposedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewStatus: ReviewStatus;
  reviewNotes: string | null;
}

interface DbProposalRow {
  id: string;
  draft_id: string;
  question: string;
  question_en: string | null;
  category: MarketCategory;
  closes_at: string;
  resolution_criteria: string;
  resolution_sources: string[];
  tags: string[] | null;
  proposed_by: string | null;
  proposed_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_status: ReviewStatus;
  review_notes: string | null;
}

function rowToProposal(r: DbProposalRow): MarketProposal {
  return {
    id: r.id,
    draftId: r.draft_id,
    question: r.question,
    questionEn: r.question_en ?? undefined,
    category: r.category,
    closesAt: r.closes_at,
    resolutionCriteria: r.resolution_criteria,
    resolutionSources: r.resolution_sources,
    tags: r.tags ?? [],
    proposedBy: r.proposed_by,
    proposedAt: r.proposed_at,
    reviewedBy: r.reviewed_by,
    reviewedAt: r.reviewed_at,
    reviewStatus: r.review_status,
    reviewNotes: r.review_notes,
  };
}

/**
 * Fetch every market proposal, regardless of status. Returns empty array
 * if Supabase env is missing — admin queue degrades to "0 proposals · be
 * the first to propose a market" rather than blanking the page.
 *
 * Phase 1 surface is intentionally read-public: anyone can see what's
 * been proposed and where in the queue it sits. Approval actions are
 * gated behind auth (Phase 2).
 */
export async function listProposals(): Promise<MarketProposal[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("foresight_market_proposals")
    .select(
      "id,draft_id,question,question_en,category,closes_at,resolution_criteria,resolution_sources,tags,proposed_by,proposed_at,reviewed_by,reviewed_at,review_status,review_notes",
    )
    .order("proposed_at", { ascending: false });
  if (error || !data) return [];
  return data.map(rowToProposal);
}
