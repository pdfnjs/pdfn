import { Document, Page } from "@pdfx-dev/react";
import { Tailwind } from "@pdfx-dev/tailwind";

/**
 * Event Poster template - Tabloid size, Landscape orientation
 *
 * Demonstrates:
 * - Large format (Tabloid: 17" x 11")
 * - Landscape orientation
 * - Full-bleed design (margin: 0)
 * - Bold typography and visual hierarchy
 *
 * Note: font-display is a custom font configured in globals.css
 * - font-display: "Playfair Display" (elegant serif)
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
  headline = "React PDF Summit",
  year = "2026",
  subheadline = "Innovation Meets Inspiration",
  date = "March 15-17, 2026",
  venue = "Moscone Center, San Francisco",
  highlights = ["50+ Speakers", "React & PDFs", "Workshops"],
  cta = "Get Tickets",
  website = "summit.pdfx.dev",
}: PosterProps) {
  // Tabloid landscape dimensions
  const pageHeight = "792pt"; // 11 inches

  return (
    <Document title={`Poster - ${headline}`}>
      <Tailwind>
        <Page size="Tabloid" orientation="landscape" margin="0">
          {/* Full bleed dark background */}
          <div
            className="bg-gray-900 text-white p-12 flex flex-col"
            style={{ minHeight: pageHeight, height: pageHeight }}
          >
            {/* Top Section: Logo and Accent */}
            <div className="flex justify-between items-start mb-4">
              <img src="./pdf-templates/assets/logo.svg" alt="Logo" className="h-8 invert" />
              <div className="flex gap-2">
                <div className="h-1.5 w-32 bg-cyan-500 rounded-full"></div>
                <div className="h-1.5 w-16 bg-cyan-500/50 rounded-full"></div>
                <div className="h-1.5 w-8 bg-cyan-500/25 rounded-full"></div>
              </div>
            </div>

            {/* Main Content - Vertically Centered */}
            <div className="flex-1 flex flex-col justify-center">
              {/* Headline */}
              <h1 className="text-8xl font-black tracking-tight leading-none mb-6 font-display">
                {headline}
                {year && <span className="text-cyan-400"> {year}</span>}
              </h1>

              {subheadline && (
                <p className="text-3xl text-gray-400 font-light max-w-3xl mb-12">
                  {subheadline}
                </p>
              )}

              {/* Event Details */}
              <div className="flex gap-20">
                <div>
                  <div className="text-sm text-cyan-500 uppercase tracking-widest font-bold mb-2">
                    Date
                  </div>
                  <div className="text-4xl font-bold">{date}</div>
                </div>
                <div>
                  <div className="text-sm text-cyan-500 uppercase tracking-widest font-bold mb-2">
                    Venue
                  </div>
                  <div className="text-4xl font-bold">{venue}</div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="flex items-end justify-between">
              {/* Highlights/Tags */}
              <div className="flex gap-4">
                {highlights.map((highlight, i) => (
                  <div
                    key={i}
                    className="border-2 border-gray-600 text-white px-6 py-3 rounded-full text-base font-semibold"
                  >
                    {highlight}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="text-right">
                <div className="inline-block bg-cyan-500 text-gray-900 text-2xl font-black px-10 py-5 rounded-xl shadow-lg">
                  {cta}
                </div>
                <div className="text-base text-gray-500 mt-4 font-mono tracking-wide">
                  {website}
                </div>
              </div>
            </div>

            {/* Bottom Accent */}
            <div className="flex justify-end gap-2 mt-8">
              <div className="h-1.5 w-8 bg-cyan-500/25 rounded-full"></div>
              <div className="h-1.5 w-16 bg-cyan-500/50 rounded-full"></div>
              <div className="h-1.5 w-32 bg-cyan-500 rounded-full"></div>
            </div>
          </div>
        </Page>
      </Tailwind>
    </Document>
  );
}
