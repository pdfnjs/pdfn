import type { ReactElement } from "react";
import { render, type RenderOptions } from "./render/render";

const PDFN_CLOUD_URL = "https://api.pdfn.dev";

export interface GenerateFromHtmlOptions {
  /**
   * pdfn server URL for local development or self-hosting.
   * Defaults to PDFN_HOST environment variable.
   * Takes precedence over apiKey if both are set.
   *
   * @example "http://localhost:3456"
   */
  host?: string;

  /**
   * API key for pdfn Cloud.
   * Defaults to PDFN_API_KEY environment variable.
   * Used only if host is not set.
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
 * it to a pdfn server for PDF generation.
 *
 * @example
 * ```tsx
 * import { Document, Page, generate } from '@pdfn/react';
 *
 * // Local development: set PDFN_HOST=http://localhost:3456
 * // Production: set PDFN_API_KEY=pdfn_live_...
 * const pdf = await generate(
 *   <Document title="Hello">
 *     <Page><h1>Hello World</h1></Page>
 *   </Document>
 * );
 *
 * // Or pass options directly:
 * const pdf = await generate(<MyDoc />, { host: 'http://localhost:3456' });
 * const pdf = await generate(<MyDoc />, { apiKey: 'pdfn_live_...' });
 *
 * // Generate HTML for preview (no server needed)
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
  const { output = "pdf", host, apiKey, ...renderOptions } = options;

  // Step 1: Render React to HTML
  const html = await render(element, renderOptions);

  // Step 2: Return HTML or generate PDF
  if (output === "html") {
    return html;
  }

  // Step 3: Generate PDF from HTML via pdfn server
  return generateFromHtml(html, { host, apiKey });
}

/**
 * Generate PDF from pre-rendered HTML
 *
 * Use this when you already have HTML (e.g., from render() or custom templates).
 * For React components, use generate() instead.
 *
 * Requires either:
 * - PDFN_HOST environment variable (local dev server or self-hosted)
 * - PDFN_API_KEY environment variable (pdfn Cloud)
 *
 * @example
 * ```tsx
 * import { render, generateFromHtml } from '@pdfn/react';
 *
 * // Local development (run `npx pdfn dev` first)
 * // Set PDFN_HOST=http://localhost:3456
 * const pdf = await generateFromHtml(html);
 *
 * // Or with pdfn Cloud
 * // Set PDFN_API_KEY=pdfn_live_...
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
  const { host, apiKey } = options;

  // Priority: host option > PDFN_HOST env > apiKey option > PDFN_API_KEY env
  const serverHost = host ?? process.env.PDFN_HOST;
  const cloudKey = apiKey ?? process.env.PDFN_API_KEY;

  // Determine which server to use
  const useLocalServer = !!serverHost;
  const useCloud = !useLocalServer && !!cloudKey;

  if (!useLocalServer && !useCloud) {
    throw new Error(
      `pdfn server configuration required for PDF generation.

Option 1: Local development
  Run: npx pdfn dev
  Set: PDFN_HOST=http://localhost:3456

Option 2: pdfn Cloud
  Get API key at: https://console.pdfn.dev
  Set: PDFN_API_KEY=pdfn_live_...

Option 3: Self-hosting
  See: https://pdfn.dev/docs/self-hosting`
    );
  }

  const url = useLocalServer ? `${serverHost}/v1/generate` : `${PDFN_CLOUD_URL}/v1/generate`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add auth header only for pdfn Cloud
  if (useCloud) {
    headers["Authorization"] = `Bearer ${cloudKey}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ html }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (useLocalServer) {
      throw new Error(
        `Cannot connect to pdfn server at ${serverHost}

${message}

Make sure the server is running:
  npx pdfn dev`
      );
    }
    throw new Error(
      `Cannot connect to pdfn Cloud at ${PDFN_CLOUD_URL}

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

    const serverName = useLocalServer ? "pdfn server" : "pdfn Cloud";
    throw new Error(
      `${serverName} error: ${response.status} ${error.message || response.statusText}`
    );
  }

  return Buffer.from(await response.arrayBuffer());
}
