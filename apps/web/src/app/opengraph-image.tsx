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
          background: "#09090b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            fontSize: 120,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          <span style={{ color: "#4B5563" }}>pdf</span>
          <span style={{ color: "#22d3ee" }}>n</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 42,
            color: "#a1a1aa",
            marginTop: 24,
          }}
        >
          Write React. Ship PDFs.
        </div>

        {/* URL */}
        <div
          style={{
            fontSize: 28,
            color: "#52525b",
            marginTop: 80,
          }}
        >
          pdfn.dev
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
