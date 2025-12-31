import type { DocumentProps, FontConfig } from "../types";

/**
 * Serialize fonts to a data attribute format
 */
function serializeFonts(fonts?: (string | FontConfig)[]): string | undefined {
  if (!fonts || fonts.length === 0) return undefined;

  // Normalize to FontConfig objects
  const normalized = fonts.map((f) =>
    typeof f === "string" ? { family: f } : f
  );

  return JSON.stringify(normalized);
}

/**
 * Document - Root component for PDF documents
 *
 * Wraps all Page components and defines document-level metadata.
 *
 * @example Basic usage
 * ```tsx
 * <Document title="Invoice" author="Acme Corp">
 *   <Page>
 *     <h1>Invoice #1234</h1>
 *   </Page>
 * </Document>
 * ```
 *
 * @example With Google Fonts (for non-Tailwind users)
 * ```tsx
 * <Document fonts={["Inter", "Roboto Mono"]}>
 *   <Page>
 *     <h1 style={{ fontFamily: "Inter" }}>Hello</h1>
 *   </Page>
 * </Document>
 * ```
 *
 * @example With font weights
 * ```tsx
 * <Document fonts={[{ family: "Inter", weights: [400, 500, 700] }]}>
 *   <Page>...</Page>
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
  fonts,
}: DocumentProps) {
  return (
    <div
      data-pdfx-document
      data-title={title}
      data-author={author}
      data-subject={subject}
      data-keywords={keywords?.join(",")}
      data-language={language}
      data-fonts={serializeFonts(fonts)}
    >
      {children}
    </div>
  );
}
