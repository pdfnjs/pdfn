import type { ReactElement } from "react";
import { render, type RenderOptions } from "./render/render";

const PDFN_API_URL = "https://api.pdfn.dev";

export interface GenerateFromHtmlOptions {
  /**
   * API key for pdfn Cloud
   * Defaults to PDFN_API_KEY environment variable
   */
  apiKey?: string;
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
 * it to pdfn Cloud for PDF generation.
 *
 * @example
 * ```tsx
 * import { Document, Page, generate } from '@pdfn/react';
 *
 * // Set PDFN_API_KEY environment variable, then:
 * const pdf = await generate(
 *   <Document title="Hello">
 *     <Page><h1>Hello World</h1></Page>
 *   </Document>
 * );
 *
 * // Or pass API key directly:
 * const pdf = await generate(<MyDoc />, { apiKey: 'pdfn_...' });
 *
 * // Generate HTML for preview (no API key needed)
 * const html = await generate(<MyDoc />, { output: 'html' });
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
  const { output = "pdf", apiKey, ...renderOptions } = options;

  // Step 1: Render React to HTML
  const html = await render(element, renderOptions);

  // Step 2: Return HTML or generate PDF
  if (output === "html") {
    return html;
  }

  // Step 3: Generate PDF from HTML via pdfn Cloud
  return generateFromHtml(html, { apiKey });
}

/**
 * Generate PDF from pre-rendered HTML
 *
 * Use this when you already have HTML (e.g., from render() or custom templates).
 * For React components, use generate() instead.
 *
 * Requires a pdfn API key. Get one at https://console.pdfn.dev
 *
 * @example
 * ```tsx
 * import { render, generateFromHtml } from '@pdfn/react';
 *
 * // When you have pre-rendered HTML
 * const html = await render(<Invoice data={data} />);
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
  const { apiKey } = options;
  const key = apiKey ?? process.env.PDFN_API_KEY;

  if (!key) {
    throw new Error(
      `pdfn API key required for PDF generation.

Get your API key at: https://console.pdfn.dev

Then either:
  1. Set PDFN_API_KEY environment variable
  2. Pass apiKey option: generate(<Doc />, { apiKey: '...' })

For local development preview, use:
  npx pdfn dev

For self-hosting, see:
  https://pdfn.dev/docs/self-hosting`
    );
  }

  // POST to pdfn Cloud API
  let response: Response;
  try {
    response = await fetch(`${PDFN_API_URL}/v1/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ html }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(
      `Cannot connect to pdfn Cloud at ${PDFN_API_URL}

${message}

Check your network connection or try again later.
Status: https://status.pdfn.dev`
    );
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));

    if (response.status === 401) {
      throw new Error(
        `Invalid API key. Check your PDFN_API_KEY or get a new one at https://console.pdfn.dev`
      );
    }

    if (response.status === 429) {
      throw new Error(
        `Rate limit exceeded. Upgrade your plan at https://console.pdfn.dev/billing`
      );
    }

    throw new Error(
      `pdfn Cloud error: ${response.status} ${error.message || response.statusText}`
    );
  }

  return Buffer.from(await response.arrayBuffer());
}
