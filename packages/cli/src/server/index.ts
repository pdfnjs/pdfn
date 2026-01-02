import express from "express";
import type { Express, Request, Response, NextFunction } from "express";
import { BrowserManager } from "./browser";
import { type PdfResult } from "./pdf";
import { createGenerateHandler } from "./routes";
import { logger } from "../utils/logger";

export interface ServerOptions {
  /** Server port (default: env.PDFX_PORT || 3456) */
  port?: number;
  /** Max concurrent pages (default: env.PDFX_MAX_CONCURRENT || 5) */
  maxConcurrent?: number;
  /** Request timeout in ms (default: env.PDFX_TIMEOUT || 30000) */
  timeout?: number;
}

export interface PDFXServer {
  app: Express;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  routes: express.Router;
}


/**
 * Request timing middleware
 * Logs all requests, with extra PDF details for /generate
 */
function requestLogger(req: Request, res: Response, next: NextFunction) {
  // Skip noisy requests
  const skipPaths = ["/favicon.ico", "/robots.txt"];
  if (skipPaths.includes(req.path)) {
    next();
    return;
  }

  const start = performance.now();

  res.on("finish", () => {
    const duration = performance.now() - start;

    // For /generate, include page count and size in request line
    let extra: string | undefined;
    if (req.path === "/generate" && res.statusCode === 200) {
      const pages = res.getHeader("X-PDFX-Page-Count");
      const size = Number(res.getHeader("X-PDFX-PDF-Size")) || 0;
      const sizeKB = (size / 1024).toFixed(1);
      extra = `${pages} pages • ${sizeKB}KB`;
    }

    logger.request(req.method, req.path, res.statusCode, duration, extra);

    // Log PDF details if available
    const pdfResult = (res as any)._pdfResult as PdfResult | undefined;
    if (pdfResult) {
      logger.pdfDetails(pdfResult);
    }
  });

  next();
}

/**
 * Create a PDFX server instance
 *
 * Configuration priority: options > environment variables > defaults
 *
 * Environment variables:
 * - PDFX_PORT: Server port (default: 3456)
 * - PDFX_MAX_CONCURRENT: Max concurrent pages (default: 5)
 * - PDFX_TIMEOUT: Request timeout in ms (default: 30000)
 *
 * @example
 * ```ts
 * import { createServer } from '@pdfx-dev/cli/server';
 *
 * const server = createServer({ port: 3456, maxConcurrent: 10 });
 * await server.start();
 * ```
 */
export function createServer(options: ServerOptions = {}): PDFXServer {
  const port =
    options.port ?? parseInt(process.env.PDFX_PORT ?? "3456", 10);
  const maxConcurrent =
    options.maxConcurrent ??
    parseInt(process.env.PDFX_MAX_CONCURRENT ?? "5", 10);
  const timeout =
    options.timeout ?? parseInt(process.env.PDFX_TIMEOUT ?? "30000", 10);

  const app = express();
  const router = express.Router();
  const browserManager = new BrowserManager({ maxConcurrent, timeout });

  let server: ReturnType<typeof app.listen> | null = null;

  // Middleware
  app.use(express.json({ limit: "50mb" }));
  app.use(requestLogger);

  // Landing page - helpful message for browser visitors
  router.get("/", (_req: Request, res: Response) => {
    res.type("text/plain").send(`PDFX Server

This is a headless API server for PDF generation.

Endpoints:
  POST /generate    Generate PDF from HTML
  GET  /health      Health check

Usage:
  curl -X POST http://localhost:${port}/generate \\
    -H "Content-Type: application/json" \\
    -d '{"html": "<html>...</html>"}' \\
    -o output.pdf

For development with live preview, use:
  npx pdfx dev
`);
  });

  // Health check
  router.get("/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      browser: browserManager.isConnected() ? "connected" : "disconnected",
      activePages: browserManager.getActivePages(),
      maxConcurrent: browserManager.getMaxConcurrent(),
    });
  });

  // PDF generation endpoint (shared handler)
  router.post(
    "/generate",
    createGenerateHandler(browserManager, {
      timeout,
      onError: (message) => {
        if (message.includes("Server busy")) {
          logger.warn(`Rate limited: ${browserManager.getActivePages()}/${maxConcurrent} pages in use`);
        } else {
          logger.error(`PDF generation failed: ${message}`);
        }
      },
    })
  );

  app.use(router);

  return {
    app,
    routes: router,
    start: async () => {
      // Pre-launch browser
      logger.browser("launching");
      await browserManager.getBrowser();
      logger.browser("ready");

      return new Promise((resolve) => {
        server = app.listen(port, () => {
          logger.banner(port, maxConcurrent, timeout);
          resolve();
        });
      });
    },
    stop: async () => {
      await browserManager.close();
      logger.browser("closed");

      if (server) {
        await new Promise<void>((resolve) => {
          server!.close(() => resolve());
        });
        server = null;
      }

      logger.success("Server stopped");
    },
  };
}

// Re-export types
export type { PdfGenerationOptions, PdfResult } from "./pdf";
export type { BrowserManagerOptions } from "./browser";
