import type { MetadataRoute } from "next";

// Next serves this at /manifest.webmanifest and injects the <link rel="manifest">
// tag automatically. Do not also ship a static public/site.webmanifest, or the
// app serves two conflicting manifests.
//
// --tf-bg resolved from oklch(0.12 0.011 280). The brand docs quote #0f0e18,
// which is a stale, lighter value — using it makes the PWA splash screen seam
// visibly against the app background.
const TF_BG = "#050509";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TeamFore",
    short_name: "TeamFore",
    description: "Team availability, leave management & standup visibility",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: TF_BG,
    theme_color: TF_BG,
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/android-chrome-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      // Adaptive icon: glyph sits inside the 72% safe circle, full-bleed
      // gradient behind it so any mask shape reads as intentional.
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Apply Leave",
        short_name: "Apply",
        description: "Apply for leave",
        url: "/leaves/apply",
        icons: [{ src: "/android-chrome-192.png", sizes: "192x192" }],
      },
      {
        name: "Team Status",
        short_name: "Status",
        description: "View team availability",
        url: "/dashboard",
        icons: [{ src: "/android-chrome-192.png", sizes: "192x192" }],
      },
    ],
    screenshots: [
      {
        src: "/screenshots/dashboard.png",
        sizes: "1280x720",
        type: "image/png",
        label: "Team dashboard",
      },
      {
        src: "/screenshots/apply-leave.png",
        sizes: "1280x720",
        type: "image/png",
        label: "Apply for leave",
      },
    ],
  };
}
