import type { ReactNode } from "react";

export interface DocumentProps {
  /** PDF document title (metadata) */
  title?: string;
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

export interface MarginConfig {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

export interface FontConfig {
  /** Font family name */
  family: string;
  /** Font weights to include (for Google Fonts) */
  weights?: number[];
  /** Custom font file path */
  src?: string;
  /** Font weight (for custom fonts) */
  weight?: number;
  /** Font style */
  style?: "normal" | "italic";
}

export interface WatermarkConfig {
  /** Watermark text */
  text?: string;
  /** Custom watermark content */
  content?: ReactNode;
  /** Watermark opacity (0-1) */
  opacity?: number;
  /** Watermark rotation in degrees */
  rotation?: number;
  /** Additional CSS classes */
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RenderOptions {
  // Reserved for future render options
}

export interface PdfOptions {
  /** PDF format */
  format?: PageSize;
  /** Print background graphics */
  printBackground?: boolean;
  /** Page ranges to print */
  pageRanges?: string;
}
