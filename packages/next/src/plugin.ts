/**
 * CSS compilation for pdfn templates
 */

import fg from "fast-glob";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { createRequire } from "node:module";

export interface PdfnPluginOptions {
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
 * Module path for pre-compiled Tailwind CSS
 */
export const CSS_MODULE_PATH = ".pdfn/tailwind.js";

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
      classValue.split(/\s+/).forEach((cls) => {
        if (cls && !cls.includes("${") && !cls.startsWith("{")) {
          classes.add(cls);
        }
      });
    }
  }

  // Match template literal className={`...`}
  const templateRegex = /className=\{`([^`]+)`\}/g;
  while ((match = templateRegex.exec(content)) !== null) {
    const classValue = match[1];
    if (classValue) {
      const staticParts = classValue.replace(/\$\{[^}]+\}/g, " ");
      staticParts.split(/\s+/).forEach((cls) => {
        if (cls) classes.add(cls);
      });
    }
  }

  // Match clsx/cn function calls
  const clsxRegex = /(?:cn|clsx|cx)\s*\(\s*([^)]+)\)/g;
  while ((match = clsxRegex.exec(content)) !== null) {
    const args = match[1];
    if (!args) continue;
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
 * Get base CSS content
 */
function getBaseCss(cwd: string, explicitPath: string | undefined, log: (...args: unknown[]) => void): string {
  // Explicit path provided
  if (explicitPath) {
    const fullPath = resolve(cwd, explicitPath);
    if (!existsSync(fullPath)) {
      throw new Error(`CSS file not found: ${explicitPath}`);
    }
    return readFileSync(fullPath, "utf8");
  }

  // Auto-detect
  for (const relativePath of COMMON_CSS_PATHS) {
    const fullPath = resolve(cwd, relativePath);
    if (existsSync(fullPath)) {
      const content = readFileSync(fullPath, "utf8");
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

/**
 * Compile Tailwind CSS for the given classes and write to output file
 */
export async function compileTailwindCss(
  templatePatterns: string[],
  cssPath: string | undefined,
  cwd: string,
  debug = false
): Promise<void> {
  const log = (...args: unknown[]) => {
    if (debug) console.log("[pdfn:next]", ...args);
  };

  const { compile } = await import("tailwindcss");

  // Find all template files
  const files = await fg(templatePatterns, {
    cwd,
    absolute: true,
    ignore: ["**/node_modules/**"],
  });

  if (files.length === 0) {
    console.warn("[pdfn:next] No template files found matching patterns:", templatePatterns);
    writeEmptyCssModule(cwd);
    return;
  }

  // Extract classes from all files
  const allClasses = new Set<string>();
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    const classes = extractClassesFromContent(content);
    classes.forEach((cls) => allClasses.add(cls));
  }

  if (allClasses.size === 0) {
    writeEmptyCssModule(cwd);
    return;
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

  // Compile CSS
  const compiler = await compile(baseCss, {
    loadStylesheet: async (id: string, base: string) => {
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
      const resolveFrom = base || cwd;
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

  // Write CSS to module file
  writeCssModule(cwd, css);
}

/**
 * Write CSS module to node_modules/.pdfn/
 */
function writeCssModule(cwd: string, css: string): void {
  const pdfnDir = join(cwd, "node_modules", ".pdfn");
  const cssFilePath = join(pdfnDir, "tailwind.js");

  if (!existsSync(pdfnDir)) {
    mkdirSync(pdfnDir, { recursive: true });
  }

  const moduleContent = `// Auto-generated by @pdfn/next - DO NOT EDIT
export const css = ${JSON.stringify(css)};
export default css;
`;
  writeFileSync(cssFilePath, moduleContent);
}

/**
 * Write empty CSS module
 */
function writeEmptyCssModule(cwd: string): void {
  writeCssModule(cwd, "");
}
