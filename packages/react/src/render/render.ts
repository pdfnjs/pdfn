import React, { Children, isValidElement, type ReactElement } from "react";
import { assembleHtml, type HtmlOptions } from "./html";
import { processImages } from "./images";
import { processCssFontFaces } from "./fonts";
import { injectDebugSupport } from "../debug";
import type { RenderOptions, FontConfig } from "../types";
import { debug } from "../utils/debug";
import { isBrowser, EdgeErrors } from "../utils/runtime";
import {
  hasTailwindMarker,
  extractTailwindCssPath,
  extractPrecompiledCss,
  removeTailwindMarker,
} from "@pdfn/core";

/**
 * Interface for components marked by the pdfn client marker plugin
 */
interface MarkedComponent {
  __pdfn_client?: boolean;
  __pdfn_source?: string;
}

/**
 * Interface for templates marked by the pdfn template marker plugin
 */
interface MarkedTemplate {
  __pdfn_template_source?: string;
}

/**
 * Result of scanning a React element tree for client components
 */
interface ClientComponentInfo {
  hasClient: boolean;
  sources: string[];
  templateSource?: string;
}

/**
 * Recursively scan a React element tree for client components.
 * Client components are marked at build time by the pdfn Vite plugin.
 * Also checks if the root element is a marked template.
 */
function findClientComponents(element: ReactElement): ClientComponentInfo {
  const sources: string[] = [];
  const seen = new Set<string>();
  let templateSource: string | undefined;

  function isMarkedClientComponent(type: unknown): type is MarkedComponent {
    if (!type || typeof type !== "function") return false;
    const marked = type as MarkedComponent;
    return marked.__pdfn_client === true && typeof marked.__pdfn_source === "string";
  }

  function isMarkedTemplate(type: unknown): type is MarkedTemplate {
    if (!type || typeof type !== "function") return false;
    const marked = type as MarkedTemplate;
    return typeof marked.__pdfn_template_source === "string";
  }

  // Debug: Check root element type and markers
  if (isValidElement(element)) {
    const type = element.type;
    debug(
      `client-detect: root element type=${typeof type}, isFunction=${typeof type === "function"}`
    );
    if (typeof type === "function") {
      const fn = type as MarkedComponent & MarkedTemplate;
      debug(
        `client-detect: root markers - __pdfn_template_source=${fn.__pdfn_template_source}, __pdfn_client=${fn.__pdfn_client}`
      );
    }
  }

  // Check if root element is a marked template
  if (isValidElement(element) && isMarkedTemplate(element.type)) {
    templateSource = (element.type as MarkedTemplate).__pdfn_template_source;
    debug(`client-detect: found template source: ${templateSource}`);
  }

  function traverse(el: ReactElement | null | undefined): void {
    if (!el || !isValidElement(el)) return;

    // Debug: log component types being traversed
    const type = el.type;
    if (typeof type === "function") {
      const fn = type as MarkedComponent;
      if (fn.__pdfn_client) {
        debug(`client-detect: found client component: ${fn.__pdfn_source}`);
      }
    }

    // Check if this component is marked as client
    if (isMarkedClientComponent(el.type)) {
      const source = (el.type as MarkedComponent).__pdfn_source!;
      if (!seen.has(source)) {
        seen.add(source);
        sources.push(source);
      }
    }

    // Recursively check children
    const props = el.props as { children?: React.ReactNode };
    const children = props?.children;
    if (children) {
      Children.toArray(children).forEach((child) => {
        if (isValidElement(child)) {
          traverse(child as ReactElement);
        }
      });
    }
  }

  traverse(element);
  debug(`client-detect: result - hasClient=${sources.length > 0}, sources=${sources.length}, templateSource=${templateSource || "none"}`);
  return { hasClient: sources.length > 0, sources, templateSource };
}

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
 * Check if SSR output contains unrendered Recharts components.
 * Recharts renders as empty wrapper divs with SSR because it requires browser APIs.
 */
function hasUnrenderedRecharts(html: string): boolean {
  // Recharts renders empty wrappers like:
  // <div class="recharts-wrapper" style="position:relative;...">
  // with no SVG content inside when rendered with SSR
  return html.includes('class="recharts-wrapper"') && !html.includes("<svg");
}

/**
 * Delegate rendering to @pdfn/client for client-side execution.
 * Used when templates contain components that need browser APIs (like Recharts).
 */
async function delegateToClientRenderer(
  element: ReactElement,
  options: { templateSource?: string; sources: string[]; ssrContent?: string }
): Promise<string> {
  const { templateSource, sources, ssrContent } = options;

  try {
    // Dynamic import to avoid making @pdfn/client a required dependency
    // Note: Path is constructed at runtime to prevent Turbopack from statically analyzing it
    const clientModule = "@pdfn" + "/" + "client";
    const { renderForClient } = await import(/* webpackIgnore: true */ clientModule);

    // Extract metadata for the HTML
    const metadata = extractMetadata(element);

    // Process Tailwind CSS if SSR content has the marker
    let css = "";
    if (ssrContent && hasTailwindMarker(ssrContent)) {
      // First check for pre-compiled CSS
      const precompiledCss = extractPrecompiledCss(ssrContent);
      if (precompiledCss) {
        css = precompiledCss;
        debug("client-delegate: using pre-compiled Tailwind CSS");
      } else {
        // Try runtime processing
        try {
          const cssPath = extractTailwindCssPath(ssrContent);
          const { processTailwind } = await import("@pdfn/tailwind");
          css = await processTailwind(ssrContent, { cssPath });
          debug("client-delegate: processed Tailwind CSS via runtime");
        } catch (e) {
          debug(`client-delegate: Tailwind processing failed: ${e}`);
        }
      }

      // Also extract Document CSS if present
      const documentCss = extractDocumentCss(ssrContent);
      if (documentCss) {
        css = css ? `${css}\n\n${documentCss}` : documentCss;
      }
    }

    return renderForClient(element, {
      // Prefer templateSource (bundles entire template with default export)
      // Fall back to clientSources (individual client components)
      templateSource,
      clientSources: templateSource ? undefined : sources,
      props: element.props as Record<string, unknown>,
      title: metadata?.title,
      css,
      // Pass SSR content for page config extraction
      ssrContent,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // Check if @pdfn/client is not installed
    if (message.includes("Cannot find module") || message.includes("@pdfn/client")) {
      throw new Error(
        `Client components detected but @pdfn/client is not installed.\n\n` +
          `Your template uses "use client" components (like Recharts) that require ` +
          `client-side rendering. To enable this:\n\n` +
          `  npm install @pdfn/client\n\n` +
          `Also ensure the pdfn plugin is configured:\n\n` +
          `  // vite.config.ts\n` +
          `  import { pdfn } from '@pdfn/vite';\n` +
          `  export default { plugins: [pdfn()] };\n\n` +
          `  // next.config.ts\n` +
          `  import { withPdfn } from '@pdfn/next';\n` +
          `  export default withPdfn()(nextConfig);`
      );
    }

    throw error;
  }
}

// Tailwind marker utilities are now imported from @pdfn/core

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

  // 0. Check for client components (marked by @pdfn/vite plugin)
  const { hasClient, sources, templateSource } = findClientComponents(element);

  // If client components were found in the static tree, delegate to client rendering
  // But first do SSR to get Tailwind CSS markers
  if (hasClient) {
    debug(`render: found ${sources.length} client component(s) in tree, delegating to @pdfn/client`);
    // Quick SSR to extract Tailwind CSS (the actual content won't be used)
    const renderer = await getRenderer();
    let ssrContent = "";
    try {
      ssrContent = renderer(element);
    } catch {
      // SSR failed, continue without CSS
      debug("render: SSR for CSS extraction failed, continuing without");
    }
    return delegateToClientRenderer(element, { templateSource, sources, ssrContent });
  }

  // 1. Render React to static HTML (standard SSR path)
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

  // 1b. Check if SSR output contains unrendered client components (like Recharts)
  // If so, delegate to client rendering for proper execution
  if (hasUnrenderedRecharts(content) && templateSource) {
    debug("render: detected unrendered Recharts in SSR output, delegating to @pdfn/client");
    return delegateToClientRenderer(element, { templateSource, sources: [], ssrContent: content });
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
