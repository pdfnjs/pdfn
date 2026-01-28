import type { ReactElement } from "react";
import type { DebugOptions, PDFStandard } from "../types";

/**
 * Options for the generate() method (internal use)
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
 * Options for the render() method (internal use)
 */
export interface RenderOptions {
  /** Debug overlays */
  debug?: DebugOptions | boolean;
}

/**
 * Input for client.generate() — pass either `react` or `html`, plus options.
 *
 * @example React input
 * ```typescript
 * client.generate({ react: <Invoice data={...} />, filename: 'invoice.pdf' })
 * ```
 *
 * @example HTML input
 * ```typescript
 * client.generate({ html: '<h1>Hello</h1>', filename: 'invoice.pdf' })
 * ```
 */
export type GenerateInput = GenerateOptions &
  ({ react: ReactElement; html?: never } | { html: string; react?: never });

/**
 * Input for client.render() — pass a React element with optional debug options.
 *
 * @example
 * ```typescript
 * client.render({ react: <Invoice />, debug: true })
 * ```
 */
export interface RenderInput {
  /** React element to render to HTML */
  react: ReactElement;
  /** Debug overlays */
  debug?: DebugOptions | boolean;
}
