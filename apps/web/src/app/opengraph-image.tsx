import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "pdfn - Write React. Ship PDFs.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0f0f0f",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Top-down gradient with cyan tint */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(180deg, rgba(34, 211, 238, 0.1) 0%, transparent 50%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            zIndex: 1,
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              fontSize: 180,
              fontWeight: 700,
              letterSpacing: "-0.04em",
            }}
          >
            <span style={{ color: "#fafafa" }}>pdf</span>
            <span style={{ color: "#22d3ee" }}>n</span>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: "#71717a",
              letterSpacing: "-0.02em",
            }}
          >
            Write React. Ship PDFs.
          </div>

          {/* Divider */}
          <div
            style={{
              width: 80,
              height: 4,
              background: "#22d3ee",
              borderRadius: 2,
              marginTop: 32,
            }}
          />

          {/* URL */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: "#71717a",
              marginTop: 16,
            }}
          >
            pdfn.dev
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
