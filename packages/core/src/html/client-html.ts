/**
 * Client-side HTML generation for React rendering in browser
 *
 * Used by both @pdfn/client and @pdfn/next for generating HTML
 * that renders React components client-side (for "use client" components).
 */

import { BASE_STYLES, generatePageCss, type PageConfig } from "../css/index.js";
import { PAGED_JS_CDN } from "../constants/index.js";

/**
 * Options for generating client-render HTML
 */
export interface ClientHtmlOptions {
  /** The bundled JavaScript code (IIFE that renders React) */
  bundleCode: string;
  /** Document title */
  title?: string;
  /** CSS to include in the document (e.g., pre-compiled Tailwind) */
  css?: string;
  /** Props to inject via window.__PDFN_PROPS__ (optional) */
  props?: Record<string, unknown>;
  /** Paged.js URL (defaults to CDN) */
  pagedJsUrl?: string;
  /** Page configuration for @page CSS */
  pageConfig?: PageConfig;
  /** HTML language attribute */
  lang?: string;
}

/**
 * The PDFN ready state script for client-side rendering.
 *
 * This script:
 * 1. Prevents Paged.js from auto-running (PagedConfig.auto = false)
 * 2. Provides window.PDFN.signalReactReady() for React to call after render
 * 3. Triggers Paged.js pagination after React is ready
 * 4. Waits for fonts to load before signaling final ready state
 */
export const CLIENT_READY_SCRIPT = `
    window.PDFN = {
      ready: false,
      reactReady: false,
      pagedReady: false,

      checkReady: function() {
        if (this.reactReady && this.pagedReady) {
          this.ready = true;
          console.log("[pdfn] Document ready for PDF generation");
        }
      },

      // Called by React bundle when rendering is complete
      signalReactReady: function() {
        this.reactReady = true;
        console.log("[pdfn] React render complete, starting Paged.js");
        // Now trigger Paged.js pagination
        if (window.PagedPolyfill) {
          window.PagedPolyfill.preview().then(function() {
            window.PDFN.pagedReady = true;
            // Wait for fonts to load before signaling ready
            document.fonts.ready.then(function() {
              window.PDFN.checkReady();
            });
          }).catch(function(err) {
            console.error("[pdfn] Paged.js error:", err);
            window.PDFN.pagedReady = true;
            window.PDFN.checkReady();
          });
        } else {
          console.warn("[pdfn] PagedPolyfill not available");
          this.pagedReady = true;
          this.checkReady();
        }
      }
    };
`;

/**
 * Generate a complete HTML document for client-side React rendering.
 *
 * The generated HTML includes:
 * - A #pdfn-root container for React to render into
 * - The bundled JavaScript (React + components)
 * - Paged.js for pagination (with auto-run disabled)
 * - PDFN ready state management
 * - Optional props injection via window.__PDFN_PROPS__
 *
 * @param options - HTML generation options
 * @returns Complete HTML document string
 *
 * @example
 * ```typescript
 * const html = generateClientHtml({
 *   bundleCode: bundledReactApp,
 *   title: 'Invoice',
 *   css: tailwindCss,
 *   props: { invoiceData },
 *   pageConfig: { width: '210mm', height: '297mm', margin: '1in' }
 * });
 * ```
 */
export function generateClientHtml(options: ClientHtmlOptions): string {
  const {
    bundleCode,
    title = "Document",
    css = "",
    props,
    pagedJsUrl = PAGED_JS_CDN,
    pageConfig,
    lang = "en",
  } = options;

  const pageCss = generatePageCss(pageConfig);

  // Optional props injection script
  const propsScript = props
    ? `\n    // Props passed from server\n    window.__PDFN_PROPS__ = ${JSON.stringify(props)};`
    : "";

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
${pageCss}
${BASE_STYLES}
${css}
  </style>
  <script>
    // Prevent Paged.js from auto-running - we'll trigger it after React renders
    window.PagedConfig = { auto: false };
  </script>
  <script src="${pagedJsUrl}"></script>
  <script>${propsScript}

    // PDFN ready state management
${CLIENT_READY_SCRIPT}
  </script>
</head>
<body>
  <div id="pdfn-root"></div>
  <script>
${bundleCode}
  </script>
</body>
</html>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
