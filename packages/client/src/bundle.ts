import * as esbuild from "esbuild";
import { dirname, resolve, basename, extname } from "node:path";
import type { BundleOptions } from "./types.js";

/**
 * esbuild plugin to handle server-only packages when bundling for browser.
 *
 * Marks server-only packages as external and provides empty shims at runtime.
 * This allows templates that import @pdfn/react and @pdfn/tailwind to be
 * bundled for browser execution while the actual server logic is stripped.
 */
function serverOnlyPlugin(): esbuild.Plugin {
  // Packages that have server-only code but may export browser-safe components
  const serverPackages = [
    "@pdfn/client", // Has esbuild which is Node-only
  ];

  // Node built-in modules that should be shimmed to empty
  const nodeBuiltins = [
    "fs",
    "path",
    "module",
    "crypto",
    "os",
    "child_process",
    "tty",
    "node:fs",
    "node:path",
    "node:module",
    "node:crypto",
    "node:os",
    "node:child_process",
  ];

  return {
    name: "pdfn-server-only",
    setup(build) {
      // Handle server-only packages - mark as external and provide empty shim
      build.onResolve({ filter: new RegExp(`^(${serverPackages.join("|")})`) }, (args) => {
        return {
          path: args.path,
          namespace: "server-only-shim",
        };
      });

      // Handle Node built-ins - provide empty shim
      build.onResolve({ filter: new RegExp(`^(${nodeBuiltins.join("|")})$`) }, (args) => {
        return {
          path: args.path,
          namespace: "node-builtin-shim",
        };
      });

      // Return empty module for server-only packages
      build.onLoad({ filter: /.*/, namespace: "server-only-shim" }, () => {
        return {
          contents: "export default {}; export const __pdfn_server_only = true;",
          loader: "js",
        };
      });

      // Return empty module for Node built-ins
      build.onLoad({ filter: /.*/, namespace: "node-builtin-shim" }, () => {
        return {
          contents: "export default {}; export const readFileSync = () => { throw new Error('fs not available in browser'); };",
          loader: "js",
        };
      });
    },
  };
}

/**
 * Generate a virtual entry point for bundling a template file.
 *
 * This is used when we have a templateSource (a file with a default export).
 * The template will be imported and rendered with the provided props.
 */
function generateTemplateEntryPoint(templateSource: string, props: Record<string, unknown>): string {
  return `
import React from "react";
import { createRoot } from "react-dom/client";
import Template from ${JSON.stringify(templateSource)};

// Props passed from server
const PROPS = ${JSON.stringify(props)};

// Initialize PDFN ready state
window.PDFN = window.PDFN || {
  ready: false,
  reactReady: false
};

// Wait for DOM to be ready
function init() {
  const container = document.getElementById("pdfn-root");
  if (!container) {
    console.error("[pdfn] Could not find #pdfn-root container");
    return;
  }

  const root = createRoot(container);
  root.render(React.createElement(Template, PROPS));

  // Signal React render complete after a frame
  // This gives React time to flush updates
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // Signal ready - this will trigger Paged.js pagination
      if (window.PDFN && window.PDFN.signalReactReady) {
        window.PDFN.signalReactReady();
      } else {
        window.PDFN = window.PDFN || {};
        window.PDFN.reactReady = true;
        console.log("[pdfn] React render complete");
      }
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
`;
}

/**
 * Generate a virtual entry point that imports and renders client components.
 *
 * This is a fallback used when we don't have a templateSource but have individual
 * client component sources. This is less reliable because we need to figure out
 * which specific exports to render.
 *
 * @deprecated Prefer using templateSource instead
 */
function generateClientEntryPoint(sources: string[], props: Record<string, unknown>): string {
  // Generate import statements for each client component using namespace imports
  const imports = sources.map((source, i) => {
    return `import * as Module${i} from ${JSON.stringify(source)};`;
  });

  // For now, we assume the first module's default export is what we render
  // This is fragile - users should prefer templateSource path
  const mainComponent = sources.length > 0 ? "Module0.default || Object.values(Module0)[0]" : "null";

  return `
import React from "react";
import { createRoot } from "react-dom/client";

${imports.join("\n")}

// Props passed from server
const PROPS = ${JSON.stringify(props)};

// Get the main component to render
const MainComponent = ${mainComponent};

// Initialize PDFN ready state
window.PDFN = window.PDFN || {
  ready: false,
  reactReady: false
};

// Wait for DOM to be ready
function init() {
  const container = document.getElementById("pdfn-root");
  if (!container) {
    console.error("[pdfn] Could not find #pdfn-root container");
    return;
  }

  if (!MainComponent) {
    console.error("[pdfn] No component found to render");
    return;
  }

  const root = createRoot(container);
  root.render(React.createElement(MainComponent, PROPS));

  // Signal React render complete after a frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // Signal ready - this will trigger Paged.js pagination
      if (window.PDFN && window.PDFN.signalReactReady) {
        window.PDFN.signalReactReady();
      } else {
        window.PDFN = window.PDFN || {};
        window.PDFN.reactReady = true;
        console.log("[pdfn] React render complete");
      }
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
`;
}

/**
 * Bundle template or client components for execution in Puppeteer.
 *
 * Uses esbuild to create a self-contained IIFE that includes:
 * - React and ReactDOM
 * - The template or client components and their dependencies
 * - Initialization code that renders to #pdfn-root
 *
 * @param options - Bundle configuration
 * @returns The bundled JavaScript code as a string
 *
 * @example
 * ```ts
 * // Preferred: bundle a template file (has default export)
 * const bundle = await bundleForClient({
 *   templateSource: '/path/to/report.tsx',
 *   props: { data: [...] }
 * });
 *
 * // Fallback: bundle client components (named exports)
 * const bundle = await bundleForClient({
 *   clientSources: ['/path/to/Charts.tsx'],
 *   props: { data: [...] }
 * });
 * ```
 */
export async function bundleForClient(options: BundleOptions): Promise<string> {
  const { templateSource, clientSources = [], props = {}, baseDir } = options;

  // Determine entry point and resolve directory
  let entryContent: string;
  let resolveDir: string;

  if (templateSource) {
    // Preferred path: bundle the entire template file
    entryContent = generateTemplateEntryPoint(templateSource, props);
    resolveDir = baseDir || dirname(templateSource);
  } else if (clientSources.length > 0) {
    // Fallback: bundle individual client components
    const firstSource = clientSources[0];
    if (!firstSource) {
      throw new Error("[pdfn/client] No sources provided for bundling");
    }
    entryContent = generateClientEntryPoint(clientSources, props);
    resolveDir = baseDir || dirname(firstSource);
  } else {
    throw new Error("[pdfn/client] Either templateSource or clientSources must be provided");
  }

  try {
    const result = await esbuild.build({
      stdin: {
        contents: entryContent,
        resolveDir,
        loader: "tsx",
      },
      bundle: true,
      format: "iife",
      platform: "browser",
      target: ["es2020"],
      minify: false, // Keep readable for debugging
      sourcemap: false,
      write: false,
      jsx: "automatic",
      jsxImportSource: "react",
      // Plugin to handle server-only packages and Node built-ins
      plugins: [serverOnlyPlugin()],
      // Replace Node.js globals with browser-safe values
      define: {
        "process.env.NODE_ENV": '"production"',
        "process.env.DEBUG": '""',
        "process.env": "{}",
      },
      // Resolve from the project's node_modules
      nodePaths: [resolve(resolveDir, "node_modules")],
    });

    const outputFile = result.outputFiles?.[0];
    if (outputFile) {
      return outputFile.text;
    }

    throw new Error("[pdfn/client] esbuild produced no output");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const source = templateSource || clientSources.join(", ");
    throw new Error(
      `[pdfn/client] Failed to bundle client components: ${message}\n` +
        `Sources: ${source}`
    );
  }
}

/**
 * Get the component name from a file path
 */
export function getComponentName(filePath: string): string {
  const base = basename(filePath, extname(filePath));
  // Convert kebab-case or snake_case to PascalCase
  return base
    .split(/[-_]/)
    .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}
