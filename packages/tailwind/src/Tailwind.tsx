import { type ReactNode, createElement, Fragment } from "react";

/**
 * Tailwind CSS configuration
 * Follows the standard Tailwind config format
 */
export interface TailwindConfig {
  theme?: {
    extend?: Record<string, unknown>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface TailwindProps {
  /** Child elements to render with Tailwind CSS processing */
  children: ReactNode;
  /** Optional Tailwind configuration */
  config?: TailwindConfig;
}

/**
 * Marker attribute used to detect Tailwind wrapper in rendered HTML
 */
export const TAILWIND_MARKER = "data-pdfx-tailwind";

/**
 * Tailwind wrapper component for PDFX
 *
 * Wrap your Page content with this component to enable Tailwind CSS processing.
 * The component renders a hidden marker element that the render() function
 * detects to trigger Tailwind CSS processing.
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
 * @example With custom config
 * ```tsx
 * <Tailwind config={{ theme: { extend: { colors: { brand: '#007bff' } } } }}>
 *   <Page>
 *     <div className="text-brand">Branded content</div>
 *   </Page>
 * </Tailwind>
 * ```
 */
export function Tailwind({ children }: TailwindProps): ReactNode {
  // Render a hidden marker element that render() can detect in the HTML
  // The marker is removed after detection, before final output
  return createElement(
    Fragment,
    null,
    createElement("div", {
      [TAILWIND_MARKER]: "true",
      style: { display: "none" },
    }),
    children
  );
}
