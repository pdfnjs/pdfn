import type { Express, Request, Response } from "express";
import { createBaseServer } from "./base";
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

  // Create base server with shared middleware and routes
  const { app, browserManager, maxConcurrent, timeout } = createBaseServer({
    maxConcurrent: options.maxConcurrent,
    timeout: options.timeout,
    enableLogging: true,
    onRequest: (method, path, status, duration, extra) => {
      logger.request(method, path, status, duration, extra);
    },
    onPdfResult: (result) => {
      logger.pdfDetails(result);
    },
    onError: (message) => {
      if (message.includes("Server busy")) {
        logger.warn(`Rate limited: ${browserManager.getActivePages()}/${maxConcurrent} pages in use`);
      } else {
        logger.error(`PDF generation failed: ${message}`);
      }
    },
  });

  let server: ReturnType<typeof app.listen> | null = null;

  // Landing page - helpful message for browser visitors
  app.get("/", (_req: Request, res: Response) => {
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

  return {
    app,
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
export { createBaseServer, type BaseServerOptions, type BaseServer } from "./base";
