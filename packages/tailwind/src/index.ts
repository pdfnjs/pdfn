/**
 * @pdfx-dev/tailwind - Tailwind CSS support for PDFX
 *
 * Wrap your content with the Tailwind component to enable Tailwind CSS processing.
 *
 * @example
 * ```tsx
 * import { Document, Page } from '@pdfx-dev/react';
 * import { Tailwind } from '@pdfx-dev/tailwind';
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

export { Tailwind, TAILWIND_MARKER } from "./Tailwind.js";
export type { TailwindConfig, TailwindProps } from "./Tailwind.js";

// Also export the processor for advanced use cases
export { processTailwind } from "./process.js";
