import type { ReactElement } from "react";
import { render, type RenderOptions, type PdfOptions } from "@pdfn/react";
import { injectDebugSupport, type DebugOptions } from "./debug";

export interface GenerateOptions extends RenderOptions {
  /**
   * Output format
   * - 'pdf': Generate PDF buffer (default)
   * - 'html': Return HTML string for browser preview
   */
  output?: "html" | "pdf";

  /**
   * Enable debug mode (shows page boundaries, margins, grid)
   * Works for both HTML and PDF output
   * Can be a boolean (true enables all) or an object with specific options
   */
  debug?: boolean | DebugOptions;

  /**
   * PDFN server host (required for PDF output)
   * Defaults to PDFN_HOST environment variable
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
 * It renders the React element to HTML, optionally injects debug overlays,
 * and either returns the HTML or sends it to the PDFN server for PDF generation.
 *
 * @example
 * ```tsx
 * import { Document, Page } from '@pdfn/react';
 * import { generate } from 'pdfn';
 *
 * // Generate PDF (default)
 * const pdf = await generate(
 *   <Document>
 *     <Page><h1>Hello World</h1></Page>
 *   </Document>
 * );
 *
 * // Generate PDF with debug overlay
 * const pdfDebug = await generate(<MyDoc />, { debug: true });
 *
 * // Generate HTML for preview
 * const html = await generate(<MyDoc />, { output: 'html', debug: true });
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
  const {
    output = "pdf",
    debug = false,
    host,
    pdf: pdfOptions,
    ...renderOptions
  } = options;

  // Step 1: Render React to HTML
  const rawHtml = await render(element, renderOptions);

  // Step 2: Inject debug support (always inject, enable based on debug flag)
  const html = injectDebugSupport(rawHtml, debug);

  // Step 3: Return HTML or generate PDF
  if (output === "html") {
    return html;
  }

  // PDF generation requires PDFN server
  const pdfnHost = host ?? process.env.PDFN_HOST;

  if (!pdfnHost) {
    throw new Error(
      `PDFN_HOST is required for PDF generation.

Set it to a PDFN server:
  • Development: PDFN_HOST=http://localhost:3456 (run: npx pdfn dev)
  • Production:  PDFN_HOST=http://your-server:3456 (Docker)

Or use output: 'html' to get HTML without a server:
  const html = await generate(<MyDoc />, { output: 'html' });`
    );
  }

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
