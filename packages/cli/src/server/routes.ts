import type { Request, Response } from "express";
import type { BrowserManager } from "./browser";
import { generatePdf, type PdfResult } from "./pdf";

interface GenerateRequestBody {
  html?: string;
  options?: {
    timeout?: number;
    printBackground?: boolean;
    preferCSSPageSize?: boolean;
  };
}

interface GenerateHandlerOptions {
  /** Default timeout in ms (default: 30000) */
  timeout?: number;
  /** Optional logger for PDF generation results */
  onSuccess?: (result: PdfResult) => void;
  /** Optional logger for errors */
  onError?: (error: string) => void;
}

/**
 * Create a /v1/generate POST handler for PDF generation
 *
 * @example
 * ```ts
 * const browserManager = new BrowserManager({ maxConcurrent: 5 });
 * app.post("/v1/generate", createGenerateHandler(browserManager));
 * ```
 */
export function createGenerateHandler(
  browserManager: BrowserManager,
  options: GenerateHandlerOptions = {}
) {
  const { timeout = 30000, onSuccess, onError } = options;

  return async (req: Request, res: Response) => {
    const { html, options: pdfOptions } = req.body as GenerateRequestBody;
    const format = req.query.format as string | undefined;

    if (!html) {
      res.status(400).json({ error: "HTML content is required" });
      return;
    }

    // Return HTML directly if format=html (for debugging)
    if (format === "html") {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
      return;
    }

    try {
      const result = await browserManager.withPage(async (page) => {
        return generatePdf(page, html, {
          ...pdfOptions,
          timeout: pdfOptions?.timeout ?? timeout,
        });
      });

      // Set response headers with metrics
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("X-PDFN-Total-Time", result.metrics.total.toString());
      res.setHeader("X-PDFN-Content-Load", result.metrics.contentLoad.toString());
      res.setHeader("X-PDFN-PagedJs-Time", result.metrics.pagedJs.toString());
      res.setHeader("X-PDFN-PDF-Capture", result.metrics.pdfCapture.toString());
      res.setHeader("X-PDFN-Page-Count", result.metrics.pageCount.toString());
      res.setHeader("X-PDFN-PDF-Size", result.metrics.pdfSize.toString());

      // Attach result for logging middleware (used by serve command)
      (res as any)._pdfResult = result;

      // Call success callback if provided
      onSuccess?.(result);

      res.send(result.buffer);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";

      // Call error callback if provided
      onError?.(message);

      if (message.includes("Server busy")) {
        res.status(503).json({ error: message });
        return;
      }

      res.status(500).json({ error: message });
    }
  };
}
