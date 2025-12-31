import { type ReactElement } from "react";
import { assembleHtml, type HtmlOptions } from "./html";
import type { RenderOptions, FontConfig } from "../types";
import { debug } from "../utils/debug";

// Dynamic import to avoid Next.js static analysis issues
let renderToStaticMarkup: typeof import("react-dom/server").renderToStaticMarkup;

async function getRenderer() {
  if (!renderToStaticMarkup) {
    const ReactDOMServer = await import("react-dom/server");
    renderToStaticMarkup = ReactDOMServer.renderToStaticMarkup;
  }
  return renderToStaticMarkup;
}

/**
 * Marker attribute used by @pdfx-dev/tailwind to signal Tailwind processing is needed
 */
const TAILWIND_MARKER = "data-pdfx-tailwind";
const TAILWIND_CSS_ATTR = "data-pdfx-tailwind-css";

/**
 * Check if HTML contains the Tailwind marker
 */
function hasTailwindMarker(html: string): boolean {
  return html.includes(TAILWIND_MARKER);
}

/**
 * Extract CSS path from Tailwind marker if present
 */
function extractTailwindCssPath(html: string): string | undefined {
  const match = html.match(new RegExp(`${TAILWIND_CSS_ATTR}="([^"]+)"`));
  return match?.[1];
}

/**
 * Remove the Tailwind marker element from HTML
 */
function removeTailwindMarker(html: string): string {
  // Remove the hidden div with the marker attribute (with or without CSS path)
  return html.replace(/<div data-pdfx-tailwind="true"[^>]*><\/div>/g, "");
}

export interface RenderResult {
  /** The complete HTML string */
  html: string;
  /** Timing metrics */
  metrics: {
    react: number;
    tailwind: number;
    total: number;
  };
}

/**
 * Render a React component to a self-contained HTML string
 *
 * This function takes a React element (typically a Document component)
 * and renders it to a complete HTML document suitable for PDF generation.
 *
 * @example
 * ```tsx
 * import { render, Document, Page } from '@pdfx-dev/react';
 * import { Tailwind } from '@pdfx-dev/tailwind';
 *
 * const html = await render(
 *   <Document title="Invoice">
 *     <Tailwind>
 *       <Page>
 *         <h1 className="text-2xl font-bold">Invoice #001</h1>
 *       </Page>
 *     </Tailwind>
 *   </Document>
 * );
 * ```
 *
 * @param element - React element to render (should be a Document component)
 * @param options - Render options
 * @returns Promise resolving to the complete HTML string
 */
export async function render(
  element: ReactElement,
  options: RenderOptions = {}
): Promise<string> {
  const startTime = performance.now();

  // 1. Render React to static HTML
  const reactStart = performance.now();
  const renderer = await getRenderer();
  let content = renderer(element);
  const reactTime = performance.now() - reactStart;

  // 2. Extract metadata from Document component props
  const metadata = extractMetadata(element);

  // 3. Check for Tailwind marker and process if found
  const tailwindStart = performance.now();
  let tailwindCss = "";

  if (hasTailwindMarker(content)) {
    try {
      // Extract CSS path from marker if provided
      const cssPath = extractTailwindCssPath(content);

      // Dynamically import @pdfx-dev/tailwind to process the CSS
      const { processTailwind } = await import("@pdfx-dev/tailwind");
      tailwindCss = await processTailwind(content, { cssPath });
      debug(`tailwind: processed via marker detection${cssPath ? ` (css: ${cssPath})` : ""}`);

      // Remove the marker element from the content
      content = removeTailwindMarker(content);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      debug(`tailwind: processor error - ${message}`);
      // Still remove the marker even if processing fails
      content = removeTailwindMarker(content);
    }
  } else {
    debug("tailwind: no marker found");
  }
  const tailwindTime = performance.now() - tailwindStart;

  // 4. Extract fonts from Document if present
  const fonts = extractFonts(content);

  // 5. Assemble final HTML
  const htmlOptions: HtmlOptions = {
    metadata,
    css: tailwindCss,
    includePagedJs: true,
    fonts,
  };

  const html = assembleHtml(content, htmlOptions);
  const totalTime = performance.now() - startTime;

  debug(
    `render: ${Math.round(totalTime)}ms (react: ${Math.round(reactTime)}ms, tailwind: ${Math.round(tailwindTime)}ms)`
  );

  return html;
}

/**
 * Extract metadata from Document component props
 */
function extractMetadata(element: ReactElement): HtmlOptions["metadata"] {
  // Check if element is a Document component
  if (element.props) {
    const { title, author, subject, keywords, language } = element.props as {
      title?: string;
      author?: string;
      subject?: string;
      keywords?: string[];
      language?: string;
    };
    return { title, author, subject, keywords, language };
  }
  return {};
}

/**
 * Extract fonts from rendered HTML content (from Document's data-fonts attribute)
 */
function extractFonts(html: string): FontConfig[] {
  const match = html.match(/data-fonts="([^"]+)"/);
  if (!match || !match[1]) return [];

  try {
    // Decode HTML entities and parse JSON
    const encoded = match[1];
    const decoded = encoded
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
    return JSON.parse(decoded) as FontConfig[];
  } catch {
    debug("fonts: failed to parse fonts data attribute");
    return [];
  }
}

export { type RenderOptions };
