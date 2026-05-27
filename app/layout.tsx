import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  variable: "--font-ibm-plex-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://foresight.cuvetsmo.com"),
  title: {
    default: "Foresight — Forecast the things that matter",
    template: "%s — Foresight",
  },
  description:
    "Foresight is a prediction market for the SEA region — Thai politics, climate, vet disease outbreaks, and global events. Cohort-curated, MCP-native, AI-assisted resolution.",
  applicationName: "Foresight",
  keywords: [
    "prediction market",
    "forecasting",
    "Thailand",
    "Southeast Asia",
    "SEA",
    "Polymarket",
    "Kalshi",
    "event contract",
    "vet disease",
    "ASF",
    "PRRSV",
    "climate",
    "election",
    "MCP",
    "cuvetsmo",
  ],
  authors: [{ name: "Foresight" }],
  creator: "CUVETSMO",
  publisher: "CUVETSMO",
  openGraph: {
    title: "Foresight — Forecast the things that matter",
    description:
      "A prediction market built for Southeast Asia. Cohort-curated, MCP-native, AI-assisted resolution.",
    type: "website",
    locale: "en_US",
    alternateLocale: ["th_TH"],
    siteName: "Foresight",
    url: "https://foresight.cuvetsmo.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Foresight — Forecast the things that matter",
    description:
      "A prediction market built for Southeast Asia. Cohort-curated, MCP-native, AI-assisted resolution.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://foresight.cuvetsmo.com",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://foresight.cuvetsmo.com/#org",
  name: "Foresight",
  alternateName: ["Foresight", "foresight.cuvetsmo.com", "CUVETSMO Foresight"],
  url: "https://foresight.cuvetsmo.com/",
  description:
    "Forecasting marketplace for Southeast Asian + global events. MCP-native, AI-assisted resolution.",
  parentOrganization: {
    "@type": "Organization",
    "@id": "https://cuvetsmo.com/#smo",
    name: "CUVETSMO",
    url: "https://cuvetsmo.com/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${ibmPlexSansThai.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
        {children}
      </body>
    </html>
  );
}
