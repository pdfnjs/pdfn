import { type ReactElement } from "react";
import { assembleHtml, type HtmlOptions } from "./html";
import { processImages } from "./images";
import { processCssFontFaces } from "./fonts";
import { injectDebugSupport } from "../debug";
import type { RenderOptions, FontConfig } from "../types";
import { debug } from "../utils/debug";
import { isBrowser, EdgeErrors } from "../utils/runtime";

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
 * Marker attribute used by @pdfn/tailwind to signal Tailwind processing is needed
 */
const TAILWIND_MARKER = "data-pdfn-tailwind";
const TAILWIND_CSS_ATTR = "data-pdfn-tailwind-css";
const TAILWIND_PRECOMPILED_ATTR = "data-pdfn-tailwind-precompiled";

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
 * Extract pre-compiled CSS from Tailwind marker if present (base64 encoded)
 */
function extractPrecompiledCss(html: string): string | undefined {
  const match = html.match(new RegExp(`${TAILWIND_PRECOMPILED_ATTR}="([^"]+)"`));
  if (match?.[1]) {
    try {
      // Decode base64
      return Buffer.from(match[1], "base64").toString("utf8");
    } catch {
      debug("tailwind: failed to decode pre-compiled CSS");
      return undefined;
    }
  }
  return undefined;
}

/**
 * Remove the Tailwind marker element from HTML
 */
function removeTailwindMarker(html: string): string {
  // Remove the hidden div with the marker attribute (with or without CSS path)
  return html.replace(/<div data-pdfn-tailwind="true"[^>]*><\/div>/g, "");
}

/**
 * Document CSS marker attribute
 */
const DOCUMENT_CSS_ATTR = "data-pdfn-css";

/**
 * Extract Document CSS from data attribute (base64 encoded)
 */
function extractDocumentCss(html: string): string | undefined {
  const match = html.match(new RegExp(`${DOCUMENT_CSS_ATTR}="([^"]+)"`));
  if (match?.[1]) {
    try {
      // Decode base64
      return Buffer.from(match[1], "base64").toString("utf8");
    } catch {
      debug("document-css: failed to decode base64");
      return undefined;
    }
  }
  return undefined;
}

/**
 * Remove Document CSS data attribute from content
 */
function removeDocumentCssAttr(html: string): string {
  return html.replace(new RegExp(`\\s*${DOCUMENT_CSS_ATTR}="[^"]*"`, "g"), "");
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
 * **Edge-compatible**: Works on Node.js, Vercel Edge, Cloudflare Workers, etc.
 * - Remote images and fonts work everywhere
 * - Local images/fonts require Node.js (helpful errors on edge)
 * - Runtime Tailwind processing requires Node.js (use build-time plugin for edge)
 *
 * @example
 * ```tsx
 * import { render, Document, Page } from '@pdfn/react';
 * import { Tailwind } from '@pdfn/tailwind';
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
  // Check for browser environment - render() must run on server
  if (isBrowser()) {
    throw new Error(
      `render() can only be used on the server.\n\n` +
        `This function uses react-dom/server which is not available in browsers.\n` +
        `If you're using Next.js, ensure this code runs in a Server Component or API route.`
    );
  }

  const startTime = performance.now();

  // 1. Render React to static HTML
  const reactStart = performance.now();
  const renderer = await getRenderer();
  let content: string;

  try {
    content = renderer(element);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(
      `Failed to render React component: ${message}\n\n` +
        `Common causes:\n` +
        `  - Using async components (not supported in static rendering)\n` +
        `  - Component threw during render\n` +
        `  - Invalid React element passed to render()`
    );
  }

  const reactTime = performance.now() - reactStart;

  // 2. Extract metadata from Document component props
  const metadata = extractMetadata(element);

  // 3. Check for Tailwind marker and process if found
  const tailwindStart = performance.now();
  let tailwindCss = "";

  if (hasTailwindMarker(content)) {
    // First, check for pre-compiled CSS (from @pdfn/vite plugin)
    // This is edge-safe - no filesystem access needed
    const precompiledCss = extractPrecompiledCss(content);

    if (precompiledCss) {
      // Use pre-compiled CSS directly (edge-safe)
      tailwindCss = precompiledCss;
      debug("tailwind: using pre-compiled CSS from @pdfn/vite plugin");

      // Process @font-face declarations in CSS - embed local fonts as base64
      // This is edge-safe: only throws if local fonts are detected
      tailwindCss = await processCssFontFaces(tailwindCss);

      // Remove the marker element from the content
      content = removeTailwindMarker(content);
    } else {
      // Fall back to runtime processing (Node.js only)
      try {
        // Extract CSS path from marker if provided
        const cssPath = extractTailwindCssPath(content);

        // Dynamically import @pdfn/tailwind to process the CSS
        // This will throw a helpful error on edge runtimes
        const { processTailwind } = await import("@pdfn/tailwind");
        tailwindCss = await processTailwind(content, { cssPath });
        debug(`tailwind: processed via runtime${cssPath ? ` (css: ${cssPath})` : ""}`);

        // Process @font-face declarations in CSS - embed local fonts as base64
        // This is edge-safe: only throws if local fonts are detected
        tailwindCss = await processCssFontFaces(tailwindCss);

        // Remove the marker element from the content
        content = removeTailwindMarker(content);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";

        // Check if this is an edge runtime error from @pdfn/tailwind
        if (message.includes("Edge runtimes") || message.includes("filesystem access")) {
          throw new Error(EdgeErrors.tailwindRuntime());
        }

        debug(`tailwind: processor error - ${message}`);
        // Still remove the marker even if processing fails
        content = removeTailwindMarker(content);
      }
    }
  } else {
    debug("tailwind: no marker found");
    // FIXME: Add plain CSS bundling support for templates without <Tailwind> wrapper
    // Currently, templates must use <Tailwind> to get CSS from pdfn-templates/styles.css
    // See: https://github.com/pdfnjs/pdfn/issues/XXX
  }
  const tailwindTime = performance.now() - tailwindStart;

  // 4. Process images - embed relative paths as base64
  // Edge-safe: only throws if local images are detected
  const imagesStart = performance.now();
  content = await processImages(content);
  const imagesTime = performance.now() - imagesStart;

  // 5. Extract Document CSS (css prop)
  const documentCssStart = performance.now();
  const documentCss = extractDocumentCss(content) || "";

  // Remove CSS data attribute from content
  content = removeDocumentCssAttr(content);
  const documentCssTime = performance.now() - documentCssStart;

  // 6. Extract fonts from Document if present
  const fonts = extractFonts(content);

  // 7. Combine Tailwind + Document CSS (Document CSS comes after for higher priority)
  const combinedCss = [tailwindCss, documentCss].filter(Boolean).join("\n\n");

  // 8. Assemble final HTML
  const htmlOptions: HtmlOptions = {
    metadata,
    css: combinedCss,
    includePagedJs: true,
    fonts,
  };

  let html = await assembleHtml(content, htmlOptions);

  // 9. Apply debug overlays if requested
  if (options.debug) {
    html = injectDebugSupport(html, options.debug);
    debug("render: debug overlays applied");
  }

  const totalTime = performance.now() - startTime;

  debug(
    `render: ${Math.round(totalTime)}ms (react: ${Math.round(reactTime)}ms, tailwind: ${Math.round(tailwindTime)}ms, images: ${Math.round(imagesTime)}ms, css: ${Math.round(documentCssTime)}ms)`
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
