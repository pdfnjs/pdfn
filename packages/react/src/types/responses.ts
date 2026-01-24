import type { PdfnError } from "../errors";
import type { PDFStandard } from "../types";

/**
 * Standard response pattern for all pdfn operations
 *
 * @example Success
 * ```typescript
 * { data: { buffer: Buffer, ... }, error: null }
 * ```
 *
 * @example Error
 * ```typescript
 * { data: null, error: PdfnError }
 * ```
 */
export type PdfnResponse<T> =
  | { data: T; error: null }
  | { data: null; error: PdfnError };

/**
 * Data returned from a successful generate() call
 */
export interface GenerateData {
  /** PDF binary buffer */
  buffer: Buffer;
  /** Generation ID from server */
  id: string;
  /** Generation metrics */
  metrics: {
    /** Total generation time in ms */
    durationMs: number;
    /** PDF size in bytes */
    sizeBytes: number;
  };
  /** PDF standard if requested */
  standard?: PDFStandard;
  /** ISO timestamp */
  createdAt: string;
}

/**
 * Data returned from a successful render() call
 */
export interface RenderData {
  /** Self-contained HTML string */
  html: string;
  /** Render metrics */
  metrics: {
    /** Total render time in ms */
    totalTime: number;
  };
}

/**
 * Response type for generate() method
 */
export type GenerateResponse = PdfnResponse<GenerateData>;

/**
 * Response type for render() method
 */
export type RenderResponse = PdfnResponse<RenderData>;
