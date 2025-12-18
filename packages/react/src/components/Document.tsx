import type { DocumentProps } from "../types";

/**
 * Document - Root component for PDF documents
 *
 * Wraps all Page components and defines document-level metadata.
 *
 * @example
 * ```tsx
 * <Document title="Invoice" author="Acme Corp">
 *   <Page>
 *     <h1>Invoice #1234</h1>
 *   </Page>
 * </Document>
 * ```
 */
export function Document({
  children,
  title,
  author,
  subject,
  keywords,
  language = "en",
}: DocumentProps) {
  return (
    <div
      data-pdfx-document
      data-title={title}
      data-author={author}
      data-subject={subject}
      data-keywords={keywords?.join(",")}
      data-language={language}
    >
      {children}
    </div>
  );
}
