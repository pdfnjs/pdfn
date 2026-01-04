import type { ReactElement } from "react";
import { render, type RenderOptions } from "./render/render";
import type { PdfOptions } from "./types";

const DEFAULT_HOST = "http://localhost:3456";

export interface GenerateOptions extends RenderOptions {
  /**
   * Output format
   * - 'pdf': Generate PDF buffer (default)
   * - 'html': Return HTML string for browser preview
   */
  output?: "html" | "pdf";

  /**
   * PDFN server host for PDF generation
   * Defaults to PDFN_HOST environment variable or http://localhost:3456
   */
  host?: string;

  /**
   * PDF-specific options (only used when output is 'pdf')
   */
  pdf?: PdfOptions;
}

/**
 * Generate HTML from a React component
 */
export function generate(
  element: ReactElement,
  options: GenerateOptions & { output: "html" }
): Promise<string>;

/**
 * Generate PDF from a React component
 */
export function generate(
  element: ReactElement,
  options?: GenerateOptions & { output?: "pdf" }
): Promise<Buffer>;

/**
 * Generate HTML or PDF from a React component
 *
 * This is the main function for converting React components to PDF documents.
 * It renders the React element to HTML and either returns the HTML or sends
 * it to the PDFN server for PDF generation.
 *
 * @example
 * ```tsx
 * import { Document, Page, generate } from '@pdfn/react';
 *
 * // Generate PDF (default)
 * const pdf = await generate(
 *   <Document title="Hello">
 *     <Page><h1>Hello World</h1></Page>
 *   </Document>
 * );
 *
 * // Generate HTML for preview
 * const html = await generate(<MyDoc />, { output: 'html' });
 *
 * // Generate PDF with custom host
 * const pdf = await generate(<MyDoc />, { host: 'http://my-server:3456' });
 * ```
 *
 * @param element - React element to render (should be a Document component)
 * @param options - Generation options
 * @returns Promise resolving to HTML string or PDF Buffer based on output option
 */
export async function generate(
  element: ReactElement,
  options: GenerateOptions = {}
): Promise<string | Buffer> {
  const { output = "pdf", host, pdf: pdfOptions, ...renderOptions } = options;

  // Step 1: Render React to HTML
  const html = await render(element, renderOptions);

  // Step 2: Return HTML or generate PDF
  if (output === "html") {
    return html;
  }

  // PDF generation requires PDFN server
  const pdfnHost = host ?? process.env.PDFN_HOST ?? DEFAULT_HOST;

  // POST to PDFN server
  let response: Response;
  try {
    response = await fetch(`${pdfnHost}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html, options: pdfOptions }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(
      `Cannot connect to PDFN server at ${pdfnHost}

${message}

Make sure the server is running:
  npx pdfn serve`
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `PDFN server error: ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  return Buffer.from(await response.arrayBuffer());
}
