import type { DebugOptions, PDFStandard } from "../types";

/**
 * Options for the generate() method
 */
export interface GenerateOptions {
  /** Debug overlays (for preview/development) */
  debug?: DebugOptions | boolean;
  /** PDF/A or PDF/UA standard for archival compliance */
  standard?: PDFStandard;
  /** Filename for Content-Disposition header */
  filename?: string;
  /** PDF metadata */
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creator?: string;
  };
  /** Idempotency key for deduplication */
  idempotencyKey?: string;
  /** Timeout in milliseconds (overrides client default) */
  timeout?: number;
}

/**
 * Options for the render() method
 */
export interface RenderOptions {
  /** Debug overlays */
  debug?: DebugOptions | boolean;
}
