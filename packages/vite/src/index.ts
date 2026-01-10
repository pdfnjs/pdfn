/**
 * @pdfn/vite - Vite plugin for pre-compiling Tailwind CSS
 *
 * Enables edge runtime support by compiling Tailwind at build time
 * instead of runtime. Works seamlessly with `<Tailwind>` component.
 *
 * CSS is loaded from `pdfn-templates/styles.css` by convention.
 */

import type { Plugin, ViteDevServer } from "vite";
import fg from "fast-glob";

/**
 * Standardized path for PDF template styles
 */
const PDF_STYLES_PATH = "./pdfn-templates/styles.css";

export interface PdfnTailwindOptions {
  /**
   * Glob patterns for template files to scan for Tailwind classes.
   * @default ['./pdfn-templates/**\/*.tsx']
   */
  templates?: string | string[];

  /**
   * Path to CSS file containing Tailwind imports and theme.
   * @default './pdfn-templates/styles.css'
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
 * Create the pdfn Tailwind Vite plugin
 */
export function pdfnTailwind(options: PdfnTailwindOptions = {}): Plugin {
  const {
    templates = ["./pdfn-templates/**/*.tsx"],
    cssPath,
    debug = false,
  } = options;

  let generatedCss = "";
  let server: ViteDevServer | null = null;
  let isBuilding = false;

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

    // The base directory for the initial CSS (pdfn-templates/)
    const stylesBaseDir = path.resolve(cwd, "pdfn-templates");

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
        // Default to pdfn-templates/ for imports from the initial CSS (styles.css)
        const resolveFrom = base || stylesBaseDir;
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
   * Get base CSS content - from pdfn-templates/styles.css or vanilla Tailwind
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

    // Check for pdfn-templates/styles.css (convention over configuration)
    const stylesPath = path.resolve(cwd, PDF_STYLES_PATH);
    if (fs.existsSync(stylesPath)) {
      log(`Using CSS file: ${PDF_STYLES_PATH}`);
      return fs.readFileSync(stylesPath, "utf8");
    }

    // Fall back to vanilla Tailwind
    log("No pdfn-templates/styles.css found, using vanilla Tailwind");
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
     *
     * FIXME: Add support for inlining CSS files read via fs.readFileSync at build time
     * This would enable plain CSS templates to work on edge runtimes without <Tailwind> wrapper
     */
    transform(code, id) {
      // Skip node_modules
      if (id.includes("node_modules")) {
        return null;
      }

      // Only handle files that use @pdfn/tailwind
      if (!code.includes("@pdfn/tailwind") || !code.includes("<Tailwind")) {
        return null;
      }

      // Check if file already imports from virtual module
      if (code.includes(VIRTUAL_MODULE_ID)) {
        return null;
      }

      // Add import for pre-compiled CSS
      const importStatement = `import { css as __pdfnPrecompiledCss__ } from "${VIRTUAL_MODULE_ID}";\n`;

      // Transform <Tailwind> to <Tailwind css={__pdfnPrecompiledCss__}>
      // Handle both <Tailwind> and <Tailwind ...props>
      let transformed = code;

      // Replace <Tailwind> with <Tailwind css={__pdfnPrecompiledCss__}>
      transformed = transformed.replace(
        /<Tailwind(\s*)>/g,
        "<Tailwind css={__pdfnPrecompiledCss__}>"
      );

      // Replace <Tailwind ...props> with <Tailwind css={__pdfnPrecompiledCss__} ...props>
      // But only if css prop is not already present
      transformed = transformed.replace(
        /<Tailwind(\s+)(?!css=)/g,
        "<Tailwind$1css={__pdfnPrecompiledCss__} "
      );

      // Only add import if we made changes
      if (transformed !== code) {
        return {
          code: importStatement + transformed,
          map: null,
        };
      }

      return null;
    },

    /**
     * Handle HMR - regenerate CSS when templates or CSS files change
     */
    async handleHotUpdate({ file, server: hmrServer }) {
      // Check if changed file is in pdfn-templates CSS paths
      const isStylesCss = file.endsWith("pdfn-templates/styles.css");
      const isImportedCss = file.includes("pdfn-templates/styles/") && file.endsWith(".css");

      if (isStylesCss || isImportedCss) {
        log(`PDF styles changed: ${file}`);

        // Recompile Tailwind CSS
        generatedCss = await compileTailwindCss();

        // Invalidate virtual module and all its importers
        const mod = hmrServer.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID);
        if (mod) {
          hmrServer.moduleGraph.invalidateModule(mod);
          for (const importer of mod.importers) {
            hmrServer.moduleGraph.invalidateModule(importer);
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
