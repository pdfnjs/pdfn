import { Document, Page, PageNumber, TotalPages, AvoidBreak } from "@pdfn/react";

/**
 * Service Agreement Contract template - Legal size (inline styles)
 *
 * Demonstrates:
 * - Watermark (e.g., "CONFIDENTIAL", "DRAFT")
 * - Repeating header and footer
 * - Multi-page content with numbered terms
 * - AvoidBreak for signature block
 */

interface ContractProps {
  title?: string;
  effectiveDate?: string;
  watermark?: string;
  parties?: {
    provider: {
      name: string;
      address: string;
      representative: string;
    };
    client: {
      name: string;
      address: string;
      representative: string;
    };
  };
  terms?: Array<{
    title: string;
    content: string;
  }>;
  signatures?: {
    provider: { name: string; title: string };
    client: { name: string; title: string };
  };
}

export default function Contract({
  title = "SERVICE AGREEMENT",
  effectiveDate = "January 1, 2025",
  watermark = "DRAFT",
  parties = {
    provider: {
      name: "Your Company, Inc.",
      address: "123 Business St, San Francisco, CA 94102",
      representative: "Alex Chen, CEO",
    },
    client: {
      name: "Acme Corporation",
      address: "456 Enterprise Blvd, Austin, TX 78701",
      representative: "Sarah Johnson, CTO",
    },
  },
  terms = [
    {
      title: "Services",
      content:
        "Provider agrees to deliver the Platform including all features and any updates released during the term of this Agreement.",
    },
    {
      title: "Compensation",
      content:
        "Client shall pay Provider an annual license fee as specified in the Order Form. All fees are non-refundable and exclusive of applicable taxes.",
    },
    {
      title: "Term and Termination",
      content:
        "This Agreement shall commence on the Effective Date and continue for twelve (12) months, automatically renewing unless either party provides written notice at least thirty (30) days prior.",
    },
    {
      title: "Confidentiality",
      content:
        "Both parties agree to maintain the confidentiality of any proprietary information disclosed during this engagement. This obligation shall survive termination for three (3) years.",
    },
  ],
  signatures = {
    provider: { name: "Alex Chen", title: "CEO" },
    client: { name: "Sarah Johnson", title: "CTO" },
  },
}: ContractProps) {
  return (
    <Document title={title}>
      <Page
        size="Legal"
        margin="1in"
        watermark={
          watermark
            ? {
                text: watermark,
                opacity: 0.08,
                rotation: -35,
              }
            : undefined
        }
        header={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid #d1d5db", marginBottom: "24px" }}>
            <div style={{ fontSize: "10px", fontWeight: "600", color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {title}
            </div>
            <div style={{ fontSize: "10px", color: "#6b7280" }}>Effective: {effectiveDate}</div>
          </div>
        }
        footer={
          <div style={{ paddingTop: "12px", borderTop: "1px solid #d1d5db" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px", color: "#6b7280" }}>
              <div>{parties.provider.name} — Confidential</div>
              <div>
                Page <PageNumber /> of <TotalPages />
              </div>
            </div>
          </div>
        }
      >
        {/* Parties Introduction */}
        <p style={{ fontSize: "14px", color: "#374151", lineHeight: "1.625", marginBottom: "24px" }}>
          This {title} ("Agreement") is entered into as of{" "}
          <span style={{ fontWeight: "600" }}>{effectiveDate}</span> by and between the following
          parties:
        </p>

        {/* Parties */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
          <div style={{ border: "2px solid #1f2937", borderRadius: "8px", padding: "16px" }}>
            <div style={{ fontSize: "10px", fontWeight: "bold", color: "#1f2937", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
              Service Provider
            </div>
            <div style={{ fontSize: "14px", fontWeight: "bold", color: "#111827" }}>{parties.provider.name}</div>
            <div style={{ fontSize: "10px", color: "#4b5563", marginTop: "4px" }}>{parties.provider.address}</div>
            <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "8px" }}>
              <span style={{ fontWeight: "500" }}>Representative: </span>
              {parties.provider.representative}
            </div>
          </div>
          <div style={{ border: "1px solid #d1d5db", borderRadius: "8px", padding: "16px" }}>
            <div style={{ fontSize: "10px", fontWeight: "bold", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
              Client
            </div>
            <div style={{ fontSize: "14px", fontWeight: "bold", color: "#111827" }}>{parties.client.name}</div>
            <div style={{ fontSize: "10px", color: "#4b5563", marginTop: "4px" }}>{parties.client.address}</div>
            <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "8px" }}>
              <span style={{ fontWeight: "500" }}>Representative: </span>
              {parties.client.representative}
            </div>
          </div>
        </div>

        {/* Terms Section Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <div style={{ flex: 1, borderTop: "2px solid #1f2937" }}></div>
          <h2 style={{ fontSize: "14px", fontWeight: "900", color: "#111827", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
            Terms and Conditions
          </h2>
          <div style={{ flex: 1, borderTop: "2px solid #1f2937" }}></div>
        </div>

        {/* Terms */}
        <div style={{ marginBottom: "32px" }}>
          {terms.map((term, i) => (
            <div key={i} style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#1f2937", color: "white", fontSize: "10px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "14px", fontWeight: "bold", color: "#111827", marginBottom: "4px", marginTop: 0 }}>{term.title}</h3>
                <p style={{ fontSize: "10px", color: "#4b5563", lineHeight: "1.625", margin: 0 }}>{term.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Agreement Statement */}
        <div style={{ marginBottom: "32px", backgroundColor: "#f3f4f6", padding: "20px", borderRadius: "8px" }}>
          <p style={{ fontSize: "10px", color: "#374151", lineHeight: "1.625", textAlign: "center", margin: 0 }}>
            <strong style={{ color: "#111827" }}>IN WITNESS WHEREOF</strong>, the parties have
            executed this Agreement as of the Effective Date. Both parties acknowledge that they
            have read, understood, and agree to be bound by all terms and conditions set forth
            herein.
          </p>
        </div>

        {/* Signatures */}
        <AvoidBreak>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
            {/* Provider Signature */}
            <div>
              <div style={{ fontSize: "10px", fontWeight: "bold", color: "#1f2937", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
                Service Provider
              </div>
              <div style={{ borderBottom: "2px solid #1f2937", marginBottom: "8px", height: "40px" }}></div>
              <div style={{ fontSize: "14px", fontWeight: "bold", color: "#111827" }}>
                {signatures.provider.name}
              </div>
              <div style={{ fontSize: "10px", color: "#4b5563" }}>{signatures.provider.title}</div>
              <div style={{ marginTop: "12px", fontSize: "10px", color: "#6b7280" }}>
                Date: _______________
              </div>
            </div>

            {/* Client Signature */}
            <div>
              <div style={{ fontSize: "10px", fontWeight: "bold", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
                Client
              </div>
              <div style={{ borderBottom: "2px solid #1f2937", marginBottom: "8px", height: "40px" }}></div>
              <div style={{ fontSize: "14px", fontWeight: "bold", color: "#111827" }}>{signatures.client.name}</div>
              <div style={{ fontSize: "10px", color: "#4b5563" }}>{signatures.client.title}</div>
              <div style={{ marginTop: "12px", fontSize: "10px", color: "#6b7280" }}>
                Date: _______________
              </div>
            </div>
          </div>
        </AvoidBreak>
      </Page>
    </Document>
  );
}
