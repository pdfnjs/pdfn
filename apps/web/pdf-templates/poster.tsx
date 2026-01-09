import { Document, Page } from "@pdfn/react";

/**
 * Event Poster template - Tabloid size, Landscape orientation
 *
 * Demonstrates:
 * - Large format (Tabloid: 17" x 11")
 * - Landscape orientation
 * - Full-bleed design (margin: 0)
 * - Bold typography and visual hierarchy
 * - Using the css prop for inline CSS
 *
 * Note: font-display is a custom font configured in the css prop
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

// CSS styles as a string for the css prop
const posterStyles = `
  /* Import Google Fonts */
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@900&display=swap');

  /* Color variables */
  :root {
    --cyan-400: #22d3ee;
    --cyan-500: #06b6d4;
    --gray-400: #9ca3af;
    --gray-500: #6b7280;
    --gray-600: #4b5563;
    --gray-900: #111827;
  }

  /* Base styles */
  .poster-container {
    background-color: var(--gray-900);
    color: white;
    padding: 3rem;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  /* Top section */
  .poster-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .poster-logo {
    height: 2rem;
  }

  .accent-bars {
    display: flex;
    gap: 0.5rem;
  }

  .accent-bar {
    height: 0.375rem;
    border-radius: 9999px;
  }

  .accent-bar--large {
    width: 8rem;
    background-color: var(--cyan-500);
  }

  .accent-bar--medium {
    width: 4rem;
    background-color: rgba(6, 182, 212, 0.5);
  }

  .accent-bar--small {
    width: 2rem;
    background-color: rgba(6, 182, 212, 0.25);
  }

  /* Main content */
  .poster-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .poster-headline {
    font-family: 'Playfair Display', serif;
    font-size: 6rem;
    font-weight: 900;
    letter-spacing: -0.025em;
    line-height: 1;
    margin-bottom: 1.5rem;
    margin-top: 0;
  }

  .poster-headline .year {
    color: var(--cyan-400);
  }

  .poster-subheadline {
    font-size: 1.875rem;
    color: var(--gray-400);
    font-weight: 300;
    max-width: 48rem;
    margin-bottom: 3rem;
    margin-top: 0;
  }

  /* Event details */
  .event-details {
    display: flex;
    gap: 5rem;
  }

  .event-detail-label {
    font-size: 0.875rem;
    color: var(--cyan-500);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .event-detail-value {
    font-size: 2.25rem;
    font-weight: 700;
  }

  /* Bottom section */
  .poster-footer {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }

  .highlights {
    display: flex;
    gap: 1rem;
  }

  .highlight-tag {
    border: 2px solid var(--gray-600);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 9999px;
    font-size: 1rem;
    font-weight: 600;
  }

  .cta-section {
    text-align: right;
  }

  .cta-button {
    display: inline-block;
    background-color: var(--cyan-500);
    color: var(--gray-900);
    font-size: 1.5rem;
    font-weight: 900;
    padding: 1.25rem 2.5rem;
    border-radius: 0.75rem;
  }

  .cta-website {
    font-size: 1rem;
    color: var(--gray-500);
    margin-top: 1rem;
    font-family: ui-monospace, monospace;
    letter-spacing: 0.05em;
  }

  /* Bottom accent */
  .bottom-accent {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 2rem;
  }
`;

export default function Poster({
  headline = "React PDF Summit",
  year = "2026",
  subheadline = "Innovation Meets Inspiration",
  date = "March 15-17, 2026",
  venue = "Moscone Center, San Francisco",
  highlights = ["50+ Speakers", "React & PDFs", "Workshops"],
  cta = "Get Tickets",
  website = "summit.pdfn.dev",
}: PosterProps) {
  // Tabloid landscape dimensions
  const pageHeight = "792pt"; // 11 inches

  return (
    <Document title={`Poster - ${headline}`} css={posterStyles}>
      <Page size="Tabloid" orientation="landscape" margin="0">
        {/* Full bleed dark background */}
        <div className="poster-container" style={{ minHeight: pageHeight, height: pageHeight }}>
          {/* Top Section: Logo and Accent */}
          <div className="poster-header">
            <img src="https://pdfn.dev/logo.svg" alt="Logo" className="poster-logo" />
            <div className="accent-bars">
              <div className="accent-bar accent-bar--large"></div>
              <div className="accent-bar accent-bar--medium"></div>
              <div className="accent-bar accent-bar--small"></div>
            </div>
          </div>

          {/* Main Content - Vertically Centered */}
          <div className="poster-main">
            {/* Headline */}
            <h1 className="poster-headline">
              {headline}
              {year && <span className="year"> {year}</span>}
            </h1>

            {subheadline && <p className="poster-subheadline">{subheadline}</p>}

            {/* Event Details */}
            <div className="event-details">
              <div>
                <div className="event-detail-label">Date</div>
                <div className="event-detail-value">{date}</div>
              </div>
              <div>
                <div className="event-detail-label">Venue</div>
                <div className="event-detail-value">{venue}</div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="poster-footer">
            {/* Highlights/Tags */}
            <div className="highlights">
              {highlights.map((highlight, i) => (
                <div key={i} className="highlight-tag">
                  {highlight}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="cta-section">
              <div className="cta-button">{cta}</div>
              <div className="cta-website">{website}</div>
            </div>
          </div>

          {/* Bottom Accent */}
          <div className="bottom-accent">
            <div className="accent-bar accent-bar--small"></div>
            <div className="accent-bar accent-bar--medium"></div>
            <div className="accent-bar accent-bar--large"></div>
          </div>
        </div>
      </Page>
    </Document>
  );
}
