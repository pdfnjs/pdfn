import { Document, Page } from "@pdfn/react";

/**
 * Business Letter template - US Letter size (inline styles)
 *
 * Demonstrates:
 * - Professional letterhead
 * - Proper business letter format
 * - Single page layout
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

export default function Letter({
  sender = {
    name: "Alex Chen",
    title: "Head of Partnerships",
    company: "Your Company",
    address: "123 Business St, Suite 100",
    city: "San Francisco, CA 94102",
    email: "alex@yourcompany.com",
    phone: "+1 (555) 123-4567",
  },
  recipient = {
    name: "Sarah Johnson",
    title: "Chief Technology Officer",
    company: "Acme Corporation",
    address: "456 Enterprise Blvd, Suite 100",
    city: "Austin, TX 78701",
  },
  date = "January 15, 2025",
  subject = "Partnership Proposal",
  body = [
    "I hope this letter finds you well. Following our conversation last month, I wanted to formally present our partnership proposal for your consideration.",
    "Our solution has helped over 500 companies streamline their workflows, reducing development time by an average of 60%. We believe our platform would be an excellent fit for your needs.",
    "I would welcome the opportunity to schedule a technical demo with your team. Please let me know if you would be available for a call next week.",
  ],
  closing = "Best regards",
  signature = "Alex Chen",
}: LetterProps) {
  return (
    <Document title={`Letter - ${subject}`}>
      <Page size="Letter" margin="1in">
        {/* Letterhead */}
        <div style={{ marginBottom: "24px", paddingBottom: "12px", borderBottom: "2px solid #1f2937" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "20px", fontWeight: "bold", color: "#111827" }}>{sender.company}</div>
              <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "4px" }}>
                {sender.address} • {sender.city}
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: "10px", color: "#6b7280" }}>
              <div>{sender.email}</div>
              <div>{sender.phone}</div>
            </div>
          </div>
        </div>

        {/* Date */}
        <div style={{ fontSize: "14px", color: "#374151", marginBottom: "24px" }}>{date}</div>

        {/* Recipient Info */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>{recipient.name}</div>
          {recipient.title && (
            <div style={{ fontSize: "14px", color: "#4b5563" }}>{recipient.title}</div>
          )}
          <div style={{ fontSize: "14px", color: "#4b5563" }}>{recipient.company}</div>
          <div style={{ fontSize: "14px", color: "#6b7280" }}>
            {recipient.address}, {recipient.city}
          </div>
        </div>

        {/* Subject Line */}
        <div style={{ marginBottom: "16px", padding: "6px 0 6px 12px", borderLeft: "4px solid #1f2937", backgroundColor: "#f9fafb" }}>
          <span style={{ fontSize: "14px", fontWeight: "bold", color: "#111827", textTransform: "uppercase", letterSpacing: "0.05em" }}>Re: </span>
          <span style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>{subject}</span>
        </div>

        {/* Salutation */}
        <div style={{ fontSize: "14px", color: "#111827", marginBottom: "12px" }}>Dear {recipient.name},</div>

        {/* Body */}
        <div style={{ marginBottom: "24px" }}>
          {body.map((paragraph, i) => (
            <p key={i} style={{ fontSize: "14px", color: "#374151", lineHeight: "1.625", marginBottom: "12px" }}>
              {paragraph}
            </p>
          ))}
        </div>

        {/* Closing & Signature */}
        <div style={{ marginTop: "24px" }}>
          <div style={{ fontSize: "14px", color: "#111827", marginBottom: "24px" }}>{closing},</div>
          <div style={{ borderBottom: "1px solid #d1d5db", width: "160px", marginBottom: "4px" }}></div>
          <div style={{ fontSize: "14px", fontWeight: "bold", color: "#111827" }}>{signature}</div>
          {sender.title && (
            <div style={{ fontSize: "10px", color: "#4b5563" }}>
              {sender.title}, {sender.company}
            </div>
          )}
        </div>
      </Page>
    </Document>
  );
}
