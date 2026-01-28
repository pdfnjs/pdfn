import type { ReactNode } from "react";

export interface DocumentProps {
  /** PDF document title (required for accessibility) */
  title: string;
  /** PDF document author (metadata) */
  author?: string;
  /** PDF document subject (metadata) */
  subject?: string;
  /** PDF document keywords (metadata) */
  keywords?: string[];
  /** Document language (default: "en") */
  language?: string;
  /**
   * Fonts to load and embed in the PDF.
   *
   * @example Google Fonts (simple)
   * ```tsx
   * <Document fonts={["Inter", "Roboto Mono"]}>
   * ```
   *
   * @example Google Fonts with specific weights
   * ```tsx
   * <Document fonts={[{ family: "Inter", weights: [400, 500, 700] }]}>
   * ```
   *
   * @example Local fonts (embedded as base64)
   * ```tsx
   * <Document fonts={[
   *   { family: "CustomFont", src: "./fonts/custom.woff2", weight: 400 },
   *   { family: "CustomFont", src: "./fonts/custom-bold.woff2", weight: 700 },
   * ]}>
   * ```
   */
  fonts?: (string | FontConfig)[];
  /**
   * Custom CSS to inject into the document.
   * This CSS is added after Tailwind CSS in the cascade,
   * allowing you to override Tailwind utilities if needed.
   *
   * @example
   * ```tsx
   * <Document
   *   title="Invoice"
   *   css={`
   *     .invoice-header { border-bottom: 2px solid blue; }
   *     .total { font-weight: bold; }
   *   `}
   * >
   * ```
   */
  css?: string;
  /** Document content - should contain Page components */
  children: ReactNode;
}

export interface PageProps {
  /** Page size - predefined or custom [width, height] */
  size?: PageSize;
  /** Page orientation */
  orientation?: "portrait" | "landscape";
  /** Page margins - single value or per-side */
  margin?: string | MarginConfig;
  /** Page background color */
  background?: string;
  /** Header content - repeated on each page */
  header?: ReactNode;
  /** Footer content - repeated on each page */
  footer?: ReactNode;
  /** Watermark configuration */
  watermark?: string | WatermarkConfig;
  /** Page content */
  children: ReactNode;
}

/**
 * Predefined page sizes or custom dimensions
 *
 * @example Predefined sizes
 * ```tsx
 * <Page size="A4" />
 * <Page size="Letter" />
 * ```
 *
 * @example Custom size (width, height)
 * ```tsx
 * <Page size={["210mm", "297mm"]} />
 * <Page size={["8.5in", "11in"]} />
 * ```
 */
export type PageSize =
  | "A4"
  | "A3"
  | "A5"
  | "Letter"
  | "Legal"
  | "Tabloid"
  | "B4"
  | "B5"
  | [string, string];

/**
 * Page margin configuration for individual sides
 *
 * @example
 * ```tsx
 * <Page margin={{ top: "1in", right: "0.5in", bottom: "1in", left: "0.5in" }} />
 * ```
 */
export interface MarginConfig {
  /** Top margin (e.g., "1in", "25mm") */
  top?: string;
  /** Right margin */
  right?: string;
  /** Bottom margin */
  bottom?: string;
  /** Left margin */
  left?: string;
}

/**
 * Google Font configuration - loaded via Google Fonts CDN
 */
export interface GoogleFontConfig {
  /** Font family name (must match Google Fonts name) */
  family: string;
  /** Font weights to include (default: [400, 500, 600, 700]) */
  weights?: number[];
  /** Font style */
  style?: "normal" | "italic";
}

/**
 * Local font configuration - embedded as base64 in the PDF
 */
export interface LocalFontConfig {
  /** Font family name */
  family: string;
  /** Path to local font file (.woff2, .woff, .ttf, .otf) */
  src: string;
  /** Font weight for this file (default: 400) */
  weight?: number;
  /** Font style (default: "normal") */
  style?: "normal" | "italic";
}

/**
 * Font configuration - either a Google Font or a local font file
 *
 * @example Google Font
 * ```tsx
 * { family: "Inter", weights: [400, 700] }
 * ```
 *
 * @example Local font
 * ```tsx
 * { family: "CustomFont", src: "./fonts/custom.woff2", weight: 400 }
 * ```
 */
export type FontConfig = GoogleFontConfig | LocalFontConfig;

/**
 * Watermark configuration for pages
 *
 * Watermarks are rendered using CSS @page rules to ensure they appear
 * on every page, including those created by Paged.js during pagination.
 *
 * @example Simple text watermark
 * ```tsx
 * <Page watermark="DRAFT">...</Page>
 * ```
 *
 * @example With custom styling
 * ```tsx
 * <Page watermark={{ text: "CONFIDENTIAL", opacity: 0.15, rotation: -30 }}>
 *   ...
 * </Page>
 * ```
 */
export interface WatermarkConfig {
  /** Watermark text to display */
  text: string;
  /** Watermark opacity (0-1, default: 0.1) */
  opacity?: number;
  /** Watermark rotation in degrees (default: -35) */
  rotation?: number;
}

// Import and re-export DebugOptions from @pdfn/core for public API
import type { DebugOptions } from "@pdfn/core";
export type { DebugOptions };

/**
 * PDF/A standard for archival compliance.
 *
 * Compliance is applied as post-processing after rendering. Layout output is
 * identical whether you use a standard or not — only validation, metadata, and
 * color profile embedding differ.
 *
 * - `PDF/A-1b`: Basic PDF 1.4 archival (most compatible)
 * - `PDF/A-2b`: PDF 1.7 archival, allows transparency and JPEG2000
 * - `PDF/A-3b`: Like PDF/A-2b plus arbitrary embedded files
 *
 * Requires pdfn Cloud (`PDFN_API_KEY`). Adds ~1-5s latency for compliance processing.
 *
 * @example
 * ```tsx
 * // Generate an archival PDF (requires pdfn Cloud)
 * const { data } = await client.generate({ react: <Invoice />, standard: "PDF/A-2b" });
 * ```
 */
export type PDFStandard = "PDF/A-1b" | "PDF/A-2b" | "PDF/A-3b" | "PDF/UA";

/**
 * Options for the render() function
 *
 * @example
 * ```ts
 * // Enable specific debug overlays
 * const { data } = await client.render({ react: <MyDoc />, debug: { grid: true, margins: true } });
 *
 * // Enable all debug overlays
 * const { data } = await client.render({ react: <MyDoc />, debug: true });
 * ```
 */
export interface RenderOptions {
  /**
   * Enable debug overlays in the rendered HTML
   *
   * Debug overlays help visualize page structure during development:
   * - grid: 1cm grid overlay
   * - margins: Page and content boundaries
   * - headers: Header/footer region highlights
   * - breaks: Page number badges
   *
   * Pass `true` to enable all overlays, or an object to enable specific ones.
   */
  debug?: DebugOptions | boolean;
}
