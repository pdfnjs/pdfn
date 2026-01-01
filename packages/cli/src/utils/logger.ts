import type { PdfResult } from "../server/pdf";

/**
 * Simple logger with colors and formatting for CLI output
 */

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",

  // Foreground
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",

  // Background
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgRed: "\x1b[41m",
  bgCyan: "\x1b[46m",
} as const;

// Color helper functions
const c = {
  dim: (s: string) => `${colors.dim}${s}${colors.reset}`,
  bold: (s: string) => `${colors.bold}${s}${colors.reset}`,
  green: (s: string) => `${colors.green}${s}${colors.reset}`,
  red: (s: string) => `${colors.red}${s}${colors.reset}`,
  yellow: (s: string) => `${colors.yellow}${s}${colors.reset}`,
  blue: (s: string) => `${colors.blue}${s}${colors.reset}`,
  cyan: (s: string) => `${colors.cyan}${s}${colors.reset}`,
  gray: (s: string) => `${colors.gray}${s}${colors.reset}`,
  magenta: (s: string) => `${colors.magenta}${s}${colors.reset}`,
};

function timestamp(): string {
  return c.dim(new Date().toLocaleTimeString("en-US", { hour12: false }));
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export const logger = {
  /**
   * Log info message
   */
  info: (message: string, ...args: unknown[]) => {
    console.log(`${timestamp()} ${c.cyan("ℹ")} ${message}`, ...args);
  },

  /**
   * Log success message
   */
  success: (message: string, ...args: unknown[]) => {
    console.log(`${timestamp()} ${c.green("✓")} ${message}`, ...args);
  },

  /**
   * Log warning message
   */
  warn: (message: string, ...args: unknown[]) => {
    console.log(`${timestamp()} ${c.yellow("⚠")} ${c.yellow(message)}`, ...args);
  },

  /**
   * Log error message
   */
  error: (message: string, ...args: unknown[]) => {
    console.error(`${timestamp()} ${c.red("✗")} ${c.red(message)}`, ...args);
  },

  /**
   * Log HTTP request
   */
  request: (
    method: string,
    path: string,
    status: number,
    duration: number,
    extra?: string
  ) => {
    const methodColor =
      method === "GET" ? c.green : method === "POST" ? c.cyan : c.yellow;
    const statusColor =
      status >= 500
        ? c.red
        : status >= 400
          ? c.yellow
          : status >= 300
            ? c.blue
            : c.green;

    const line = [
      timestamp(),
      methodColor(method.padEnd(4)),
      path,
      statusColor(status.toString()),
      c.dim(formatMs(duration)),
      extra ? c.dim(extra) : "",
    ]
      .filter(Boolean)
      .join(" ");

    console.log(line);
  },

  /**
   * Log server startup banner
   */
  banner: (port: number, maxConcurrent: number, timeout: number) => {
    console.log();
    console.log(
      `  ${c.dim("pdf")}${c.cyan("x")} ${c.dim("server")} ${c.dim("v0.0.1")}`
    );
    console.log();
    console.log(`  ${c.dim("→")} Local:    ${c.cyan(`http://localhost:${port}`)}`);
    console.log();
    console.log(`  ${c.dim("Endpoints:")}`);
    console.log(`    ${c.green("POST")} /generate     ${c.dim("Generate PDF from HTML")}`);
    console.log(`    ${c.blue("GET")}  /health       ${c.dim("Health check")}`);
    console.log();
    console.log(
      `  ${c.dim(`Pool: ${maxConcurrent} concurrent | Timeout: ${formatMs(timeout)}`)}`
    );
    console.log();
  },

  /**
   * Log PDF details (timing breakdown, assets, warnings)
   * Used after the request line has been logged
   */
  pdfDetails: (result: PdfResult) => {
    const { metrics, assets, warnings } = result;

    // Timing breakdown
    console.log(
      `${c.dim("         load")} ${formatMs(metrics.contentLoad)} ${c.dim("→ paginate")} ${formatMs(metrics.pagedJs)} ${c.dim("→ capture")} ${formatMs(metrics.pdfCapture)}`
    );

    // Asset summary if any
    if (assets.length > 0) {
      const assetsByType = assets.reduce((acc, a) => {
        if (!acc[a.type]) acc[a.type] = { count: 0, size: 0 };
        acc[a.type].count++;
        acc[a.type].size += a.size;
        return acc;
      }, {} as Record<string, { count: number; size: number }>);

      const parts: string[] = [];
      for (const [type, data] of Object.entries(assetsByType)) {
        const sizeStr = data.size > 0 ? ` (${(data.size / 1024).toFixed(0)}KB)` : "";
        parts.push(`${data.count} ${type}${data.count > 1 ? "s" : ""}${sizeStr}`);
      }
      if (parts.length > 0) {
        console.log(c.dim(`         assets: ${parts.join(", ")}`));
      }
    }

    // Warnings
    for (const w of warnings) {
      console.log(`         ${c.yellow("⚠")} ${c.yellow(w)}`);
    }
  },

  /**
   * Log PDF generation metrics (simple format for inline use)
   */
  pdf: (metrics: {
    total: number;
    contentLoad: number;
    pagedJs: number;
    pdfCapture: number;
    pageCount: number;
  }) => {
    const parts = [
      `${metrics.pageCount} ${metrics.pageCount === 1 ? "page" : "pages"}`,
      formatMs(metrics.total),
      c.dim(
        `(load: ${formatMs(metrics.contentLoad)}, paged: ${formatMs(metrics.pagedJs)}, pdf: ${formatMs(metrics.pdfCapture)})`
      ),
    ];
    return parts.join(" ");
  },

  /**
   * Log browser status
   */
  browser: (status: "launching" | "ready" | "disconnected" | "closed") => {
    switch (status) {
      case "launching":
        logger.info("Launching browser...");
        break;
      case "ready":
        logger.success("Browser ready");
        break;
      case "disconnected":
        logger.warn("Browser disconnected, will restart on next request");
        break;
      case "closed":
        logger.info("Browser closed");
        break;
    }
  },

  /**
   * Log shutdown
   */
  shutdown: () => {
    console.log();
    logger.info("Shutting down...");
  },

  // Raw color helpers for custom formatting
  c,
};
