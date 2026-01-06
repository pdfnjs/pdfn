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
   * Path to your CSS file that contains Tailwind imports and theme customizations,
   * OR pre-compiled CSS string (when using @pdfn/vite plugin).
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
   *
   * When using @pdfn/vite plugin, this prop is automatically populated
   * with pre-compiled CSS at build time (no runtime processing needed).
   */
  css?: string;
}

/**
 * Marker attribute used to detect Tailwind wrapper in rendered HTML
 */
export const TAILWIND_MARKER = "data-pdfn-tailwind";

/**
 * Attribute to store CSS path for processTailwind
 */
export const TAILWIND_CSS_ATTR = "data-pdfn-tailwind-css";

/**
 * Attribute to store pre-compiled CSS (from @pdfn/vite plugin)
 * When present, runtime processing is skipped
 */
export const TAILWIND_PRECOMPILED_ATTR = "data-pdfn-tailwind-precompiled";

/**
 * Check if a string looks like pre-compiled CSS vs a file path
 */
function isPrecompiledCss(css: string): boolean {
  // Pre-compiled CSS contains CSS syntax (check this first)
  if (css.includes("{") && css.includes("}")) {
    return true;
  }
  // File paths typically start with . or / (but not /* which is CSS comment)
  if (css.startsWith("./") || css.startsWith("../")) {
    return false;
  }
  // Absolute paths start with / but not /* (CSS comment)
  if (css.startsWith("/") && !css.startsWith("/*")) {
    return false;
  }
  // Short strings without CSS syntax are likely paths
  if (css.length < 100 && !css.includes(":")) {
    return false;
  }
  // Default to CSS if it's long or contains CSS-like content
  return true;
}

/**
 * Encode string to base64 (works in both Node.js and browser)
 */
function toBase64(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str).toString("base64");
  }
  // Browser fallback using TextEncoder + btoa
  if (typeof btoa !== "undefined") {
    const bytes = new TextEncoder().encode(str);
    const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
    return btoa(binary);
  }
  // Last resort - just return the string (will be HTML escaped but still work)
  return str;
}

/**
 * Tailwind wrapper component for PDFN
 *
 * Wrap your Page content with this component to enable Tailwind CSS processing.
 * The component renders a hidden marker element that the render() function
 * detects to trigger Tailwind CSS processing.
 *
 * @example Basic usage
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

  // Add CSS - either as path or pre-compiled content
  if (css) {
    if (isPrecompiledCss(css)) {
      // Pre-compiled CSS from build plugin - store as base64 to avoid HTML escaping issues
      markerProps[TAILWIND_PRECOMPILED_ATTR] = toBase64(css);
    } else {
      // CSS file path for runtime processing
      markerProps[TAILWIND_CSS_ATTR] = css;
    }
  }

  return createElement(
    Fragment,
    null,
    createElement("div", markerProps),
    children
  );
}
