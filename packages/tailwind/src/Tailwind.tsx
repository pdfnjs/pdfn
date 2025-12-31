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
  /**
   * Path to your CSS file that contains Tailwind imports and theme customizations.
   *
   * Your CSS file should look like:
   * ```css
   * @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
   * @import "tailwindcss";
   *
   * @theme {
   *   --font-inter: "Inter", var(--font-sans);
   *   --color-brand: #007bff;
   * }
   * ```
   *
   * If not provided, will auto-detect from common locations:
   * - ./src/app/globals.css
   * - ./src/styles/globals.css
   * - ./app/globals.css
   * - ./styles/tailwind.css
   *
   * Falls back to vanilla Tailwind if no CSS file found.
   */
  css?: string;
}

/**
 * Marker attribute used to detect Tailwind wrapper in rendered HTML
 */
export const TAILWIND_MARKER = "data-pdfx-tailwind";

/**
 * Attribute to store CSS path for processTailwind
 */
export const TAILWIND_CSS_ATTR = "data-pdfx-tailwind-css";

/**
 * Tailwind wrapper component for PDFX
 *
 * Wrap your Page content with this component to enable Tailwind CSS processing.
 * The component renders a hidden marker element that the render() function
 * detects to trigger Tailwind CSS processing.
 *
 * @example Basic usage
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
 * @example With your project's CSS (fonts, colors, etc.)
 * ```tsx
 * <Tailwind css="./src/app/globals.css">
 *   <Page>
 *     <div className="font-inter text-brand">Uses your theme!</div>
 *   </Page>
 * </Tailwind>
 * ```
 */
export function Tailwind({ children, css }: TailwindProps): ReactNode {
  // Render a hidden marker element that render() can detect in the HTML
  // The marker is removed after detection, before final output
  const markerProps: Record<string, unknown> = {
    [TAILWIND_MARKER]: "true",
    style: { display: "none" },
  };

  // Add CSS path if provided
  if (css) {
    markerProps[TAILWIND_CSS_ATTR] = css;
  }

  return createElement(
    Fragment,
    null,
    createElement("div", markerProps),
    children
  );
}
