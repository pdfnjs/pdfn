import { Document, Page } from "@pdfn/react";

/**
 * Business Letter template - US Letter size
 *
 * Demonstrates:
 * - Professional letterhead with company branding
 * - Proper business letter format
 * - Single page layout
 * - Inline styles (no Tailwind)
 */

const colors = {
  gray900: "#111827",
  gray800: "#1f2937",
  gray700: "#374151",
  gray600: "#4b5563",
  gray500: "#6b7280",
  gray300: "#d1d5db",
  gray50: "#f9fafb",
};

interface LetterProps {
  subject: string;
}

function Letter({ subject }: LetterProps) {
  return (
    <Document title={`Letter - ${subject}`}>
      <Page size="Letter" margin="1in">
        {/* Letterhead */}
        <div
          style={{
            marginBottom: "1.5rem",
            paddingBottom: "0.75rem",
            borderBottom: `2px solid ${colors.gray800}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <img
                src="https://pdfn.dev/logo-dark.svg"
                alt="Company Logo"
                style={{ height: "2rem", marginBottom: "0.5rem" }}
              />
              <div style={{ fontSize: "0.75rem", color: colors.gray500 }}>
                548 Market St, Suite 835 • San Francisco, CA 94104
              </div>
            </div>
            <div
              style={{
                textAlign: "right",
                fontSize: "0.75rem",
                color: colors.gray500,
              }}
            >
              <div>alex@pdfn.dev</div>
              <div>+1 (415) 555-0132</div>
            </div>
          </div>
        </div>

        {/* Date */}
        <div
          style={{
            fontSize: "0.875rem",
            color: colors.gray700,
            marginBottom: "1.5rem",
          }}
        >
          January 15, 2026
        </div>

        {/* Recipient Info */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: colors.gray900,
            }}
          >
            Sarah Johnson
          </div>
          <div style={{ fontSize: "0.875rem", color: colors.gray600 }}>
            Chief Technology Officer
          </div>
          <div style={{ fontSize: "0.875rem", color: colors.gray600 }}>
            Acme Corporation
          </div>
          <div style={{ fontSize: "0.875rem", color: colors.gray500 }}>
            456 Enterprise Blvd, Suite 100, Austin, TX 78701
          </div>
        </div>

        {/* Subject Line */}
        <div
          style={{
            marginBottom: "1rem",
            paddingTop: "0.375rem",
            paddingBottom: "0.375rem",
            borderLeft: `4px solid ${colors.gray800}`,
            paddingLeft: "0.75rem",
            backgroundColor: colors.gray50,
          }}
        >
          <span
            style={{
              fontSize: "0.875rem",
              fontWeight: 700,
              color: colors.gray900,
              textTransform: "uppercase",
              letterSpacing: "0.025em",
            }}
          >
            Re:{" "}
          </span>
          <span
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: colors.gray800,
            }}
          >
            {subject}
          </span>
        </div>

        {/* Salutation */}
        <div
          style={{
            fontSize: "0.875rem",
            color: colors.gray900,
            marginBottom: "0.75rem",
          }}
        >
          Dear Sarah Johnson,
        </div>

        {/* Body */}
        <div style={{ marginBottom: "1.5rem" }}>
          <p
            style={{
              fontSize: "0.875rem",
              color: colors.gray700,
              lineHeight: 1.625,
              marginTop: 0,
              marginBottom: 0,
            }}
          >
            Following our conversation at React Summit, I wanted to formally present our
            enterprise partnership proposal. PDFN provides server-side PDF generation using
            React components, and we believe it would be an excellent fit for Acme
            Corporation's document workflows.
          </p>
          <p
            style={{
              fontSize: "0.875rem",
              color: colors.gray700,
              lineHeight: 1.625,
              marginTop: "0.75rem",
              marginBottom: 0,
            }}
          >
            I would welcome the opportunity to schedule a technical demo with your team.
            Please let me know if you are available for a call next week to discuss next steps.
          </p>
        </div>

        {/* Closing & Signature */}
        <div style={{ marginTop: "1.5rem" }}>
          <div
            style={{
              fontSize: "0.875rem",
              color: colors.gray900,
              marginBottom: "1.5rem",
            }}
          >
            Best regards,
          </div>
          <div
            style={{
              borderBottom: `1px solid ${colors.gray300}`,
              width: "10rem",
              marginBottom: "0.25rem",
            }}
          ></div>
          <div
            style={{
              fontSize: "0.875rem",
              fontWeight: 700,
              color: colors.gray900,
            }}
          >
            Alex Chen
          </div>
          <div style={{ fontSize: "0.75rem", color: colors.gray600 }}>
            Head of Partnerships, PDFN
          </div>
        </div>
      </Page>
    </Document>
  );
}

Letter.PreviewProps = {
  subject: "Enterprise Partnership Proposal",
} satisfies LetterProps;

export default Letter;
