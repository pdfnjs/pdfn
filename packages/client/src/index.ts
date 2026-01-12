/**
 * @pdfn/client - Client-side rendering support for pdfn
 *
 * This package enables rendering of "use client" components (like Recharts)
 * in PDF documents. It works by bundling React + components and running them
 * in Puppeteer's browser environment where hooks execute normally.
 *
 * @example
 * ```tsx
 * // Typically used automatically by @pdfn/react
 * import { findClientComponents, renderForClient } from '@pdfn/client';
 *
 * const { hasClient, sources } = findClientComponents(<Report />);
 * if (hasClient) {
 *   const html = await renderForClient(<Report />, { clientSources: sources });
 * }
 * ```
 *
 * @packageDocumentation
 */

// Detection
export { findClientComponents, hasClientComponents } from "./detect.js";

// Bundling
export { bundleForClient, getComponentName } from "./bundle.js";

// HTML generation
export { generateClientHtml } from "./html.js";
export type { ClientHtmlOptions } from "./html.js";

// Main render function
export { renderForClient } from "./render.js";

// Types
export type {
  MarkedComponent,
  PdfnReactElement,
  ClientComponentInfo,
  RenderForClientOptions,
  BundleOptions,
} from "./types.js";
