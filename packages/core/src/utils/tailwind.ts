/**
 * Tailwind CSS extraction utilities
 *
 * Used by @pdfn/vite and @pdfn/next for build-time CSS compilation
 */

/**
 * Extract class names from file content
 *
 * Handles various patterns:
 * - className="..." and class="..."
 * - className={`...`} template literals
 * - clsx/cn/cx function calls
 */
export function extractClassesFromContent(content: string): string[] {
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
 * Marker attribute used by @pdfn/tailwind to signal Tailwind processing is needed
 */
export const TAILWIND_MARKER = "data-pdfn-tailwind";

/**
 * Attribute for Tailwind CSS path
 */
export const TAILWIND_CSS_ATTR = "data-pdfn-tailwind-css";

/**
 * Attribute for pre-compiled Tailwind CSS (base64 encoded)
 */
export const TAILWIND_PRECOMPILED_ATTR = "data-pdfn-tailwind-precompiled";

/**
 * Check if HTML contains the Tailwind marker
 */
export function hasTailwindMarker(html: string): boolean {
  return html.includes(TAILWIND_MARKER);
}

/**
 * Extract CSS path from Tailwind marker if present
 */
export function extractTailwindCssPath(html: string): string | undefined {
  const match = html.match(new RegExp(`${TAILWIND_CSS_ATTR}="([^"]+)"`));
  return match?.[1];
}

/**
 * Extract pre-compiled CSS from Tailwind marker if present (base64 encoded)
 */
export function extractPrecompiledCss(html: string): string | undefined {
  const match = html.match(new RegExp(`${TAILWIND_PRECOMPILED_ATTR}="([^"]+)"`));
  if (match?.[1]) {
    try {
      // Decode base64
      return Buffer.from(match[1], "base64").toString("utf8");
    } catch {
      return undefined;
    }
  }
  return undefined;
}

/**
 * Remove the Tailwind marker element from HTML
 */
export function removeTailwindMarker(html: string): string {
  // Remove the hidden div with the marker attribute (with or without CSS path)
  return html.replace(/<div data-pdfn-tailwind="true"[^>]*><\/div>/g, "");
}
