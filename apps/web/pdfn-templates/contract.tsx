import { Document, Page, PageNumber, TotalPages, AvoidBreak } from "@pdfn/react";
import { Tailwind } from "@pdfn/tailwind";

/**
 * Service Agreement Contract template - Legal size (taller page)
 *
 * Demonstrates:
 * - Watermark (e.g., "CONFIDENTIAL", "DRAFT")
 * - Repeating header on each page
 * - Repeating footer with page numbers
 * - Multi-page content with numbered terms
 * - AvoidBreak for signature block
 * - Plain CSS via pdfn-templates/styles.css (loaded by Tailwind)
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
  title = "ENTERPRISE SERVICE AGREEMENT",
  effectiveDate = "January 1, 2026",
  watermark = "CONFIDENTIAL",
  parties = {
    provider: {
      name: "PDFN, Inc.",
      address: "548 Market St, Suite 835, San Francisco, CA 94104",
      representative: "Alex Chen, Head of Partnerships",
    },
    client: {
      name: "Acme Corporation",
      address: "456 Enterprise Blvd, Suite 100, Austin, TX 78701",
      representative: "Sarah Johnson, CTO",
    },
  },
  terms = [
    {
      title: "Services",
      content:
        "Provider agrees to deliver the PDFN Enterprise Platform including unlimited server-side PDF generation, React component library, Tailwind CSS integration, and API access as detailed in Exhibit A. The Platform shall include all current features and any updates released during the term of this Agreement.",
    },
    {
      title: "Compensation",
      content:
        "Client shall pay Provider an annual license fee of $4,999 USD, due upon execution of this Agreement. Additional API usage beyond 100,000 PDFs per month shall be billed at $0.02 per PDF. All fees are non-refundable and exclusive of applicable taxes.",
    },
    {
      title: "Term and Termination",
      content:
        "This Agreement shall commence on the Effective Date and continue for twelve (12) months, automatically renewing for successive one-year terms unless either party provides written notice of non-renewal at least thirty (30) days prior to the end of the then-current term. Either party may terminate for cause with thirty (30) days written notice upon material breach.",
    },
    {
      title: "Confidentiality",
      content:
        "Both parties agree to maintain the confidentiality of any proprietary information disclosed during this engagement, including but not limited to technical specifications, business strategies, and customer data. This obligation shall survive termination for a period of three (3) years.",
    },
    {
      title: "Service Level Agreement",
      content:
        "Provider guarantees 99.9% API uptime measured monthly, excluding scheduled maintenance. Priority technical support shall be provided with 4-hour response time during business hours (9 AM - 6 PM PST). Critical production issues shall receive 1-hour response time 24/7/365.",
    },
    {
      title: "Intellectual Property",
      content:
        "Provider retains all intellectual property rights in and to the Platform. Client is granted a non-exclusive, non-transferable license to use the Platform during the term. Any custom developments shall be owned by Provider unless otherwise agreed in writing.",
    },
    {
      title: "Data Protection",
      content:
        "Provider shall implement and maintain appropriate technical and organizational measures to protect Client data against unauthorized access, loss, or alteration. Provider shall comply with applicable data protection laws including GDPR and CCPA. Provider shall notify Client within 72 hours of any data breach.",
    },
    {
      title: "Limitation of Liability",
      content:
        "In no event shall either party be liable for any indirect, incidental, special, consequential, or punitive damages. Provider's total liability shall not exceed the fees paid by Client in the twelve (12) months preceding the claim. This limitation shall not apply to breaches of confidentiality or gross negligence.",
    },
    {
      title: "Indemnification",
      content:
        "Provider shall indemnify and hold harmless Client from any third-party claims arising from Provider's breach of this Agreement or infringement of intellectual property rights. Client shall indemnify Provider from claims arising from Client's misuse of the Platform or violation of applicable laws.",
    },
    {
      title: "Governing Law",
      content:
        "This Agreement shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of laws principles. Any disputes shall be resolved through binding arbitration in San Francisco, California under AAA Commercial Arbitration Rules.",
    },
  ],
  signatures = {
    provider: { name: "Alex Chen", title: "Head of Partnerships" },
    client: { name: "Sarah Johnson", title: "Chief Technology Officer" },
  },
}: ContractProps) {
  return (
    <Document title={title}>
      <Tailwind>
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
          <div className="contract-header">
            <div className="contract-header-logo">
              <img src="https://pdfn.dev/logo-dark.svg" alt="Logo" />
              <div className="divider">|</div>
              <div className="contract-header-title">{title}</div>
            </div>
            <div className="contract-header-date">Effective: {effectiveDate}</div>
          </div>
        }
        footer={
          <div className="contract-footer">
            <div className="contract-footer-inner">
              <div>{parties.provider.name} — Confidential</div>
              <div>
                Page <PageNumber /> of <TotalPages />
              </div>
            </div>
          </div>
        }
      >
        {/* Parties Introduction */}
        <p className="intro-paragraph">
          This {title} (&ldquo;Agreement&rdquo;) is entered into as of{" "}
          <span className="date-highlight">{effectiveDate}</span> by and between the following
          parties:
        </p>

        {/* Parties */}
        <div className="parties-grid">
          <div className="party-card party-card--provider">
            <div className="party-label party-label--provider">Service Provider</div>
            <div className="party-name">{parties.provider.name}</div>
            <div className="party-address">{parties.provider.address}</div>
            <div className="party-representative">
              <span className="font-medium">Representative: </span>
              {parties.provider.representative}
            </div>
          </div>
          <div className="party-card party-card--client">
            <div className="party-label party-label--client">Client</div>
            <div className="party-name">{parties.client.name}</div>
            <div className="party-address">{parties.client.address}</div>
            <div className="party-representative">
              <span className="font-medium">Representative: </span>
              {parties.client.representative}
            </div>
          </div>
        </div>

        {/* Terms Section Header */}
        <div className="terms-header">
          <div className="terms-header-line"></div>
          <h2 className="terms-header-title">Terms and Conditions</h2>
          <div className="terms-header-line"></div>
        </div>

        {/* Terms */}
        <div className="terms-list">
          {terms.map((term, i) => (
            <div key={i} className="term-item">
              <div className="term-number">{i + 1}</div>
              <div className="term-content">
                <h3 className="term-title">{term.title}</h3>
                <p className="term-text">{term.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Agreement Statement */}
        <div className="agreement-statement">
          <p>
            <strong>IN WITNESS WHEREOF</strong>, the parties have executed this Agreement as of the
            Effective Date. Both parties acknowledge that they have read, understood, and agree to be
            bound by all terms and conditions set forth herein.
          </p>
        </div>

        {/* Signatures */}
        <AvoidBreak>
          <div className="signatures-grid">
            {/* Provider Signature */}
            <div className="signature-block">
              <div className="signature-label signature-label--provider">Service Provider</div>
              <div className="signature-line"></div>
              <div className="signature-name">{signatures.provider.name}</div>
              <div className="signature-title">{signatures.provider.title}</div>
              <div className="signature-date">
                <div>Date: _______________</div>
              </div>
            </div>

            {/* Client Signature */}
            <div className="signature-block">
              <div className="signature-label signature-label--client">Client</div>
              <div className="signature-line"></div>
              <div className="signature-name">{signatures.client.name}</div>
              <div className="signature-title">{signatures.client.title}</div>
              <div className="signature-date">
                <div>Date: _______________</div>
              </div>
            </div>
          </div>
        </AvoidBreak>
      </Page>
      </Tailwind>
    </Document>
  );
}
