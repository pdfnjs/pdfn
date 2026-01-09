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

interface LetterProps {
  sender?: {
    name: string;
    title?: string;
    company: string;
    address: string;
    city: string;
    email: string;
    phone: string;
  };
  recipient?: {
    name: string;
    title?: string;
    company: string;
    address: string;
    city: string;
  };
  date?: string;
  subject?: string;
  body?: string[];
  closing?: string;
  signature?: string;
}

// Color palette (matching Tailwind gray scale)
const colors = {
  gray900: "#111827",
  gray800: "#1f2937",
  gray700: "#374151",
  gray600: "#4b5563",
  gray500: "#6b7280",
  gray300: "#d1d5db",
  gray50: "#f9fafb",
};

export default function Letter({
  sender = {
    name: "Alex Chen",
    title: "Head of Partnerships",
    company: "PDFN",
    address: "548 Market St, Suite 835",
    city: "San Francisco, CA 94104",
    email: "alex@pdfn.dev",
    phone: "+1 (415) 555-0132",
  },
  recipient = {
    name: "Sarah Johnson",
    title: "Chief Technology Officer",
    company: "Acme Corporation",
    address: "456 Enterprise Blvd, Suite 100",
    city: "Austin, TX 78701",
  },
  date = "January 15, 2026",
  subject = "PDFN Enterprise Partnership Proposal",
  body = [
    "I hope this letter finds you well. Following our conversation at React Summit last month, I wanted to formally present our enterprise partnership proposal for your consideration.",
    "PDFN provides server-side PDF generation using React components and Tailwind CSS. Our solution has helped over 500 companies streamline their document workflows, reducing development time by an average of 60%.",
    "We believe PDFN would be an excellent fit for Acme Corporation's document generation needs. Our enterprise plan includes unlimited PDF generation, priority support, and custom integrations tailored to your existing infrastructure.",
    "I would welcome the opportunity to schedule a technical demo with your team. Please let me know if you would be available for a call next week to discuss how PDFN can help Acme Corporation.",
  ],
  closing = "Best regards",
  signature = "Alex Chen",
}: LetterProps) {
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
                {sender.address} • {sender.city}
              </div>
            </div>
            <div
              style={{
                textAlign: "right",
                fontSize: "0.75rem",
                color: colors.gray500,
              }}
            >
              <div>{sender.email}</div>
              <div>{sender.phone}</div>
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
          {date}
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
            {recipient.name}
          </div>
          {recipient.title && (
            <div style={{ fontSize: "0.875rem", color: colors.gray600 }}>
              {recipient.title}
            </div>
          )}
          <div style={{ fontSize: "0.875rem", color: colors.gray600 }}>
            {recipient.company}
          </div>
          <div style={{ fontSize: "0.875rem", color: colors.gray500 }}>
            {recipient.address}, {recipient.city}
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
          Dear {recipient.name},
        </div>

        {/* Body */}
        <div style={{ marginBottom: "1.5rem" }}>
          {body.map((paragraph, i) => (
            <p
              key={i}
              style={{
                fontSize: "0.875rem",
                color: colors.gray700,
                lineHeight: 1.625,
                marginTop: i > 0 ? "0.75rem" : 0,
                marginBottom: 0,
              }}
            >
              {paragraph}
            </p>
          ))}
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
            {closing},
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
            {signature}
          </div>
          {sender.title && (
            <div style={{ fontSize: "0.75rem", color: colors.gray600 }}>
              {sender.title}, {sender.company}
            </div>
          )}
        </div>
      </Page>
    </Document>
  );
}
