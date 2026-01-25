/**
 * @pdfn/tailwind - Tailwind CSS support for PDFN
 *
 * Wrap your content with the Tailwind component to enable Tailwind CSS processing.
 *
 * This package self-registers its processor with @pdfn/core when imported,
 * enabling @pdfn/react to process Tailwind CSS without a direct dependency.
 *
 * @example
 * ```tsx
 * import { Document, Page } from '@pdfn/react';
 * import { Tailwind } from '@pdfn/tailwind';
 *
 * export default function Invoice() {
 *   return (
 *     <Document>
 *       <Tailwind>
 *         <Page>
 *           <div className="text-2xl font-bold text-blue-600">
 *             Hello World
 *           </div>
 *         </Page>
 *       </Tailwind>
 *     </Document>
 *   );
 * }
 * ```
 *
 * @example With custom theme
 * ```tsx
 * <Tailwind config={{ theme: { extend: { colors: { brand: '#007bff' } } } }}>
 *   <Page>
 *     <div className="text-brand">Branded content</div>
 *   </Page>
 * </Tailwind>
 * ```
 */

import { registerTailwindProcessor } from "@pdfn/core";
import { processTailwind } from "./process.js";

// Self-register the Tailwind processor with @pdfn/core
// This allows @pdfn/react to use Tailwind processing without importing this package
registerTailwindProcessor(processTailwind);

export { Tailwind, TAILWIND_MARKER, TAILWIND_CSS_ATTR } from "./Tailwind.js";
export type { TailwindConfig, TailwindProps } from "./Tailwind.js";

// Also export the processor for advanced use cases
export { processTailwind } from "./process.js";
export type { ProcessOptions } from "./process.js";
