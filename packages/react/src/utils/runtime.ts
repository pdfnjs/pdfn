/**
 * Runtime Detection Utilities
 *
 * Detects the current runtime environment to enable edge compatibility
 * with graceful degradation and helpful error messages.
 */

export type Runtime = "nodejs" | "edge" | "browser";

/**
 * Detect the current runtime environment
 */
export function detectRuntime(): Runtime {
  // Browser detection (client-side)
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    // Check if we're in jsdom (test environment) - treat as Node.js
    if (
      typeof process !== "undefined" &&
      process.versions?.node &&
      navigator?.userAgent?.includes("jsdom")
    ) {
      return "nodejs";
    }
    return "browser";
  }

  // Node.js detection
  if (
    typeof process !== "undefined" &&
    process.versions?.node
  ) {
    return "nodejs";
  }

  // Edge runtime detection (Cloudflare Workers, Vercel Edge, Deno, Bun)
  // These have no `process.versions.node` but are server-side
  if (typeof globalThis !== "undefined") {
    // Cloudflare Workers
    if (typeof (globalThis as any).caches !== "undefined" &&
        typeof (globalThis as any).Request !== "undefined") {
      return "edge";
    }

    // Deno
    if (typeof (globalThis as any).Deno !== "undefined") {
      return "edge";
    }

    // Bun has process.versions.bun but may not have process.versions.node
    if (typeof process !== "undefined" && (process as any).versions?.bun) {
      return "nodejs"; // Bun is Node.js compatible
    }
  }

  // Default to edge for unknown server-side environments
  // (safer than assuming Node.js and crashing on fs imports)
  return "edge";
}

/**
 * Check if current runtime is Node.js (has filesystem access)
 */
export function isNodeJS(): boolean {
  return detectRuntime() === "nodejs";
}

/**
 * Check if current runtime is edge (no filesystem access)
 */
export function isEdge(): boolean {
  return detectRuntime() === "edge";
}

/**
 * Check if current runtime is browser (client-side)
 */
export function isBrowser(): boolean {
  return detectRuntime() === "browser";
}

/**
 * Cached runtime detection (for performance)
 */
let cachedRuntime: Runtime | null = null;

export function getRuntime(): Runtime {
  if (cachedRuntime === null) {
    cachedRuntime = detectRuntime();
  }
  return cachedRuntime;
}

/**
 * Warn about edge incompatibility in dev mode (unless suppressed)
 * @param type - Type of resource (images, fonts)
 * @param paths - Array of local paths detected
 */
export function warnEdgeIncompatibility(
  type: "images" | "fonts" | "css-images" | "css-fonts",
  paths: string[]
): void {
  if (process.env.NODE_ENV === "production" || process.env.PDFN_NO_EDGE_WARNINGS) {
    return;
  }

  const pathList = paths.slice(0, 3).join(", ") + (paths.length > 3 ? ` (+${paths.length - 3} more)` : "");

  const messages: Record<typeof type, { resource: string; solution: string }> = {
    "images": {
      resource: "Local image paths",
      solution: "use remote URLs or pre-encode as base64",
    },
    "css-images": {
      resource: "Local image paths in CSS",
      solution: "use remote URLs or pre-encode as base64",
    },
    "fonts": {
      resource: "Local font paths",
      solution: "use web fonts (Google Fonts) or pre-encode as base64",
    },
    "css-fonts": {
      resource: "Local font paths in CSS",
      solution: "use web fonts (Google Fonts) or pre-encode as base64",
    },
  };

  const { resource, solution } = messages[type];

  console.warn(
    `[pdfn] Warning: ${resource} detected: ${pathList}\n` +
    `       This template will NOT work on edge runtimes (Cloudflare Workers, Vercel Edge).\n` +
    `       For edge compatibility, ${solution}.\n` +
    `       Suppress this warning: add PDFN_NO_EDGE_WARNINGS=1 to .env.local`
  );
}

/**
 * Error messages for edge runtime limitations
 */
export const EdgeErrors = {
  localImages: (paths: string[]) =>
    `Local image paths detected: ${paths.slice(0, 3).join(", ")}${paths.length > 3 ? ` (and ${paths.length - 3} more)` : ""}\n\n` +
    `Edge runtimes don't have filesystem access. Options:\n` +
    `  1. Use remote URLs: "https://cdn.example.com/image.png"\n` +
    `  2. Pre-encode as base64 data URIs\n` +
    `  3. Use Node.js runtime (Vercel Serverless instead of Edge)\n`,

  localFonts: (paths: string[]) =>
    `Local font paths detected: ${paths.slice(0, 3).join(", ")}${paths.length > 3 ? ` (and ${paths.length - 3} more)` : ""}\n\n` +
    `Edge runtimes don't have filesystem access. Options:\n` +
    `  1. Use web fonts (Google Fonts, Adobe Fonts, etc.)\n` +
    `  2. Pre-encode fonts as base64 data URIs\n` +
    `  3. Use Node.js runtime (Vercel Serverless instead of Edge)\n`,

  tailwindRuntime: () =>
    `Runtime Tailwind CSS processing is not supported on edge runtimes.\n\n` +
    `The @pdfn/tailwind package requires Node.js filesystem access. Options:\n` +
    `  1. Use a Vite/Next.js plugin to pre-compile Tailwind at build time\n` +
    `  2. Use inline styles instead of Tailwind classes\n` +
    `  3. Use Node.js runtime (Vercel Serverless instead of Edge)\n`,

  cssFile: (path: string) =>
    `cssFile="${path}" requires build-time compilation on edge runtimes.\n\n` +
    `Edge runtimes don't have filesystem access. Options:\n` +
    `  1. Use @pdfn/vite or @pdfn/next plugin to pre-compile cssFile at build time\n` +
    `  2. Use inline css prop instead: css={\`...\`}\n` +
    `  3. Use Node.js runtime (Vercel Serverless instead of Edge)\n`,
} as const;
