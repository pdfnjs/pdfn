/**
 * Tailwind CSS processing for PDF rendering
 *
 * This module handles Tailwind CSS JIT compilation for the rendered HTML.
 * It extracts used classes and generates only the necessary CSS.
 */

export interface TailwindOptions {
  /** Path to tailwind.config.js (relative to cwd) */
  config?: string;
  /** Custom Tailwind config object */
  configObject?: object;
}

/**
 * Process HTML and generate Tailwind CSS for used classes
 *
 * NOTE: Full Tailwind processing requires postcss and tailwindcss
 * to be installed in the user's project. This function provides
 * a basic fallback when those dependencies aren't available.
 *
 * @param html - The HTML content to process
 * @param options - Tailwind options
 * @returns Generated CSS string
 */
export async function processTailwind(html: string, options: TailwindOptions = {}): Promise<string> {
  // Try to use postcss + tailwindcss from user's project
  try {
    // Dynamic imports to avoid bundling these dependencies
    const postcss = await import("postcss");
    const tailwindcss = await import("tailwindcss");

    // Create a minimal CSS input that will trigger Tailwind's content scanning
    const input = `
@tailwind base;
@tailwind components;
@tailwind utilities;
`;

    // Use user's tailwind config if available
    const tailwindConfig = options.configObject || {
      content: [{ raw: html, extension: "html" }],
    };

    const result = await postcss
      .default([tailwindcss.default(tailwindConfig)])
      .process(input, { from: undefined });

    return result.css;
  } catch {
    // Tailwind/PostCSS not available - return empty CSS
    // Users will need to include their own compiled CSS
    console.warn(
      "[@pdfx-dev/react] Tailwind CSS processing unavailable. " +
        "Install postcss and tailwindcss for automatic class compilation, " +
        "or include pre-compiled CSS in your templates."
    );
    return "";
  }
}

/**
 * Extract class names from HTML string
 * Useful for debugging or pre-processing
 */
export function extractClasses(html: string): string[] {
  const classRegex = /class="([^"]*)"/g;
  const classes = new Set<string>();

  let match;
  while ((match = classRegex.exec(html)) !== null) {
    match[1].split(/\s+/).forEach((cls) => {
      if (cls) classes.add(cls);
    });
  }

  return Array.from(classes);
}
