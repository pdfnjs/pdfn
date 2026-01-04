/**
 * Debug utilities for PDFN
 *
 * Provides visual debugging overlays for PDF preview:
 * - Grid overlay (1cm squares)
 * - Margin boundaries
 * - Header/footer highlights
 * - Page number badges
 *
 * @example
 * ```ts
 * import { injectDebugSupport } from '@pdfn/react/debug';
 *
 * const htmlWithDebug = injectDebugSupport(html, { grid: true, margins: true });
 * ```
 */

export interface DebugOptions {
  /** Show 1cm grid overlay */
  grid?: boolean;
  /** Show page and margin boundaries */
  margins?: boolean;
  /** Highlight header/footer regions */
  headers?: boolean;
  /** Show page number badges */
  breaks?: boolean;
}

/**
 * Default debug options (all disabled)
 */
export const DEFAULT_DEBUG_OPTIONS: DebugOptions = {
  grid: false,
  margins: false,
  headers: false,
  breaks: false,
};

/**
 * Debug CSS styles for Paged.js structure visualization
 *
 * Each feature is controlled by a separate class on the <html> element:
 * - pdfn-debug-grid: 1cm grid overlay
 * - pdfn-debug-margins: Page and content boundaries
 * - pdfn-debug-headers: Header/footer highlights
 * - pdfn-debug-breaks: Page number badges
 */
export const PDFN_DEBUG_CSS = `
/* ========================================
   GRID OVERLAY - 1cm squares
   ======================================== */
html.pdfn-debug-grid .pagedjs_sheet::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 99998;
  background-size: 10mm 10mm;
  background-image:
    linear-gradient(to right, rgba(0, 120, 200, 0.15) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 120, 200, 0.15) 1px, transparent 1px);
}

/* Grid scale label */
html.pdfn-debug-grid .pagedjs_margin-top-left-corner-holder {
  position: relative;
}
html.pdfn-debug-grid .pagedjs_margin-top-left-corner-holder::after {
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

/* ========================================
   MARGINS - Page and content boundaries
   ======================================== */
/* Page border on the sheet */
html.pdfn-debug-margins .pagedjs_sheet {
  outline: 2px solid rgba(0, 100, 200, 0.8) !important;
  outline-offset: -2px;
}

/* Content area boundary - red dashed */
html.pdfn-debug-margins .pagedjs_pagebox {
  outline: 1px dashed rgba(255, 0, 0, 0.6) !important;
}

/* Top margin - green */
html.pdfn-debug-margins .pagedjs_margin-top,
html.pdfn-debug-margins .pagedjs_margin-top-left-corner-holder,
html.pdfn-debug-margins .pagedjs_margin-top-right-corner-holder {
  background: rgba(0, 200, 100, 0.1) !important;
}

/* Bottom margin - blue */
html.pdfn-debug-margins .pagedjs_margin-bottom,
html.pdfn-debug-margins .pagedjs_margin-bottom-left-corner-holder,
html.pdfn-debug-margins .pagedjs_margin-bottom-right-corner-holder {
  background: rgba(100, 100, 255, 0.1) !important;
}

/* Left/right margins - orange */
html.pdfn-debug-margins .pagedjs_margin-left,
html.pdfn-debug-margins .pagedjs_margin-right {
  background: rgba(255, 150, 0, 0.1) !important;
  outline: 1px dashed rgba(255, 150, 0, 0.4) !important;
}

/* ========================================
   HEADERS/FOOTERS - Content highlights
   ======================================== */
html.pdfn-debug-headers [data-pdfn-header] {
  background: rgba(0, 200, 100, 0.15);
  outline: 1px dashed rgba(0, 200, 100, 0.5);
}

html.pdfn-debug-headers [data-pdfn-footer] {
  background: rgba(100, 100, 255, 0.15);
  outline: 1px dashed rgba(100, 100, 255, 0.5);
}

/* ========================================
   PAGE NUMBERS - Debug page indicators
   ======================================== */
html.pdfn-debug-breaks .pagedjs_page {
  position: relative;
}
html.pdfn-debug-breaks .pagedjs_page::after {
  content: "Page " attr(data-page-number);
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 11px;
  font-family: system-ui, sans-serif;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 4px;
  z-index: 99999;
  pointer-events: none;
}
`;

/**
 * Build debug classes string from options
 */
function buildDebugClasses(options: DebugOptions): string {
  const classes: string[] = [];
  if (options.grid) classes.push("pdfn-debug-grid");
  if (options.margins) classes.push("pdfn-debug-margins");
  if (options.headers) classes.push("pdfn-debug-headers");
  if (options.breaks) classes.push("pdfn-debug-breaks");
  return classes.join(" ");
}

/**
 * Inject debug overlay into an HTML string
 *
 * Only injects when debug is enabled - no overhead otherwise.
 *
 * @param html - The HTML string to inject debug support into
 * @param options - Debug options (true for defaults, false for none, or specific options)
 * @returns HTML string with debug CSS injected if enabled
 *
 * @example
 * ```ts
 * // Enable specific debug features
 * const debugHtml = injectDebugSupport(html, { grid: true, margins: true });
 *
 * // Enable all debug features
 * const debugHtml = injectDebugSupport(html, {
 *   grid: true,
 *   margins: true,
 *   headers: true,
 *   breaks: true
 * });
 * ```
 */
export function injectDebugSupport(
  html: string,
  options: boolean | DebugOptions = false
): string {
  // Handle boolean for backwards compatibility
  if (options === false) {
    return html;
  }

  const debugOptions: DebugOptions =
    options === true ? DEFAULT_DEBUG_OPTIONS : options;

  // Check if any option is enabled
  const hasAnyOption = Object.values(debugOptions).some((v) => v === true);
  if (!hasAnyOption) {
    return html;
  }

  const debugClasses = buildDebugClasses(debugOptions);
  const cssInjection = `<style id="pdfn-debug-styles">${PDFN_DEBUG_CSS}</style>`;

  let result = html;

  // Add debug classes to html element
  result = result.replace("<html", `<html class="${debugClasses}"`);
  // Handle case where html already has a class
  result = result.replace(
    `class="${debugClasses}" class="`,
    `class="${debugClasses} `
  );

  // Inject CSS before </head>
  if (result.includes("</head>")) {
    result = result.replace("</head>", `${cssInjection}\n</head>`);
  }

  return result;
}
