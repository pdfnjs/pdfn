/**
 * Tailwind CSS Processing for PDFN
 *
 * Uses Tailwind v4's compile() API with static imports.
 * This works in bundled environments like Next.js because
 * the bundler can see the imports at build time.
 */

import { compile } from "tailwindcss";
import * as fs from "node:fs";
import * as path from "node:path";
import { createRequire } from "node:module";

/**
 * Options for processTailwind
 */
export interface ProcessOptions {
  /**
   * Path to user's CSS file containing Tailwind imports and theme.
   * If not provided, will auto-detect from common locations.
   */
  cssPath?: string;
}

// Cache compilers by CSS content hash for reuse
const compilerCache = new Map<string, Awaited<ReturnType<typeof compile>>>();
let tailwindRoot: string | null = null;
let autoDetectedCssPath: string | null | undefined = undefined; // undefined = not yet checked

// Debug logging - enable with DEBUG=pdfn:tailwind or DEBUG=pdfn:* or DEBUG=pdfn
const debugEnv = process.env.DEBUG ?? "";
const isDebugEnabled =
  debugEnv.includes("pdfn:tailwind") ||
  debugEnv.includes("pdfn:*") ||
  debugEnv === "pdfn" ||
  debugEnv.includes("pdfn,") ||
  debugEnv.endsWith(",pdfn");

const debug = isDebugEnabled
  ? (message: string) => console.log(`[pdfn:tailwind] ${message}`)
  : () => {};

/**
 * Common CSS file locations to auto-detect
 */
const COMMON_CSS_PATHS = [
  "./src/app/globals.css",
  "./src/styles/globals.css",
  "./app/globals.css",
  "./styles/globals.css",
  "./styles/tailwind.css",
  "./src/index.css",
  "./src/styles.css",
];

/**
 * Find the tailwindcss package root directory
 */
function findTailwindRoot(): string {
  if (tailwindRoot) return tailwindRoot;

  // Use createRequire to find tailwindcss from cwd
  try {
    const req = createRequire(process.cwd() + "/package.json");
    const tailwindPkgPath = req.resolve("tailwindcss/package.json");
    tailwindRoot = path.dirname(tailwindPkgPath);
    return tailwindRoot;
  } catch {
    // Fallback: look in common locations
  }

  const possiblePaths = [
    path.join(process.cwd(), "node_modules", "tailwindcss"),
    path.join(process.cwd(), "..", "node_modules", "tailwindcss"),
    path.join(process.cwd(), "..", "..", "node_modules", "tailwindcss"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(path.join(p, "package.json"))) {
      tailwindRoot = p;
      return tailwindRoot;
    }
  }

  throw new Error("Could not find tailwindcss package");
}

/**
 * Auto-detect user's CSS file from common locations
 */
function autoDetectCssPath(): string | null {
  // Return cached result if we've already checked
  if (autoDetectedCssPath !== undefined) {
    return autoDetectedCssPath;
  }

  const cwd = process.cwd();

  for (const relativePath of COMMON_CSS_PATHS) {
    const fullPath = path.resolve(cwd, relativePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf8");
      // Check if it looks like a Tailwind CSS file
      if (content.includes("tailwindcss") || content.includes("@tailwind")) {
        debug(`Auto-detected CSS: ${relativePath}`);
        autoDetectedCssPath = fullPath;
        return fullPath;
      }
    }
  }

  autoDetectedCssPath = null;
  return null;
}

/**
 * Read user's CSS file and ensure it has Tailwind import
 */
function getUserCss(cssPath: string): string {
  if (!fs.existsSync(cssPath)) {
    throw new Error(
      `CSS file not found: ${cssPath}\n\n` +
      `Make sure the path is correct relative to your project root.`
    );
  }

  const content = fs.readFileSync(cssPath, "utf8");

  // Check if it has Tailwind import
  if (!content.includes("tailwindcss") && !content.includes("@tailwind")) {
    console.warn(
      `[pdfn:tailwind] Warning: ${cssPath} doesn't appear to import Tailwind CSS.\n` +
      `Expected to find @import "tailwindcss"; or @tailwind directives.`
    );
  }

  return content;
}

/**
 * Get base CSS content - either from user's file or vanilla Tailwind
 */
function getBaseCss(options: ProcessOptions = {}): { css: string; source: string } {
  // 1. Explicit path provided
  if (options.cssPath) {
    const fullPath = path.resolve(process.cwd(), options.cssPath);
    return {
      css: getUserCss(fullPath),
      source: options.cssPath,
    };
  }

  // 2. Auto-detect from common locations
  const autoDetectedPath = autoDetectCssPath();
  if (autoDetectedPath) {
    return {
      css: getUserCss(autoDetectedPath),
      source: autoDetectedPath,
    };
  }

  // 3. Fall back to vanilla Tailwind
  debug("Using vanilla Tailwind (no custom CSS found)");
  return {
    css: '@import "tailwindcss";',
    source: "vanilla",
  };
}

/**
 * Simple hash function for caching
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

/**
 * Get or create the Tailwind compiler for given CSS
 */
async function getCompiler(baseCss: string): Promise<Awaited<ReturnType<typeof compile>>> {
  const cacheKey = hashString(baseCss);

  if (compilerCache.has(cacheKey)) {
    return compilerCache.get(cacheKey)!;
  }

  const twRoot = findTailwindRoot();
  const cwd = process.cwd();

  const compiler = await compile(baseCss, {
    loadStylesheet: async (id: string, base: string) => {
      // Handle tailwindcss import
      if (id === "tailwindcss") {
        const cssPath = path.join(twRoot, "index.css");
        if (fs.existsSync(cssPath)) {
          const content = fs.readFileSync(cssPath, "utf8");
          return { path: cssPath, content, base: twRoot };
        }
        throw new Error(`Tailwind CSS index.css not found at: ${cssPath}`);
      }

      // Handle URL imports (Google Fonts, etc.) - skip loading, they're handled by browser
      if (id.startsWith("http://") || id.startsWith("https://")) {
        // Return empty content - the @import url() stays in output CSS
        return { path: id, content: "", base };
      }

      // Handle relative imports - try multiple locations
      const resolveFrom = base || cwd;
      const fullPath = path.resolve(resolveFrom, id);

      // Try exact path
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf8");
        return { path: fullPath, content, base: path.dirname(fullPath) };
      }

      // Try with .css extension
      const cssPath = fullPath + ".css";
      if (fs.existsSync(cssPath)) {
        const content = fs.readFileSync(cssPath, "utf8");
        return { path: cssPath, content, base: path.dirname(cssPath) };
      }

      // Try from tailwind package
      const twPath = path.resolve(twRoot, id);
      if (fs.existsSync(twPath)) {
        const content = fs.readFileSync(twPath, "utf8");
        return { path: twPath, content, base: path.dirname(twPath) };
      }

      console.warn(`[pdfn:tailwind] Could not load stylesheet: ${id}`);
      throw new Error(`Could not load stylesheet: ${id}`);
    },
    loadModule: async (id: string, _base: string, resourceHint: "plugin" | "config") => {
      // We don't support loading plugins/configs for now
      throw new Error(`Module loading not supported: ${id} (${resourceHint})`);
    },
  });

  compilerCache.set(cacheKey, compiler);
  return compiler;
}

/**
 * Extract class names from HTML string
 */
function extractClasses(html: string): string[] {
  const classRegex = /class="([^"]*)"/g;
  const classes = new Set<string>();

  let match;
  while ((match = classRegex.exec(html)) !== null) {
    const classValue = match[1];
    if (classValue) {
      classValue.split(/\s+/).forEach((cls) => {
        if (cls) classes.add(cls);
      });
    }
  }

  return Array.from(classes);
}

/**
 * Process HTML and generate Tailwind CSS for used classes
 *
 * @param html - The HTML content to process
 * @param options - Processing options (CSS path, etc.)
 * @returns Generated CSS string
 */
export async function processTailwind(html: string, options: ProcessOptions = {}): Promise<string> {
  const startTime = performance.now();

  try {
    // Get base CSS (user's or vanilla)
    const { css: baseCss, source } = getBaseCss(options);

    // Get or create compiler for this CSS
    const compiler = await getCompiler(baseCss);

    // Extract classes and build CSS
    const candidates = extractClasses(html);
    const css = compiler.build(candidates);

    const duration = Math.round(performance.now() - startTime);
    debug(
      `Generated ${css.length} bytes in ${duration}ms ` +
      `(${candidates.length} classes, source: ${source})`
    );

    return css;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[pdfn:tailwind] Error: ${message}`);
    throw error;
  }
}
