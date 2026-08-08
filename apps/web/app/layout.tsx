import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { PosthogProvider } from "@/components/posthog-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

// metadataBase makes every relative og/twitter image URL absolute. Without it
// Next emits relative paths that crawlers cannot resolve, which is the most
// common reason link previews render blank. Set NEXT_PUBLIC_SITE_URL on Vercel.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://teamfore.vercel.app";

// --tf-bg resolved from oklch(0.12 0.011 280).
const TF_BG = "#050509";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TeamFore — Know who's available before you plan the week",
    template: "%s — TeamFore",
  },
  description:
    "Team availability intelligence for engineering managers. Leave requests, capacity, and sprint readiness in one calm surface.",
  keywords: [
    "team availability",
    "leave management",
    "engineering manager",
    "sprint planning",
    "capacity planning",
  ],
  authors: [{ name: "TeamFore", url: "https://teamfore.com" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "TeamFore",
    title: "TeamFore — Know who's available before you plan the week",
    description: "Leave, capacity, and sprint readiness in one calm surface.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TeamFore dashboard — team availability calendar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@teamfore",
    creator: "@teamfore",
    title: "TeamFore — Team availability intelligence",
    description: "Leave, capacity, and sprint readiness in one calm surface.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  // No `manifest` key: Next injects <link rel="manifest"> from app/manifest.ts.
  // This previously pointed at /site.webmanifest, which does not exist in this
  // repo — the manifest link was a 404 and the app was not installable.
  appleWebApp: {
    capable: true,
    title: "TeamFore",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/favicon.ico"],
  },
};

// themeColor and colorScheme are not valid in `metadata` in Next 16 — the build
// warns and drops the tag. They belong in a separate viewport export.
export const viewport: Viewport = {
  themeColor: TF_BG,
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  // Standalone PWA needs this or the iOS status bar overlaps content.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        geist.variable,
        geistMono.variable,
        instrumentSerif.variable,
      )}
    >
      <body>
        <PosthogProvider>
          <ThemeProvider>
            <QueryProvider>
              <AuthProvider>{children}</AuthProvider>
            </QueryProvider>
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </PosthogProvider>
      </body>
    </html>
  );
}
