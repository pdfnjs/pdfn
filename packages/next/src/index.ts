/**
 * @pdfn/next - Next.js plugin for pdfn
 *
 * Provides build-time support for pdfn features:
 * - Tailwind CSS pre-compilation (for edge deployment)
 * - Client component marking (for "use client" components like Recharts)
 * - Template marking (for client-side bundling)
 * - renderTemplate() helper for API routes
 *
 * Works with both Turbopack (Next.js 16+) and webpack.
 * CSS is loaded from `pdfn-templates/styles.css` by convention.
 */

import type { NextConfig } from "next";

// Re-export renderTemplate helper
export {
  renderTemplate,
  requiresClientRendering,
  __setPrecompiledCss,
  type RenderTemplateOptions,
  type RenderTemplateResult,
} from "./render-template.js";

// Re-export bundle manifest setter (used by transform-loader injected code)
export { __setBundleManifest } from "./bundle-loader.js";
import { compileTailwindCss, bundleClientTemplates } from "./plugin.js";
import { join } from "node:path";
import { watch, existsSync } from "node:fs";

// Track if watcher is already running (prevent duplicates)
let watcherStarted = false;

// Virtual module IDs used in imports (must not start with . to avoid relative resolution)
const TAILWIND_MODULE_ID = "__pdfn_tailwind_css__";
const BUNDLES_MODULE_ID = "__pdfn_bundles__";

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

// Get the path to the generated bundles module (relative to project root for Turbopack)
function getBundlesModuleRelativePath(): string {
  return "./node_modules/.pdfn/bundles.js";
}

// Get the absolute path to the generated bundles module (for webpack)
function getBundlesModuleAbsolutePath(cwd: string): string {
  return join(cwd, "node_modules", ".pdfn", "bundles.js");
}

/**
 * Start watching pdfn-templates/ directory for changes and recompile CSS/rebundle
 */
function startTemplateWatcher(cwd: string, debug = false): void {
  const log = (...args: unknown[]) => {
    if (debug) console.log("[pdfn:next]", ...args);
  };

  const watchDirs = new Set<string>();

  // Watch the main templates directory
  const templatesDir = join(cwd, "pdfn-templates");
  if (existsSync(templatesDir)) {
    watchDirs.add(templatesDir);
  }

  // Also watch the pdfn-templates/styles directory for CSS changes
  const stylesDir = join(cwd, "pdfn-templates", "styles");
  if (existsSync(stylesDir)) {
    watchDirs.add(stylesDir);
  }

  // Debounce recompilation
  let recompileTimeout: ReturnType<typeof setTimeout> | null = null;
  const debouncedRecompile = (reason: string, isTemplate: boolean) => {
    if (recompileTimeout) clearTimeout(recompileTimeout);
    recompileTimeout = setTimeout(async () => {
      log(`${reason}, recompiling...`);
      try {
        // Always recompile CSS
        await compileTailwindCss(cwd, debug);
        // Rebundle client templates when template files change
        if (isTemplate) {
          await bundleClientTemplates(cwd, debug);
        }
      } catch (error) {
        console.error("[pdfn:next] Recompilation failed:", error);
      }
    }, 100);
  };

  // Watch each directory
  for (const dir of watchDirs) {
    try {
      watch(dir, { recursive: true }, (eventType, filename) => {
        if (!filename) return;

        // Handle CSS file changes
        if (filename.endsWith(".css")) {
          debouncedRecompile(`CSS file changed: ${filename}`, false);
          return;
        }

        // Handle template file changes
        if (/\.(tsx?|jsx?)$/.test(filename)) {
          debouncedRecompile(`Template changed: ${filename}`, true);
        }
      });
      log(`Watching for changes: ${dir}`);
    } catch {
      // Directory might not exist, ignore
    }
  }

  // Also watch the main styles.css file directly
  const mainStylesPath = join(cwd, "pdfn-templates", "styles.css");
  if (existsSync(mainStylesPath)) {
    try {
      watch(mainStylesPath, () => {
        debouncedRecompile("styles.css changed", false);
      });
      log(`Watching for changes: ${mainStylesPath}`);
    } catch {
      // File might not exist, ignore
    }
  }
}

/**
 * Options for the pdfn Next.js plugin
 */
export interface PdfnNextOptions {
  /**
   * Enable Tailwind CSS pre-compilation.
   * Set to false if you don't use @pdfn/tailwind.
   * @default true
   */
  tailwind?: boolean;

  /**
   * Enable debug logging.
   * @default false
   */
  debug?: boolean;
}

/**
 * Wrap your Next.js config with pdfn support
 *
 * Enables:
 * - Tailwind CSS pre-compilation (for edge deployment)
 * - Client component marking (for "use client" components like Recharts)
 * - Template marking (for client-side bundling)
 *
 * Templates are read from `pdfn-templates/` directory by convention.
 *
 * @example
 * ```ts
 * // next.config.ts
 * import { withPdfn } from '@pdfn/next';
 *
 * const nextConfig = {
 *   // your config
 * };
 *
 * export default withPdfn()(nextConfig);
 * ```
 */
export function withPdfn(options: PdfnNextOptions = {}) {
  return async (nextConfig: NextConfig = {}): Promise<NextConfig> => {
    const cwd = process.cwd();
    const debug = options.debug ?? false;
    const enableTailwind = options.tailwind ?? true;

    // Pre-compile CSS before build starts (if Tailwind is enabled)
    // This runs when the config is loaded (before webpack or Turbopack)
    if (enableTailwind) {
      await compileTailwindCss(cwd, debug);
    }

    // Pre-bundle client templates (those with "use client" directive)
    // This eliminates the need for runtime esbuild
    await bundleClientTemplates(cwd, debug);

    // In dev mode, watch template files for changes and recompile CSS (if Tailwind is enabled)
    const isDev = process.env.NODE_ENV !== "production";
    if (enableTailwind && isDev && !watcherStarted) {
      watcherStarted = true;
      startTemplateWatcher(cwd, debug);
    }

    // Path to the loader and modules
    const loaderPath = getLoaderPath(cwd);
    const cssModuleRelative = getCssModuleRelativePath();
    const cssModuleAbsolute = getCssModuleAbsolutePath(cwd);
    const bundlesModuleRelative = getBundlesModuleRelativePath();
    const bundlesModuleAbsolute = getBundlesModuleAbsolutePath(cwd);

    // Build turbopack config
    const existingTurbopack = (nextConfig as Record<string, unknown>).turbopack as Record<string, unknown> | undefined;
    const existingRules = existingTurbopack?.rules as Record<string, unknown> | undefined;
    const existingResolveAlias = existingTurbopack?.resolveAlias as Record<string, string> | undefined;

    // Merge serverExternalPackages - esbuild has native binaries that can't be bundled by Turbopack
    // This is automatically added so users don't need to configure it manually
    const existingExternals = (nextConfig.serverExternalPackages as string[]) || [];
    const pdfnExternals = ["esbuild"];
    const serverExternalPackages = [...new Set([...existingExternals, ...pdfnExternals])];

    return {
      ...nextConfig,

      // Externalize packages with native binaries (esbuild is used at build time for template bundling)
      serverExternalPackages,

      // Turbopack configuration (Next.js 16+ default)
      turbopack: {
        ...existingTurbopack,
        resolveAlias: {
          ...existingResolveAlias,
          // Map virtual module IDs to relative paths (Turbopack needs relative)
          [TAILWIND_MODULE_ID]: cssModuleRelative,
          [BUNDLES_MODULE_ID]: bundlesModuleRelative,
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
        // Add resolve aliases for the virtual modules
        config.resolve = config.resolve || {};
        config.resolve.alias = config.resolve.alias || {};
        if (Array.isArray(config.resolve.alias)) {
          config.resolve.alias.push(
            { name: TAILWIND_MODULE_ID, alias: cssModuleAbsolute },
            { name: BUNDLES_MODULE_ID, alias: bundlesModuleAbsolute }
          );
        } else {
          (config.resolve.alias as Record<string, string>)[TAILWIND_MODULE_ID] = cssModuleAbsolute;
          (config.resolve.alias as Record<string, string>)[BUNDLES_MODULE_ID] = bundlesModuleAbsolute;
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

export default withPdfn;
