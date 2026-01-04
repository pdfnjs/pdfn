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
 * @example With Google Fonts
 * ```tsx
 * <Document title="Report" fonts={["Inter", "Roboto Mono"]}>
 *   <Page>
 *     <h1 className="font-[Inter]">Hello</h1>
 *   </Page>
 * </Document>
 * ```
 *
 * @example With specific font weights
 * ```tsx
 * <Document title="Report" fonts={[{ family: "Inter", weights: [400, 500, 700] }]}>
 *   <Page>...</Page>
 * </Document>
 * ```
 *
 * @example With local fonts (embedded as base64)
 * ```tsx
 * <Document title="Report" fonts={[
 *   { family: "CustomFont", src: "./fonts/custom.woff2", weight: 400 },
 *   { family: "CustomFont", src: "./fonts/custom-bold.woff2", weight: 700 },
 * ]}>
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
      data-pdfn-document
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
