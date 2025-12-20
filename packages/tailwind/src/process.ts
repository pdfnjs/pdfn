/**
 * Tailwind CSS Processing for PDFX
 *
 * Uses Tailwind v4's compile() API with static imports.
 * This works in bundled environments like Next.js because
 * the bundler can see the imports at build time.
 */

import { compile } from "tailwindcss";
import * as fs from "node:fs";
import * as path from "node:path";
import { createRequire } from "node:module";

// Cache the compiled Tailwind instance for reuse
let cachedCompiler: Awaited<ReturnType<typeof compile>> | null = null;
let tailwindRoot: string | null = null;

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
 * Get or create the Tailwind compiler
 */
async function getCompiler(): Promise<Awaited<ReturnType<typeof compile>>> {
  if (cachedCompiler) return cachedCompiler;

  const twRoot = findTailwindRoot();

  cachedCompiler = await compile('@import "tailwindcss";', {
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

      // Handle relative imports from tailwindcss package
      const resolveFrom = base || twRoot;
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

      console.warn(`[pdfx:tailwind] Could not load stylesheet: ${id}`);
      throw new Error(`Could not load stylesheet: ${id}`);
    },
    loadModule: async (id: string, base: string, resourceHint: "plugin" | "config") => {
      // We don't support loading plugins/configs for now
      throw new Error(`Module loading not supported: ${id} (${resourceHint})`);
    },
  });

  return cachedCompiler;
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
 * @returns Generated CSS string
 */
export async function processTailwind(html: string): Promise<string> {
  const startTime = performance.now();

  try {
    const compiler = await getCompiler();
    const candidates = extractClasses(html);
    const css = compiler.build(candidates);

    const duration = Math.round(performance.now() - startTime);
    console.log(`[pdfx:tailwind] Generated ${css.length} bytes in ${duration}ms (${candidates.length} classes)`);

    return css;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[pdfx:tailwind] Error: ${message}`);
    throw error;
  }
}
