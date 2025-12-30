/**
 * Debug utilities for PDFX
 *
 * Provides visual debugging overlays for PDF preview:
 * - Page boundaries
 * - Margin indicators
 * - Grid overlay
 * - Header/footer highlights
 */

/**
 * Debug CSS styles for Paged.js structure visualization
 * Activated by adding 'pdfx-debug' class to the <html> element
 */
export const PDFX_DEBUG_CSS = `
/* Debug mode - targets Paged.js structure */
/* Hidden by default, activated by adding 'pdfx-debug' class to html */

/* Page border on the sheet (full page including margins) */
html.pdfx-debug .pagedjs_sheet {
  outline: 2px solid rgba(0, 100, 200, 0.8) !important;
  outline-offset: -2px;
}

/* Grid overlay on the full page */
html.pdfx-debug .pagedjs_sheet::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 99998;
  background-image:
    repeating-linear-gradient(to right, rgba(0, 120, 200, 0.2) 0, rgba(0, 120, 200, 0.2) 1px, transparent 1px, transparent 10mm),
    repeating-linear-gradient(to bottom, rgba(0, 120, 200, 0.2) 0, rgba(0, 120, 200, 0.2) 1px, transparent 1px, transparent 10mm);
}


/* Grid scale label - plain text in top-left corner */
html.pdfx-debug .pagedjs_margin-top-left-corner-holder {
  position: relative;
}
html.pdfx-debug .pagedjs_margin-top-left-corner-holder::after {
  content: "Grid: 1cm × 1cm";
  position: absolute;
  top: 4px;
  left: 4px;
  color: rgba(0, 100, 200, 0.8);
  font-size: 9px;
  font-family: system-ui, sans-serif;
  font-weight: 500;
  z-index: 99999;
  pointer-events: none;
  white-space: nowrap;
}

/* Margin boundaries - red dashed line around the content area */
html.pdfx-debug .pagedjs_pagebox {
  outline: 1px dashed rgba(255, 0, 0, 0.6) !important;
}

/* Header/footer area indicators in margin boxes */
html.pdfx-debug .pagedjs_margin-top,
html.pdfx-debug .pagedjs_margin-top-left-corner-holder,
html.pdfx-debug .pagedjs_margin-top-right-corner-holder {
  background: rgba(0, 200, 100, 0.1) !important;
}

html.pdfx-debug .pagedjs_margin-bottom,
html.pdfx-debug .pagedjs_margin-bottom-left-corner-holder,
html.pdfx-debug .pagedjs_margin-bottom-right-corner-holder {
  background: rgba(100, 100, 255, 0.1) !important;
}

html.pdfx-debug .pagedjs_margin-left,
html.pdfx-debug .pagedjs_margin-right {
  background: rgba(255, 150, 0, 0.1) !important;
  outline: 1px dashed rgba(255, 150, 0, 0.4) !important;
}

/* Content area header/footer */
html.pdfx-debug [data-pdfx-header] {
  background: rgba(0, 200, 100, 0.15);
  outline: 1px dashed rgba(0, 200, 100, 0.5);
}

html.pdfx-debug [data-pdfx-footer] {
  background: rgba(100, 100, 255, 0.15);
  outline: 1px dashed rgba(100, 100, 255, 0.5);
}

/* Debug legend - only in browser preview, not in PDF */
@media screen {
  html.pdfx-debug body::after {
    content: "DEBUG MODE | Blue border: page edge | Red dashed: content boundary | Green: top margin | Blue: bottom margin | Orange: side margins";
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.9);
    color: #fff;
    font-size: 11px;
    font-family: system-ui, sans-serif;
    padding: 8px 12px;
    z-index: 999999;
  }
}
`;

/**
 * Inject debug overlay into an HTML string
 *
 * Only injects when debug is enabled - no overhead otherwise.
 *
 * @internal Used by generate() - not exported publicly
 * @param html - The HTML string to inject debug support into
 * @param enabled - Whether to enable debug mode (default: false)
 * @returns HTML string, with debug CSS injected if enabled
 */
export function injectDebugSupport(html: string, enabled = false): string {
  if (!enabled) {
    return html;
  }

  const cssInjection = `<style id="pdfx-debug-styles">${PDFX_DEBUG_CSS}</style>`;

  let result = html;

  // Add debug class to html element
  result = result.replace("<html", '<html class="pdfx-debug"');
  // Handle case where html already has a class
  result = result.replace('class="pdfx-debug" class="', 'class="pdfx-debug ');

  // Inject CSS before </head>
  if (result.includes("</head>")) {
    result = result.replace("</head>", `${cssInjection}\n</head>`);
  }

  return result;
}
