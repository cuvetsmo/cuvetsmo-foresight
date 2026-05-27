import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, Inter } from "next/font/google";
import { BRAND, DEPLOY } from "@/lib/brand";
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
  metadataBase: new URL(DEPLOY.baseUrl),
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s — ${BRAND.name}`,
  },
  description: BRAND.shortDescription,
  applicationName: BRAND.name,
  keywords: [
    "prediction market",
    "forecasting marketplace",
    "event contracts",
    "verifiable resolution",
    "polymarket alternative",
    "kalshi alternative",
    "regional politics",
    "climate forecasting",
    "vet disease forecasting",
    "frontier research",
    "MCP",
    "AI agents",
  ],
  authors: [{ name: BRAND.name }],
  creator: BRAND.name,
  publisher: BRAND.name,
  openGraph: {
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.shortDescription,
    type: "website",
    locale: "en_US",
    alternateLocale: ["th_TH"],
    siteName: BRAND.name,
    url: DEPLOY.baseUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.shortDescription,
    ...(DEPLOY.xHandle ? { creator: `@${DEPLOY.xHandle}` } : {}),
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: DEPLOY.baseUrl,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${DEPLOY.baseUrl}/#org`,
  name: BRAND.name,
  url: `${DEPLOY.baseUrl}/`,
  description: BRAND.description,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${DEPLOY.baseUrl}/#website`,
  name: BRAND.name,
  url: `${DEPLOY.baseUrl}/`,
  inLanguage: ["en", "th"],
  publisher: { "@id": `${DEPLOY.baseUrl}/#org` },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
        {children}
      </body>
    </html>
  );
}
