/**
 * Tailwind CSS Processing for PDFN
 *
 * Uses Tailwind v4's compile() API with dynamic imports for edge compatibility.
 * Throws helpful errors on edge runtimes where filesystem access is unavailable.
 */

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

/**
 * Detect if running on an edge runtime (no filesystem access)
 */
function isEdgeRuntime(): boolean {
  // Node.js has process.versions.node
  if (
    typeof process !== "undefined" &&
    process.versions?.node
  ) {
    return false;
  }

  // Bun is Node.js compatible
  if (typeof process !== "undefined" && (process as any).versions?.bun) {
    return false;
  }

  // If we're here, we're likely on edge (Cloudflare Workers, Vercel Edge, etc.)
  return true;
}

/**
 * Process HTML and generate Tailwind CSS for used classes
 *
 * **Node.js only**: This function requires filesystem access to:
 * - Auto-detect and read user's CSS file (globals.css, etc.)
 * - Locate and load the tailwindcss package
 *
 * For edge runtimes, use a build-time plugin to pre-compile Tailwind CSS.
 *
 * @param html - The HTML content to process
 * @param options - Processing options (CSS path, etc.)
 * @returns Generated CSS string
 */
export async function processTailwind(html: string, options: ProcessOptions = {}): Promise<string> {
  // Check for edge runtime before doing anything
  if (isEdgeRuntime()) {
    throw new Error(
      `Runtime Tailwind CSS processing is not supported on edge runtimes.\n\n` +
      `The @pdfn/tailwind package requires Node.js filesystem access to:\n` +
      `  - Read your CSS file (globals.css, tailwind.css, etc.)\n` +
      `  - Load the tailwindcss package\n\n` +
      `Options:\n` +
      `  1. Use a build-time plugin to pre-compile Tailwind CSS\n` +
      `  2. Use inline styles instead of Tailwind classes\n` +
      `  3. Use Node.js runtime (Vercel Serverless instead of Edge)\n`
    );
  }

  // Dynamically import Node.js modules
  const [fs, path, { createRequire }, { compile }] = await Promise.all([
    import("node:fs"),
    import("node:path"),
    import("node:module"),
    import("tailwindcss"),
  ]);

  const startTime = performance.now();

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

  // Cache for compilers and auto-detected CSS path
  const compilerCache = new Map<string, Awaited<ReturnType<typeof compile>>>();
  let tailwindRoot: string | null = null;
  let autoDetectedCssPath: string | null | undefined = undefined;

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
  function autoDetectCssFile(): string | null {
    if (autoDetectedCssPath !== undefined) {
      return autoDetectedCssPath;
    }

    const cwd = process.cwd();

    for (const relativePath of COMMON_CSS_PATHS) {
      const fullPath = path.resolve(cwd, relativePath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf8");
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
  function getBaseCss(): { css: string; source: string } {
    // 1. Explicit path provided
    if (options.cssPath) {
      const fullPath = path.resolve(process.cwd(), options.cssPath);
      return {
        css: getUserCss(fullPath),
        source: options.cssPath,
      };
    }

    // 2. Auto-detect from common locations
    const autoDetectedPath = autoDetectCssFile();
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
      hash = hash & hash;
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
        const cssPathWithExt = fullPath + ".css";
        if (fs.existsSync(cssPathWithExt)) {
          const content = fs.readFileSync(cssPathWithExt, "utf8");
          return { path: cssPathWithExt, content, base: path.dirname(cssPathWithExt) };
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
        throw new Error(`Module loading not supported: ${id} (${resourceHint})`);
      },
    });

    compilerCache.set(cacheKey, compiler);
    return compiler;
  }

  /**
   * Extract class names from HTML string
   */
  function extractClasses(htmlContent: string): string[] {
    const classRegex = /class="([^"]*)"/g;
    const classes = new Set<string>();

    let match;
    while ((match = classRegex.exec(htmlContent)) !== null) {
      const classValue = match[1];
      if (classValue) {
        classValue.split(/\s+/).forEach((cls) => {
          if (cls) classes.add(cls);
        });
      }
    }

    return Array.from(classes);
  }

  try {
    // Get base CSS (user's or vanilla)
    const { css: baseCss, source } = getBaseCss();

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
