import { type ReactElement } from "react";
import { render } from "./render/render";
import type { GenerateOptions } from "./types";

/**
 * Generate a PDF from a React component
 *
 * This function renders a React element to HTML and sends it to a PDFX server
 * for PDF generation. The server must be running (via `npx @pdfx-dev/cli dev` or
 * `npx @pdfx-dev/cli serve`).
 *
 * @example
 * ```tsx
 * import { generate, Document, Page } from '@pdfx-dev/react';
 *
 * // Requires PDFX_HOST environment variable or options.host
 * const pdf = await generate(
 *   <Document title="Invoice">
 *     <Page>
 *       <h1>Invoice #001</h1>
 *     </Page>
 *   </Document>
 * );
 *
 * // Save to file
 * fs.writeFileSync('invoice.pdf', pdf);
 * ```
 *
 * @param element - React element to render (should be a Document component)
 * @param options - Generation options including host and PDF settings
 * @returns Promise resolving to PDF Buffer
 * @throws Error if PDFX_HOST is not set and options.host is not provided
 */
export async function generate(
  element: ReactElement,
  options: GenerateOptions = {}
): Promise<Buffer> {
  const host = options.host ?? process.env.PDFX_HOST;

  if (!host) {
    throw new Error(
      `PDFX_HOST is required.

Set it to a PDFX server:
  • Development: PDFX_HOST=http://localhost:3456 (run: npx @pdfx-dev/cli dev)
  • Production:  PDFX_HOST=http://your-server:3456 (Docker)

Or use render() directly with your own Puppeteer setup:
  import { render } from '@pdfx-dev/react';
  const html = await render(<Component />);`
    );
  }

  // Render React to HTML
  const html = await render(element, options.render);

  // POST to server for PDF generation
  const response = await fetch(`${host}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      html,
      options: options.pdf,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `PDFX server error: ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
