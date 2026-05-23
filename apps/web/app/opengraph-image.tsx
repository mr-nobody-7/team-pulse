import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "TeamFore — Know who's available before you plan the week";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "72px 80px",
        background: "#0f0d1a",
        fontFamily: "system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          right: "-5%",
          width: 700,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(107,82,214,0.3) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          left: "-5%",
          width: 500,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(82,107,214,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Logo mark */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 48,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "linear-gradient(160deg, #9B8EF0, #6B52D6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="2.4"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M4 7h16M4 12h10M4 17h6" />
          </svg>
        </div>
        <span
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: "white",
            letterSpacing: "-0.02em",
          }}
        >
          TeamFore
        </span>
      </div>

      {/* Headline */}
      <div
        style={{
          fontSize: 58,
          fontWeight: 700,
          color: "white",
          lineHeight: 1.08,
          letterSpacing: "-0.025em",
          maxWidth: 860,
          marginBottom: 24,
        }}
      >
        Know who&apos;s available before you plan the week.
      </div>

      {/* Sub */}
      <div
        style={{
          fontSize: 22,
          color: "rgba(255,255,255,0.55)",
          lineHeight: 1.5,
          maxWidth: 620,
          marginBottom: 48,
        }}
      >
        Team availability intelligence for engineering managers.
      </div>

      {/* Bottom tag */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 16px",
          border: "1px solid rgba(155,142,240,0.4)",
          borderRadius: 99,
          background: "rgba(155,142,240,0.12)",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#6ee7b7",
          }}
        />
        <span
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.6)",
            fontFamily: "monospace",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Free to start · teamfore.com
        </span>
      </div>
    </div>,
    { ...size },
  );
}
