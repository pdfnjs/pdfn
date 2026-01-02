import express from "express";
import type { Express, Request, Response, NextFunction } from "express";
import { BrowserManager } from "./browser";
import { createGenerateHandler } from "./routes";
import { type PdfResult } from "./pdf";

export interface BaseServerOptions {
  /** Max concurrent pages (default: env.PDFN_MAX_CONCURRENT || 5) */
  maxConcurrent?: number;
  /** Request timeout in ms (default: env.PDFN_TIMEOUT || 30000) */
  timeout?: number;
  /** Enable request logging (default: true) */
  enableLogging?: boolean;
  /** Custom logger for requests */
  onRequest?: (method: string, path: string, status: number, duration: number, extra?: string) => void;
  /** Custom logger for PDF details */
  onPdfResult?: (result: PdfResult) => void;
  /** Callback on successful PDF generation */
  onSuccess?: (result: PdfResult) => void;
  /** Custom logger for errors */
  onError?: (message: string) => void;
}

export interface BaseServer {
  app: Express;
  browserManager: BrowserManager;
  maxConcurrent: number;
  timeout: number;
}

/**
 * Create a base PDFN server with common middleware and routes.
 *
 * This is shared between `dev` and `serve` commands.
 * Returns the Express app and BrowserManager for further customization.
 *
 * Includes:
 * - JSON body parsing (50mb limit)
 * - Request logging middleware (optional)
 * - POST /generate endpoint
 * - GET /health endpoint
 */
export function createBaseServer(options: BaseServerOptions = {}): BaseServer {
  const maxConcurrent =
    options.maxConcurrent ??
    parseInt(process.env.PDFN_MAX_CONCURRENT ?? "5", 10);
  const timeout =
    options.timeout ?? parseInt(process.env.PDFN_TIMEOUT ?? "30000", 10);
  const enableLogging = options.enableLogging ?? true;

  const app = express();
  const browserManager = new BrowserManager({ maxConcurrent, timeout });

  // JSON body parsing
  app.use(express.json({ limit: "50mb" }));

  // Request logging middleware
  if (enableLogging && options.onRequest) {
    const onRequest = options.onRequest;
    const onPdfResult = options.onPdfResult;

    app.use((req: Request, res: Response, next: NextFunction) => {
      // Skip noisy requests
      const skipPaths = ["/favicon.ico", "/robots.txt"];
      if (skipPaths.includes(req.path)) {
        next();
        return;
      }

      const start = performance.now();

      res.on("finish", () => {
        const duration = performance.now() - start;

        // For /generate, include page count and size
        let extra: string | undefined;
        if (req.path === "/generate" && res.statusCode === 200) {
          const pages = res.getHeader("X-PDFN-Page-Count");
          const size = Number(res.getHeader("X-PDFN-PDF-Size")) || 0;
          const sizeKB = (size / 1024).toFixed(1);
          extra = `${pages} pages • ${sizeKB}KB`;
        }

        onRequest(req.method, req.path, res.statusCode, duration, extra);

        // Log PDF details if available
        const pdfResult = (res as any)._pdfResult as PdfResult | undefined;
        if (pdfResult && onPdfResult) {
          onPdfResult(pdfResult);
        }
      });

      next();
    });
  }

  // Health check endpoint
  app.get("/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      browser: browserManager.isConnected() ? "connected" : "disconnected",
      activePages: browserManager.getActivePages(),
      maxConcurrent: browserManager.getMaxConcurrent(),
    });
  });

  // PDF generation endpoint
  app.post(
    "/generate",
    createGenerateHandler(browserManager, {
      timeout,
      onSuccess: options.onSuccess,
      onError: options.onError,
    })
  );

  return {
    app,
    browserManager,
    maxConcurrent,
    timeout,
  };
}
