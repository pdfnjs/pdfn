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
 * Base64 encode a string for safe data attribute storage.
 * Handles CSS with quotes, newlines, and special characters.
 */
function encodeForDataAttr(value: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value).toString("base64");
  }
  // Fallback for environments without Buffer (edge, browser)
  // Handle Unicode characters properly
  return btoa(unescape(encodeURIComponent(value)));
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
 *
 * @example With custom CSS
 * ```tsx
 * <Document title="Invoice" css={`
 *   .invoice-header { border-bottom: 2px solid blue; }
 * `}>
 *   <Page>...</Page>
 * </Document>
 * ```
 *
 * @example With external CSS file
 * ```tsx
 * <Document title="Invoice" cssFile="./styles/invoice.css">
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
  css,
  cssFile,
}: DocumentProps) {
  // Base64 encode CSS for safe storage in data attribute
  const encodedCss = css ? encodeForDataAttr(css) : undefined;

  return (
    <div
      data-pdfn-document
      data-title={title}
      data-author={author}
      data-subject={subject}
      data-keywords={keywords?.join(",")}
      data-language={language}
      data-fonts={serializeFonts(fonts)}
      data-pdfn-css={encodedCss}
      data-pdfn-css-file={cssFile}
    >
      {children}
    </div>
  );
}
