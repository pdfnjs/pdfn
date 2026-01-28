import { Document, Page, PageNumber, TotalPages, NoBreak } from "@pdfn/react";
import { Tailwind } from "@pdfn/tailwind";

/**
 * Service Agreement Contract template - Legal size
 *
 * Demonstrates:
 * - Watermark ("CONFIDENTIAL", "DRAFT")
 * - Repeating header and footer with page numbers
 * - NoBreak for signature block
 * - Plain CSS via pdfn-templates/styles.css
 */

const terms = [
  {
    title: "Services",
    content: "Provider agrees to deliver the PDFN Enterprise Platform including unlimited PDF generation, React component library, and API access as detailed in Exhibit A.",
  },
  {
    title: "Compensation",
    content: "Client shall pay an annual license fee of $4,999 USD, due upon execution. Additional API usage beyond 100,000 PDFs per month shall be billed at $0.02 per PDF.",
  },
  {
    title: "Term and Termination",
    content: "This Agreement continues for twelve (12) months, renewing automatically unless either party provides thirty (30) days written notice of non-renewal.",
  },
  {
    title: "Confidentiality",
    content: "Both parties agree to maintain the confidentiality of proprietary information disclosed during this engagement. This obligation survives termination for three (3) years.",
  },
];

export default function Contract({ watermark = "CONFIDENTIAL" }: { watermark?: string }) {
  const title = "ENTERPRISE SERVICE AGREEMENT";
  const effectiveDate = "January 1, 2026";

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
              <div>PDFN, Inc. — Confidential</div>
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
            <div className="party-name">PDFN, Inc.</div>
            <div className="party-address">548 Market St, Suite 835, San Francisco, CA 94104</div>
            <div className="party-representative">
              <span className="font-medium">Representative: </span>
              Alex Chen, Head of Partnerships
            </div>
          </div>
          <div className="party-card party-card--client">
            <div className="party-label party-label--client">Client</div>
            <div className="party-name">Acme Corporation</div>
            <div className="party-address">456 Enterprise Blvd, Suite 100, Austin, TX 78701</div>
            <div className="party-representative">
              <span className="font-medium">Representative: </span>
              Sarah Johnson, CTO
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
        <NoBreak>
          <div className="signatures-grid">
            <div className="signature-block">
              <div className="signature-label signature-label--provider">Service Provider</div>
              <div className="signature-line"></div>
              <div className="signature-name">Alex Chen</div>
              <div className="signature-title">Head of Partnerships</div>
              <div className="signature-date">
                <div>Date: _______________</div>
              </div>
            </div>

            <div className="signature-block">
              <div className="signature-label signature-label--client">Client</div>
              <div className="signature-line"></div>
              <div className="signature-name">Sarah Johnson</div>
              <div className="signature-title">Chief Technology Officer</div>
              <div className="signature-date">
                <div>Date: _______________</div>
              </div>
            </div>
          </div>
        </NoBreak>
      </Page>
      </Tailwind>
    </Document>
  );
}
