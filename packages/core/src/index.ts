/**
 * @pdfn/core - Core utilities and constants for pdfn packages
 *
 * This package provides shared functionality used across:
 * - @pdfn/react
 * - @pdfn/client
 * - @pdfn/vite
 * - @pdfn/next
 *
 * @packageDocumentation
 */

// Constants
export {
  PAGE_SIZES,
  type PageSizeName,
  type PageDimensions,
  type PageOrientation,
  getPageDimensions,
  pageDimensionsToCss,
  getPageSizeCss,
  PAGED_JS_CDN,
  PDF_STYLES_PATH,
  TEMPLATES_DIR,
} from "./constants/index.js";

// CSS utilities
export {
  BASE_STYLES,
  type PageConfig,
  generatePageCss,
  extractPageConfig,
} from "./css/index.js";

// Tailwind utilities
export {
  extractClassesFromContent,
  TAILWIND_MARKER,
  TAILWIND_CSS_ATTR,
  TAILWIND_PRECOMPILED_ATTR,
  hasTailwindMarker,
  extractTailwindCssPath,
  extractPrecompiledCss,
  removeTailwindMarker,
} from "./utils/index.js";

// Export parsing utilities
export {
  parseExportsFromCode,
  hasDefaultExport,
  getDefaultExportName,
  hasUseClientDirective,
} from "./utils/index.js";

// HTML generation utilities
export {
  generateClientHtml,
  CLIENT_READY_SCRIPT,
  type ClientHtmlOptions,
} from "./html/index.js";

// Note: compileTailwind is exported from @pdfn/core/tailwind (server-only)
// to avoid bundling Node.js dependencies in browser builds
