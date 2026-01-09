/**
 * @pdfn/vite - Vite plugin for pre-compiling Tailwind CSS and Document CSS
 *
 * Enables edge runtime support by compiling Tailwind at build time
 * instead of runtime. Works seamlessly with `<Tailwind>` component.
 *
 * Also handles cssFile prop on Document component by inlining CSS at build time.
 */

import type { Plugin, ViteDevServer } from "vite";
import fg from "fast-glob";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

export interface PdfnTailwindOptions {
  /**
   * Glob patterns for template files to scan for Tailwind classes.
   * @default ['./pdf-templates/**\/*.tsx', './src/pdf/**\/*.tsx']
   */
  templates?: string | string[];

  /**
   * Path to CSS file containing Tailwind imports and theme.
   * If not provided, will auto-detect from common locations.
   */
  cssPath?: string;

  /**
   * Enable debug logging for CSS compilation.
   * @default false
   */
  debug?: boolean;
}

/**
 * Virtual module ID for pre-compiled Tailwind CSS
 */
const VIRTUAL_MODULE_ID = "virtual:pdfn-tailwind-css";
const RESOLVED_VIRTUAL_MODULE_ID = "\0" + VIRTUAL_MODULE_ID;

/**
 * Marker to identify pre-compiled CSS in the bundle
 */
export const PRECOMPILED_CSS_MARKER = "__PDFN_PRECOMPILED_CSS__";

/**
 * Extract class names from file content
 */
function extractClassesFromContent(content: string): string[] {
  const classes = new Set<string>();

  // Match className="..." and class="..."
  const classRegex = /(?:className|class)=["']([^"']+)["']/g;
  let match;
  while ((match = classRegex.exec(content)) !== null) {
    const classValue = match[1];
    if (classValue) {
      // Handle template literals and conditional classes
      // Extract static class names, skip dynamic expressions
      classValue.split(/\s+/).forEach((cls) => {
        // Skip template literal expressions ${...}
        if (cls && !cls.includes("${") && !cls.startsWith("{")) {
          classes.add(cls);
        }
      });
    }
  }

  // Also match template literal className={`...`}
  const templateRegex = /className=\{`([^`]+)`\}/g;
  while ((match = templateRegex.exec(content)) !== null) {
    const classValue = match[1];
    if (classValue) {
      // Extract static parts, skip ${...} expressions
      const staticParts = classValue.replace(/\$\{[^}]+\}/g, " ");
      staticParts.split(/\s+/).forEach((cls) => {
        if (cls) classes.add(cls);
      });
    }
  }

  // Match clsx/cn function calls: cn("class1", "class2", condition && "class3")
  const clsxRegex = /(?:cn|clsx|cx)\s*\(\s*([^)]+)\)/g;
  while ((match = clsxRegex.exec(content)) !== null) {
    const args = match[1];
    if (!args) continue;
    // Extract string literals from arguments
    const stringRegex = /["']([^"']+)["']/g;
    let stringMatch;
    while ((stringMatch = stringRegex.exec(args)) !== null) {
      const classValue = stringMatch[1];
      if (!classValue) continue;
      classValue.split(/\s+/).forEach((cls) => {
        if (cls) classes.add(cls);
      });
    }
  }

  return Array.from(classes);
}

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
 * Create the pdfn Tailwind Vite plugin
 */
export function pdfnTailwind(options: PdfnTailwindOptions = {}): Plugin {
  const {
    templates = ["./pdf-templates/**/*.tsx", "./src/pdf/**/*.tsx"],
    cssPath,
    debug = false,
  } = options;

  let generatedCss = "";
  let server: ViteDevServer | null = null;
  let isBuilding = false;

  // Track CSS file dependencies for HMR (cssFile -> Set of template ids)
  const cssFileDependencies = new Map<string, Set<string>>();

  const log = (...args: unknown[]) => {
    if (debug) console.log("[pdfn:vite]", ...args);
  };

  // Normalize templates to array
  const templatePatterns = Array.isArray(templates) ? templates : [templates];

  /**
   * Scan templates and compile Tailwind CSS
   */
  async function compileTailwindCss(): Promise<string> {
    // Dynamically import Node.js modules
    const [fs, path, { createRequire }, { compile }] = await Promise.all([
      import("node:fs"),
      import("node:path"),
      import("node:module"),
      import("tailwindcss"),
    ]);

    const cwd = process.cwd();

    // Find all template files
    const files = await fg(templatePatterns, {
      cwd,
      absolute: true,
      ignore: ["**/node_modules/**"],
    });

    if (files.length === 0) {
      console.warn("[pdfn:vite] No template files found matching patterns:", templatePatterns);
      return "";
    }

    // Extract classes from all files
    const allClasses = new Set<string>();
    for (const file of files) {
      const content = fs.readFileSync(file, "utf8");
      const classes = extractClassesFromContent(content);
      classes.forEach((cls) => allClasses.add(cls));
    }

    if (allClasses.size === 0) {
      return "";
    }

    // Get base CSS
    const baseCss = await getBaseCss(fs, path, cssPath);

    // Find tailwindcss package
    const req = createRequire(cwd + "/package.json");
    let tailwindRoot: string;
    try {
      const tailwindPkgPath = req.resolve("tailwindcss/package.json");
      tailwindRoot = path.dirname(tailwindPkgPath);
    } catch {
      throw new Error("Could not find tailwindcss package");
    }

    // Compile CSS
    const compiler = await compile(baseCss, {
      loadStylesheet: async (id: string, base: string) => {
        if (id === "tailwindcss") {
          const twCssPath = path.join(tailwindRoot, "index.css");
          if (fs.existsSync(twCssPath)) {
            const content = fs.readFileSync(twCssPath, "utf8");
            return { path: twCssPath, content, base: tailwindRoot };
          }
          throw new Error(`Tailwind CSS index.css not found at: ${twCssPath}`);
        }

        // Handle URL imports - skip
        if (id.startsWith("http://") || id.startsWith("https://")) {
          return { path: id, content: "", base };
        }

        // Handle relative imports
        const resolveFrom = base || cwd;
        const fullPath = path.resolve(resolveFrom, id);

        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, "utf8");
          return { path: fullPath, content, base: path.dirname(fullPath) };
        }

        const cssPathWithExt = fullPath + ".css";
        if (fs.existsSync(cssPathWithExt)) {
          const content = fs.readFileSync(cssPathWithExt, "utf8");
          return { path: cssPathWithExt, content, base: path.dirname(cssPathWithExt) };
        }

        const twPath = path.resolve(tailwindRoot, id);
        if (fs.existsSync(twPath)) {
          const content = fs.readFileSync(twPath, "utf8");
          return { path: twPath, content, base: path.dirname(twPath) };
        }

        throw new Error(`Could not load stylesheet: ${id}`);
      },
      loadModule: async () => {
        throw new Error("Module loading not supported in build-time compilation");
      },
    });

    const css = compiler.build(Array.from(allClasses));

    log(`Compiled ${css.length} bytes of CSS from ${allClasses.size} classes in ${files.length} files`);

    return css;
  }

  /**
   * Get base CSS content
   */
  async function getBaseCss(
    fs: typeof import("node:fs"),
    path: typeof import("node:path"),
    explicitPath?: string
  ): Promise<string> {
    const cwd = process.cwd();

    // Explicit path provided
    if (explicitPath) {
      const fullPath = path.resolve(cwd, explicitPath);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`CSS file not found: ${explicitPath}`);
      }
      return fs.readFileSync(fullPath, "utf8");
    }

    // Auto-detect
    for (const relativePath of COMMON_CSS_PATHS) {
      const fullPath = path.resolve(cwd, relativePath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf8");
        if (content.includes("tailwindcss") || content.includes("@tailwind")) {
          log(`Using CSS file: ${relativePath}`);
          return content;
        }
      }
    }

    // Fall back to vanilla Tailwind
    log("No custom CSS found, using vanilla Tailwind");
    return '@import "tailwindcss";';
  }

  return {
    name: "pdfn-tailwind",

    async buildStart() {
      isBuilding = true;
      generatedCss = await compileTailwindCss();
    },

    configureServer(devServer) {
      server = devServer;
    },

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
    },

    async load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        // In dev mode, always recompile to pick up changes
        // In build mode, use cached CSS from buildStart
        if (!isBuilding) {
          generatedCss = await compileTailwindCss();
        }
        // Export as a module with the CSS string
        return `export const css = ${JSON.stringify(generatedCss)};
export const marker = "${PRECOMPILED_CSS_MARKER}";
export default css;`;
      }
    },

    /**
     * Transform <Tailwind> to inject pre-compiled CSS
     * Transform cssFile props to inline CSS
     */
    transform(code, id) {
      // Skip node_modules
      if (id.includes("node_modules")) {
        return null;
      }

      let transformed = code;
      let hasChanges = false;

      // --- Handle Tailwind transform ---
      if (code.includes("@pdfn/tailwind") && code.includes("<Tailwind")) {
        // Check if file already imports from virtual module
        if (!code.includes(VIRTUAL_MODULE_ID)) {
          // Add import for pre-compiled CSS
          const importStatement = `import { css as __pdfnPrecompiledCss__ } from "${VIRTUAL_MODULE_ID}";\n`;

          // Transform <Tailwind> to <Tailwind css={__pdfnPrecompiledCss__}>
          // Handle both <Tailwind> and <Tailwind ...props>
          let tailwindTransformed = transformed;

          // Replace <Tailwind> with <Tailwind css={__pdfnPrecompiledCss__}>
          tailwindTransformed = tailwindTransformed.replace(
            /<Tailwind(\s*)>/g,
            "<Tailwind css={__pdfnPrecompiledCss__}>"
          );

          // Replace <Tailwind ...props> with <Tailwind css={__pdfnPrecompiledCss__} ...props>
          // But only if css prop is not already present
          tailwindTransformed = tailwindTransformed.replace(
            /<Tailwind(\s+)(?!css=)/g,
            "<Tailwind$1css={__pdfnPrecompiledCss__} "
          );

          // Only add import if we made changes
          if (tailwindTransformed !== transformed) {
            transformed = importStatement + tailwindTransformed;
            hasChanges = true;
          }
        }
      }

      // --- Handle Document cssFile prop ---
      if (code.includes("cssFile=")) {
        const cssFileRegex = /cssFile=["']([^"']+)["']/g;

        // Collect all matches first (we need to process in reverse order)
        const matches: Array<{ full: string; path: string; index: number }> = [];
        let cssMatch;
        while ((cssMatch = cssFileRegex.exec(transformed)) !== null) {
          const matchPath = cssMatch[1];
          if (!matchPath) continue;
          matches.push({
            full: cssMatch[0],
            path: matchPath,
            index: cssMatch.index,
          });
        }

        // Process in reverse order to maintain string indices
        for (const match of matches.reverse()) {
          const cssFilePath = match.path;

          // Resolve path relative to the template file
          const templateDir = dirname(id);
          const fullCssPath = resolve(templateDir, cssFilePath);

          // Track for HMR
          if (!cssFileDependencies.has(fullCssPath)) {
            cssFileDependencies.set(fullCssPath, new Set());
          }
          cssFileDependencies.get(fullCssPath)!.add(id);

          // Check file exists
          if (!existsSync(fullCssPath)) {
            this.error(
              `CSS file not found: ${cssFilePath}\n` +
                `Resolved to: ${fullCssPath}\n` +
                `Template: ${id}`
            );
            continue;
          }

          // Read and encode CSS
          const cssContent = readFileSync(fullCssPath, "utf8");
          const encoded = Buffer.from(cssContent).toString("base64");

          // Replace cssFile="./x.css" with css={decoded}
          // Use an IIFE to decode base64 at runtime
          const replacement = `css={(() => {
            const e = "${encoded}";
            return typeof Buffer !== 'undefined'
              ? Buffer.from(e, 'base64').toString('utf8')
              : decodeURIComponent(escape(atob(e)));
          })()}`;

          transformed =
            transformed.slice(0, match.index) +
            replacement +
            transformed.slice(match.index + match.full.length);

          hasChanges = true;
          log(`Inlined CSS from ${cssFilePath}`);
        }
      }

      if (hasChanges) {
        return {
          code: transformed,
          map: null, // TODO: Generate proper source map
        };
      }

      return null;
    },

    /**
     * Handle HMR - regenerate CSS when templates or CSS files change
     */
    async handleHotUpdate({ file, server: hmrServer }) {
      // Check if changed file is a CSS file we're tracking (for cssFile prop)
      if (file.endsWith(".css") && cssFileDependencies.has(file)) {
        const dependentTemplates = cssFileDependencies.get(file)!;
        log(`CSS file changed: ${file} (used by ${dependentTemplates.size} template(s))`);

        // Invalidate all templates that use this CSS file
        for (const templateId of dependentTemplates) {
          const mod = hmrServer.moduleGraph.getModuleById(templateId);
          if (mod) {
            hmrServer.moduleGraph.invalidateModule(mod);
          }
        }

        // Trigger full reload
        hmrServer.ws.send({
          type: "full-reload",
        });

        return;
      }

      // Check if changed file matches our template patterns
      const isTemplate = templatePatterns.some((pattern) => {
        // Simple glob matching - convert glob to regex
        const regexPattern = pattern
          .replace(/\*\*/g, ".*")
          .replace(/\*/g, "[^/]*")
          .replace(/\./g, "\\.");
        return new RegExp(regexPattern).test(file);
      });

      if (isTemplate) {
        log(`Template changed: ${file}`);

        // Recompile Tailwind CSS
        generatedCss = await compileTailwindCss();

        // Invalidate virtual module and all its importers
        const mod = hmrServer.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID);
        if (mod) {
          hmrServer.moduleGraph.invalidateModule(mod);
          // Also invalidate all modules that import the virtual module
          for (const importer of mod.importers) {
            hmrServer.moduleGraph.invalidateModule(importer);
          }
        }

        // Trigger full reload for client
        hmrServer.ws.send({
          type: "full-reload",
        });
      }
    },
  };
}

export default pdfnTailwind;
