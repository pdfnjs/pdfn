/**
 * @pdfn/vite - Vite plugin for pdfn
 *
 * Provides build-time support for pdfn features:
 * - Tailwind CSS pre-compilation (for edge deployment)
 * - Client component marking (for "use client" components like Recharts)
 * - Template marking (for client-side bundling)
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { pdfn } from '@pdfn/vite';
 *
 * export default {
 *   plugins: [pdfn()]
 * };
 * ```
 */

import type { Plugin, ViteDevServer } from "vite";
import {
  parseExportsFromCode,
  hasDefaultExport,
  getDefaultExportName,
  hasUseClientDirective,
} from "@pdfn/core";
import { compileTailwind } from "@pdfn/core/tailwind";

/**
 * Options for the Tailwind pre-compilation plugin
 */
interface PdfnTailwindOptions {
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
const PRECOMPILED_CSS_MARKER = "__PDFN_PRECOMPILED_CSS__";

/**
 * Create the pdfn Tailwind Vite plugin (internal)
 */
function pdfnTailwind(options: PdfnTailwindOptions = {}): Plugin {
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
   * Compile Tailwind CSS using the shared core function
   */
  async function compileTailwindCss(): Promise<string> {
    const { css } = await compileTailwind({
      templatePatterns,
      cssPath,
      cwd: process.cwd(),
      debug,
      logPrefix: "[pdfn:vite]",
    });
    return css;
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
const marker = "${PRECOMPILED_CSS_MARKER}";
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

/**
 * Vite plugin that marks "use client" components (internal).
 *
 * Adds runtime markers that @pdfn/client can detect:
 * - `__pdfn_client = true` - marks the component as a client component
 * - `__pdfn_source = "/path/to/file.tsx"` - stores the source path for bundling
 */
function pdfnClientMarker(): Plugin {
  const debug = process.env.DEBUG?.includes("pdfn");

  return {
    name: "pdfn-client-marker",

    transform(code, id) {
      // Skip node_modules
      if (id.includes("node_modules")) {
        return null;
      }

      // Only process .tsx, .ts, .jsx, .js files
      if (!/\.(tsx?|jsx?)$/.test(id)) {
        return null;
      }

      // Check for "use client" directive at the start of the file
      if (!hasUseClientDirective(code)) {
        return null;
      }

      if (debug) {
        console.log(`[pdfn:vite] client-marker: found "use client" in ${id}`);
      }

      // Parse exports from the code
      const exports = parseExportsFromCode(code);

      if (exports.length === 0) {
        if (debug) {
          console.log(`[pdfn:vite] client-marker: no exports found in ${id}`);
        }
        return null;
      }

      if (debug) {
        console.log(`[pdfn:vite] client-marker: marking exports [${exports.join(", ")}] in ${id}`);
      }

      // Generate marker code
      const markerCode = exports
        .map(
          (name) =>
            `\ntry { ${name}.__pdfn_client = true; ${name}.__pdfn_source = ${JSON.stringify(id)}; } catch(e) {}`
        )
        .join("");

      return {
        code: code + markerCode,
        map: null,
      };
    },
  };
}

interface PdfnTemplateMarkerOptions {
  /**
   * Glob patterns for template files.
   * @default ['./pdfn-templates/*.tsx']
   */
  templates?: string | string[];
}

/**
 * Vite plugin that marks template files with their source path (internal).
 *
 * Adds `__pdfn_template_source` to the default export of template files,
 * enabling @pdfn/client to bundle the entire template.
 */
function pdfnTemplateMarker(options: PdfnTemplateMarkerOptions = {}): Plugin {
  const { templates = ["./pdfn-templates/*.tsx"] } = options;
  const debug = process.env.DEBUG?.includes("pdfn");

  // Normalize to array
  const templatePatterns = Array.isArray(templates) ? templates : [templates];

  if (debug) {
    console.log(`[pdfn:vite] template-marker: patterns = ${JSON.stringify(templatePatterns)}`);
  }

  // Extract the significant part of patterns for matching (after ./ or just the path)
  // This allows matching against absolute file paths
  const patternRegexes = templatePatterns.map((pattern) => {
    // Remove leading ./ if present
    const normalizedPattern = pattern.replace(/^\.\//, "");
    const regexPattern = normalizedPattern
      .replace(/\./g, "\\.")
      .replace(/\*\*/g, ".*")
      .replace(/\*/g, "[^/]*");
    // Match anywhere in the path (for absolute paths)
    return new RegExp(regexPattern + "$");
  });

  return {
    name: "pdfn-template-marker",

    transform(code, id) {
      // Skip node_modules
      if (id.includes("node_modules")) {
        return null;
      }

      // Only process .tsx files
      if (!id.endsWith(".tsx")) {
        return null;
      }

      // Check if file matches template patterns
      const isTemplate = patternRegexes.some((regex) => regex.test(id));
      if (!isTemplate) {
        if (debug) {
          console.log(`[pdfn:vite] template-marker: ${id} does not match template patterns`);
        }
        return null;
      }

      if (debug) {
        console.log(`[pdfn:vite] template-marker: processing template ${id}`);
      }

      // Check if file has a default export
      if (!hasDefaultExport(code)) {
        if (debug) {
          console.log(`[pdfn:vite] template-marker: ${id} has no default export`);
        }
        return null;
      }

      // Get the default export name if available
      const defaultName = getDefaultExportName(code);

      let markerCode: string;
      if (defaultName) {
        // Named default export: export default function Report() {}
        markerCode = `\ntry { ${defaultName}.__pdfn_template_source = ${JSON.stringify(id)}; } catch(e) {}`;
        if (debug) {
          console.log(`[pdfn:vite] template-marker: marking ${defaultName} in ${id}`);
        }
      } else {
        // Anonymous default export: export default () => {}
        // We need to wrap it - but this is rare for templates
        // For now, warn and skip
        console.warn(`[pdfn:vite] Template ${id} has anonymous default export. Use named exports for best compatibility.`);
        return null;
      }

      return {
        code: code + markerCode,
        map: null,
      };
    },
  };
}

/**
 * Options for the unified pdfn() plugin
 */
export interface PdfnOptions {
  /**
   * Glob patterns for template files.
   * Used for both Tailwind CSS compilation and template marking.
   * @default ['./pdfn-templates/**\/*.tsx']
   */
  templates?: string | string[];

  /**
   * Path to CSS file containing Tailwind imports and theme.
   * @default './pdfn-templates/styles.css'
   */
  cssPath?: string;

  /**
   * Enable debug logging.
   * @default false
   */
  debug?: boolean;

  /**
   * Enable Tailwind CSS pre-compilation.
   * Set to false if you don't use @pdfn/tailwind.
   * @default true
   */
  tailwind?: boolean;
}

/**
 * Unified pdfn plugin for Vite.
 *
 * Combines all pdfn functionality into a single plugin:
 * - Tailwind CSS pre-compilation (for edge deployment)
 * - Client component marking (for "use client" components like Recharts)
 * - Template marking (for client-side bundling)
 *
 * @example Basic usage
 * ```ts
 * // vite.config.ts
 * import { pdfn } from '@pdfn/vite';
 *
 * export default {
 *   plugins: [pdfn()]
 * };
 * ```
 *
 * @example With options
 * ```ts
 * import { pdfn } from '@pdfn/vite';
 *
 * export default {
 *   plugins: [pdfn({
 *     templates: ['./src/templates/**\/*.tsx'],
 *     tailwind: false  // Disable if not using Tailwind
 *   })]
 * };
 * ```
 */
export function pdfn(options: PdfnOptions = {}): Plugin[] {
  const {
    templates = ["./pdfn-templates/**/*.tsx"],
    cssPath,
    debug = false,
    tailwind = true,
  } = options;

  const plugins: Plugin[] = [];

  // Add Tailwind pre-compilation plugin (optional, enabled by default)
  if (tailwind) {
    plugins.push(pdfnTailwind({ templates, cssPath, debug }));
  }

  // Add client component marker plugin (for "use client" components)
  plugins.push(pdfnClientMarker());

  // Add template marker plugin (for client-side bundling)
  // Extract root template patterns (files directly in templates dir)
  const templatePatterns = Array.isArray(templates) ? templates : [templates];
  const rootTemplatePatterns = templatePatterns.map((pattern) => {
    // Convert **/*.tsx to *.tsx for root-level only
    return pattern.replace(/\*\*\/\*\.tsx$/, "*.tsx");
  });
  plugins.push(pdfnTemplateMarker({ templates: rootTemplatePatterns }));

  return plugins;
}
