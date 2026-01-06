import { Document, Page } from "@pdfn/react";

/**
 * Event Poster template - Tabloid size, Landscape (inline styles)
 *
 * Demonstrates:
 * - Large format (Tabloid: 17" x 11")
 * - Landscape orientation
 * - Full-bleed design (margin: 0)
 * - Bold typography and visual hierarchy
 */

interface PosterProps {
  headline?: string;
  year?: string;
  subheadline?: string;
  date?: string;
  venue?: string;
  highlights?: string[];
  cta?: string;
  website?: string;
}

export default function Poster({
  headline = "Tech Conference",
  year = "2025",
  subheadline = "Innovation Meets Inspiration",
  date = "March 15-17, 2025",
  venue = "Convention Center, San Francisco",
  highlights = ["50+ Speakers", "Workshops", "Networking"],
  cta = "Get Tickets",
  website = "techconf2025.com",
}: PosterProps) {
  // Tabloid landscape dimensions
  const pageHeight = "792pt"; // 11 inches

  return (
    <Document title={`Poster - ${headline}`}>
      <Page size="Tabloid" orientation="landscape" margin="0">
        {/* Full bleed dark background */}
        <div
          style={{
            backgroundColor: "#111827",
            color: "white",
            padding: "48px",
            display: "flex",
            flexDirection: "column",
            minHeight: pageHeight,
            height: pageHeight,
          }}
        >
          {/* Top Section: Logo and Accent */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div style={{ fontSize: "24px", fontWeight: "900", color: "white" }}>PDFN</div>
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ height: "6px", width: "128px", backgroundColor: "#06b6d4", borderRadius: "9999px" }}></div>
              <div style={{ height: "6px", width: "64px", backgroundColor: "rgba(6, 182, 212, 0.5)", borderRadius: "9999px" }}></div>
              <div style={{ height: "6px", width: "32px", backgroundColor: "rgba(6, 182, 212, 0.25)", borderRadius: "9999px" }}></div>
            </div>
          </div>

          {/* Main Content - Vertically Centered */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {/* Headline */}
            <h1 style={{ fontSize: "96px", fontWeight: "900", letterSpacing: "-0.025em", lineHeight: 1, marginBottom: "24px", margin: 0 }}>
              {headline}
              {year && <span style={{ color: "#22d3ee" }}> {year}</span>}
            </h1>

            {subheadline && (
              <p style={{ fontSize: "30px", color: "#9ca3af", fontWeight: "300", maxWidth: "768px", marginBottom: "48px", marginTop: "24px" }}>
                {subheadline}
              </p>
            )}

            {/* Event Details */}
            <div style={{ display: "flex", gap: "80px" }}>
              <div>
                <div style={{ fontSize: "14px", color: "#06b6d4", textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: "bold", marginBottom: "8px" }}>
                  Date
                </div>
                <div style={{ fontSize: "36px", fontWeight: "bold" }}>{date}</div>
              </div>
              <div>
                <div style={{ fontSize: "14px", color: "#06b6d4", textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: "bold", marginBottom: "8px" }}>
                  Venue
                </div>
                <div style={{ fontSize: "36px", fontWeight: "bold" }}>{venue}</div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            {/* Highlights/Tags */}
            <div style={{ display: "flex", gap: "16px" }}>
              {highlights.map((highlight, i) => (
                <div
                  key={i}
                  style={{ border: "2px solid #4b5563", color: "white", padding: "12px 24px", borderRadius: "9999px", fontSize: "16px", fontWeight: "600" }}
                >
                  {highlight}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "inline-block", backgroundColor: "#06b6d4", color: "#111827", fontSize: "24px", fontWeight: "900", padding: "20px 40px", borderRadius: "12px" }}>
                {cta}
              </div>
              <div style={{ fontSize: "16px", color: "#6b7280", marginTop: "16px", fontFamily: "monospace", letterSpacing: "0.05em" }}>
                {website}
              </div>
            </div>
          </div>

          {/* Bottom Accent */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "32px" }}>
            <div style={{ height: "6px", width: "32px", backgroundColor: "rgba(6, 182, 212, 0.25)", borderRadius: "9999px" }}></div>
            <div style={{ height: "6px", width: "64px", backgroundColor: "rgba(6, 182, 212, 0.5)", borderRadius: "9999px" }}></div>
            <div style={{ height: "6px", width: "128px", backgroundColor: "#06b6d4", borderRadius: "9999px" }}></div>
          </div>
        </div>
      </Page>
    </Document>
  );
}
