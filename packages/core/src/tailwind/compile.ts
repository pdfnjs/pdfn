/**
 * Tailwind CSS compilation for pdfn templates
 *
 * Shared compilation logic used by @pdfn/next and @pdfn/vite.
 */

import fg from "fast-glob";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { createRequire } from "node:module";
import { PDF_STYLES_PATH } from "../constants/index.js";
import { extractClassesFromContent } from "../utils/index.js";

/**
 * Options for compiling Tailwind CSS
 */
export interface CompileTailwindOptions {
  /**
   * Glob patterns for template files to scan for Tailwind classes.
   */
  templatePatterns: string[];

  /**
   * Path to CSS file containing Tailwind imports and theme.
   * If not provided, uses pdfn-templates/styles.css or falls back to vanilla Tailwind.
   */
  cssPath?: string;

  /**
   * Base directory (usually process.cwd())
   */
  cwd: string;

  /**
   * Enable debug logging
   */
  debug?: boolean;

  /**
   * Log prefix for debug messages
   * @default "[pdfn]"
   */
  logPrefix?: string;
}

/**
 * Result of Tailwind CSS compilation
 */
export interface CompileTailwindResult {
  /** The compiled CSS string */
  css: string;
  /** Number of classes extracted */
  classCount: number;
  /** Number of files scanned */
  fileCount: number;
}

/**
 * Get base CSS content - from pdfn-templates/styles.css or vanilla Tailwind
 */
function getBaseCss(
  cwd: string,
  explicitPath: string | undefined,
  log: (...args: unknown[]) => void
): string {
  // Explicit path provided
  if (explicitPath) {
    const fullPath = resolve(cwd, explicitPath);
    if (!existsSync(fullPath)) {
      throw new Error(`CSS file not found: ${explicitPath}`);
    }
    return readFileSync(fullPath, "utf8");
  }

  // Check for pdfn-templates/styles.css (convention over configuration)
  const stylesPath = resolve(cwd, PDF_STYLES_PATH);
  if (existsSync(stylesPath)) {
    log(`Using CSS file: ${PDF_STYLES_PATH}`);
    return readFileSync(stylesPath, "utf8");
  }

  // Fall back to vanilla Tailwind
  log("No pdfn-templates/styles.css found, using vanilla Tailwind");
  return '@import "tailwindcss";';
}

/**
 * Compile Tailwind CSS for pdfn templates.
 *
 * Scans template files for Tailwind classes and compiles them into
 * a CSS string that can be used inline or written to a file.
 *
 * @param options - Compilation options
 * @returns Compiled CSS and metadata
 *
 * @example
 * ```typescript
 * const { css, classCount, fileCount } = await compileTailwind({
 *   templatePatterns: ['./pdfn-templates/**\/*.tsx'],
 *   cwd: process.cwd(),
 *   debug: true,
 *   logPrefix: '[pdfn:next]'
 * });
 * ```
 */
export async function compileTailwind(
  options: CompileTailwindOptions
): Promise<CompileTailwindResult> {
  const {
    templatePatterns,
    cssPath,
    cwd,
    debug = false,
    logPrefix = "[pdfn]",
  } = options;

  const log = (...args: unknown[]) => {
    if (debug) console.log(logPrefix, ...args);
  };

  // Dynamically import tailwindcss (it's a peer dependency)
  const { compile } = await import("tailwindcss");

  // Find all template files
  const files = await fg(templatePatterns, {
    cwd,
    absolute: true,
    ignore: ["**/node_modules/**"],
  });

  if (files.length === 0) {
    console.warn(`${logPrefix} No template files found matching patterns:`, templatePatterns);
    return { css: "", classCount: 0, fileCount: 0 };
  }

  // Extract classes from all files
  const allClasses = new Set<string>();
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    const classes = extractClassesFromContent(content);
    classes.forEach((cls) => allClasses.add(cls));
  }

  if (allClasses.size === 0) {
    return { css: "", classCount: 0, fileCount: files.length };
  }

  // Get base CSS
  const baseCss = getBaseCss(cwd, cssPath, log);

  // Find tailwindcss package
  const req = createRequire(join(cwd, "package.json"));
  let tailwindRoot: string;
  try {
    const tailwindPkgPath = req.resolve("tailwindcss/package.json");
    tailwindRoot = dirname(tailwindPkgPath);
  } catch {
    throw new Error("Could not find tailwindcss package");
  }

  // The base directory for the initial CSS (pdfn-templates/)
  const stylesBaseDir = resolve(cwd, "pdfn-templates");

  // Compile CSS with custom stylesheet loader
  const compiler = await compile(baseCss, {
    loadStylesheet: async (id: string, base: string) => {
      // Handle tailwindcss import
      if (id === "tailwindcss") {
        const twCssPath = join(tailwindRoot, "index.css");
        if (existsSync(twCssPath)) {
          const content = readFileSync(twCssPath, "utf8");
          return { path: twCssPath, content, base: tailwindRoot };
        }
        throw new Error(`Tailwind CSS index.css not found at: ${twCssPath}`);
      }

      // Handle URL imports - skip
      if (id.startsWith("http://") || id.startsWith("https://")) {
        return { path: id, content: "", base };
      }

      // Handle relative imports
      // Default to pdfn-templates/ for imports from the initial CSS (styles.css)
      const resolveFrom = base || stylesBaseDir;
      const fullPath = resolve(resolveFrom, id);

      if (existsSync(fullPath)) {
        const content = readFileSync(fullPath, "utf8");
        return { path: fullPath, content, base: dirname(fullPath) };
      }

      const cssPathWithExt = fullPath + ".css";
      if (existsSync(cssPathWithExt)) {
        const content = readFileSync(cssPathWithExt, "utf8");
        return { path: cssPathWithExt, content, base: dirname(cssPathWithExt) };
      }

      const twPath = resolve(tailwindRoot, id);
      if (existsSync(twPath)) {
        const content = readFileSync(twPath, "utf8");
        return { path: twPath, content, base: dirname(twPath) };
      }

      throw new Error(`Could not load stylesheet: ${id}`);
    },
    loadModule: async () => {
      throw new Error("Module loading not supported in build-time compilation");
    },
  });

  const css = compiler.build(Array.from(allClasses));

  log(`Compiled ${css.length} bytes of CSS from ${allClasses.size} classes in ${files.length} files`);

  return {
    css,
    classCount: allClasses.size,
    fileCount: files.length,
  };
}
