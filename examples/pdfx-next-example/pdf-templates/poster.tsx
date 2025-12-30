import { Document, Page } from "@pdfx-dev/react";
import { Tailwind } from "@pdfx-dev/tailwind";
import type { PosterData } from "./types";

/**
 * Event Poster template - Tabloid size, Landscape orientation
 * Tabloid landscape: 17" x 11" (1224pt x 792pt)
 */
export default function Poster({ data }: { data: PosterData }) {
  // Tabloid landscape height: 11 inches = 792pt
  const pageHeight = "792pt";

  return (
    <Document title={`Poster - ${data.headline}`}>
      <Tailwind>
        <Page size="Tabloid" orientation="landscape" margin="0">
          {/* Full bleed dark background with explicit height */}
          <div
            className="bg-gray-900 text-white p-12 flex flex-col"
            style={{ minHeight: pageHeight, height: pageHeight }}
          >
            {/* Top accent line */}
            <div className="flex gap-2">
              <div className="h-1.5 w-32 bg-cyan-500 rounded-full"></div>
              <div className="h-1.5 w-16 bg-cyan-500/50 rounded-full"></div>
              <div className="h-1.5 w-8 bg-cyan-500/25 rounded-full"></div>
            </div>

            {/* Main Content - takes all available space */}
            <div className="flex-1 flex flex-col justify-center py-8">
              {/* Headline */}
              <h1 className="text-8xl font-black tracking-tight leading-none mb-6">
                {data.headline}
                {data.year && <span className="text-cyan-400"> {data.year}</span>}
              </h1>
              {data.subheadline && (
                <p className="text-3xl text-gray-400 font-light max-w-3xl">
                  {data.subheadline}
                </p>
              )}

              {/* Event Details */}
              <div className="flex gap-16 mt-16">
                <div>
                  <div className="text-sm text-cyan-500 uppercase tracking-widest font-bold mb-3">
                    Date
                  </div>
                  <div className="text-4xl font-bold">
                    {data.date}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-cyan-500 uppercase tracking-widest font-bold mb-3">
                    Venue
                  </div>
                  <div className="text-4xl font-bold">
                    {data.venue}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="flex items-end justify-between">
              {/* Highlights */}
              <div className="flex gap-4">
                {data.highlights.map((highlight, i) => (
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
                <div className="inline-block bg-cyan-500 text-gray-900 text-2xl font-black px-10 py-5 rounded-xl">
                  {data.cta}
                </div>
                <div className="text-base text-gray-500 mt-4 font-mono">
                  {data.website}
                </div>
              </div>
            </div>

            {/* Bottom accent */}
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
