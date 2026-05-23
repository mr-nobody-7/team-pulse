import type { Metadata } from "next";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://teamfore.com"),
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
    url: "https://teamfore.com",
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
  manifest: "/site.webmanifest",
  themeColor: "#0f0e18",
  appleWebApp: {
    capable: true,
    title: "TeamFore",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/favicon-32.svg", type: "image/svg+xml", sizes: "32x32" },
      { url: "/favicon-16.svg", type: "image/svg+xml", sizes: "16x16" },
    ],
    apple: [{ url: "/apple-touch-icon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon-32.svg"],
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
