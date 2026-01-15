import type { ReactElement } from "react";
import { render, type RenderOptions } from "./render/render";

const DEFAULT_HOST = "http://localhost:3456";

export interface GenerateFromHtmlOptions {
  /**
   * pdfn server host for PDF generation
   * Defaults to PDFN_HOST environment variable or http://localhost:3456
   */
  host?: string;
}

export interface GenerateOptions extends RenderOptions, GenerateFromHtmlOptions {
  /**
   * Output format
   * - 'pdf': Generate PDF buffer (default)
   * - 'html': Return HTML string for browser preview
   */
  output?: "html" | "pdf";
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
 * it to the pdfn server for PDF generation.
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
 * // Generate PDF with debug overlays
 * const pdf = await generate(<MyDoc />, { debug: { grid: true, margins: true } });
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
  const { output = "pdf", host, ...renderOptions } = options;

  // Step 1: Render React to HTML
  const html = await render(element, renderOptions);

  // Step 2: Return HTML or generate PDF
  if (output === "html") {
    return html;
  }

  // Step 3: Generate PDF from HTML
  return generateFromHtml(html, { host });
}

/**
 * Generate PDF from pre-rendered HTML
 *
 * Use this when you already have HTML (e.g., from renderTemplate or client-side bundling).
 * For React components, use generate() instead.
 *
 * @example
 * ```tsx
 * import { generateFromHtml } from '@pdfn/react';
 *
 * // When you have pre-rendered HTML
 * const html = await renderTemplate('invoice', { props: {} });
 * const pdf = await generateFromHtml(html);
 * ```
 *
 * @param html - Pre-rendered HTML string
 * @param options - Generation options
 * @returns Promise resolving to PDF Buffer
 */
export async function generateFromHtml(
  html: string,
  options: GenerateFromHtmlOptions = {}
): Promise<Buffer> {
  const { host } = options;
  const pdfnHost = host ?? process.env.PDFN_HOST ?? DEFAULT_HOST;

  // Build multipart form data
  const form = new FormData();
  form.append("files", new Blob([html], { type: "text/html" }), "index.html");
  form.append("waitForExpression", "window.PDFN.ready===true");
  form.append("preferCssPageSize", "true");
  form.append("printBackground", "true");

  // POST to pdfn server
  let response: Response;
  try {
    response = await fetch(`${pdfnHost}/forms/chromium/convert/html`, {
      method: "POST",
      body: form,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(
      `Cannot connect to pdfn server at ${pdfnHost}

${message}

Start the server with:
  npx pdfn serve`
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `pdfn server error: ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  return Buffer.from(await response.arrayBuffer());
}
