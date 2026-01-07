/**
 * @pdfn/next - Next.js plugin for pre-compiling Tailwind CSS
 *
 * Enables optimized PDF generation by compiling Tailwind at build time
 * instead of runtime. Works with both Turbopack (Next.js 16+) and webpack.
 */

import type { NextConfig } from "next";
import { compileTailwindCss, type PdfnPluginOptions } from "./plugin.js";
import { join } from "node:path";
import { watch } from "node:fs";

export type { PdfnPluginOptions };

// Re-export Tailwind component for convenience
// Users can import { Tailwind } from '@pdfn/next' instead of installing @pdfn/tailwind separately
export { Tailwind } from "@pdfn/tailwind";

// Track if watcher is already running (prevent duplicates)
let watcherStarted = false;

// Virtual module ID used in imports (must not start with . to avoid relative resolution)
const VIRTUAL_MODULE_ID = "__pdfn_tailwind_css__";

// Get the loader path - resolve from the user's node_modules
function getLoaderPath(cwd: string): string {
  return join(cwd, "node_modules", "@pdfn", "next", "dist", "transform-loader.cjs");
}

// Get the path to the generated CSS module (relative to project root for Turbopack)
function getCssModuleRelativePath(): string {
  return "./node_modules/.pdfn/tailwind.js";
}

// Get the absolute path to the generated CSS module (for webpack)
function getCssModuleAbsolutePath(cwd: string): string {
  return join(cwd, "node_modules", ".pdfn", "tailwind.js");
}

/**
 * Start watching template directories for changes and recompile CSS
 */
function startTemplateWatcher(
  templatePatterns: string[],
  cssPath: string | undefined,
  cwd: string
): void {
  // Extract directory paths from glob patterns
  const watchDirs = new Set<string>();
  for (const pattern of templatePatterns) {
    // Get the directory part before any glob wildcards
    const parts = pattern.split("/");
    const dirParts: string[] = [];
    for (const part of parts) {
      if (part.includes("*")) break;
      dirParts.push(part);
    }
    if (dirParts.length > 0) {
      watchDirs.add(join(cwd, dirParts.join("/")));
    }
  }

  // Debounce recompilation
  let recompileTimeout: ReturnType<typeof setTimeout> | null = null;
  const debouncedRecompile = () => {
    if (recompileTimeout) clearTimeout(recompileTimeout);
    recompileTimeout = setTimeout(async () => {
      console.log("[pdfn:next] Template changed, recompiling CSS...");
      try {
        await compileTailwindCss(templatePatterns, cssPath, cwd);
      } catch (error) {
        console.error("[pdfn:next] CSS recompilation failed:", error);
      }
    }, 100);
  };

  // Watch each directory
  for (const dir of watchDirs) {
    try {
      watch(dir, { recursive: true }, (eventType, filename) => {
        if (filename && /\.(tsx?|jsx?)$/.test(filename)) {
          debouncedRecompile();
        }
      });
      console.log(`[pdfn:next] Watching for changes: ${dir}`);
    } catch {
      // Directory might not exist, ignore
    }
  }
}

/**
 * Wrap your Next.js config with pdfn Tailwind pre-compilation
 *
 * Only needed if you use @pdfn/tailwind and deploy to serverless/edge.
 * If you use inline styles, no build config is required.
 *
 * @example
 * ```ts
 * // next.config.ts
 * import { withPdfnTailwind } from '@pdfn/next';
 *
 * export default withPdfnTailwind({
 *   templates: ['./pdf-templates/*.tsx'],
 * })({
 *   // your Next.js config
 * });
 * ```
 */
export function withPdfnTailwind(options: PdfnPluginOptions = {}) {
  return async (nextConfig: NextConfig = {}): Promise<NextConfig> => {
    const cwd = process.cwd();
    const templates = options.templates || ["./pdf-templates/**/*.tsx", "./src/pdf/**/*.tsx"];
    const templatePatterns = Array.isArray(templates) ? templates : [templates];

    // Pre-compile CSS before build starts
    // This runs when the config is loaded (before webpack or Turbopack)
    await compileTailwindCss(templatePatterns, options.cssPath, cwd);

    // In dev mode, watch template files for changes and recompile CSS
    const isDev = process.env.NODE_ENV !== "production";
    if (isDev && !watcherStarted) {
      watcherStarted = true;
      startTemplateWatcher(templatePatterns, options.cssPath, cwd);
    }

    // Path to the loader and CSS module
    const loaderPath = getLoaderPath(cwd);
    const cssModuleRelative = getCssModuleRelativePath();
    const cssModuleAbsolute = getCssModuleAbsolutePath(cwd);

    // Build turbopack config
    const existingTurbopack = (nextConfig as Record<string, unknown>).turbopack as Record<string, unknown> | undefined;
    const existingRules = existingTurbopack?.rules as Record<string, unknown> | undefined;
    const existingResolveAlias = existingTurbopack?.resolveAlias as Record<string, string> | undefined;

    return {
      ...nextConfig,

      // Turbopack configuration (Next.js 16+ default)
      turbopack: {
        ...existingTurbopack,
        resolveAlias: {
          ...existingResolveAlias,
          // Map virtual module ID to relative path (Turbopack needs relative)
          [VIRTUAL_MODULE_ID]: cssModuleRelative,
        },
        rules: {
          ...existingRules,
          // Apply loader to tsx/jsx files that use @pdfn/tailwind
          "*.tsx": {
            loaders: [loaderPath],
          },
          "*.jsx": {
            loaders: [loaderPath],
          },
        },
      },

      // Webpack configuration (for --webpack flag or older Next.js)
      webpack: (config, context) => {
        // Add resolve alias for the virtual module
        config.resolve = config.resolve || {};
        config.resolve.alias = config.resolve.alias || {};
        if (Array.isArray(config.resolve.alias)) {
          config.resolve.alias.push({
            name: VIRTUAL_MODULE_ID,
            alias: cssModuleAbsolute,
          });
        } else {
          (config.resolve.alias as Record<string, string>)[VIRTUAL_MODULE_ID] = cssModuleAbsolute;
        }

        // Only add loader on server-side build
        if (context.isServer) {
          config.module = config.module || {};
          config.module.rules = config.module.rules || [];

          // Add our transform loader
          config.module.rules.push({
            test: /\.(tsx?|jsx?)$/,
            exclude: /node_modules/,
            use: [
              {
                loader: loaderPath,
              },
            ],
          });
        }

        // Call existing webpack config if present
        if (typeof nextConfig.webpack === "function") {
          return nextConfig.webpack(config, context);
        }

        return config;
      },
    };
  };
}

export default withPdfnTailwind;
