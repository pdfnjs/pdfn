/**
 * CSS Processor Registry
 *
 * Allows optional packages like @pdfn/tailwind to register their processors
 * without creating a dependency from @pdfn/react to those packages.
 *
 * This enables clean dependency inversion:
 * - @pdfn/react uses the registry (no knowledge of @pdfn/tailwind)
 * - @pdfn/tailwind registers itself when imported
 *
 * @example
 * ```typescript
 * // In @pdfn/tailwind (registers on import)
 * import { registerTailwindProcessor } from "@pdfn/core";
 * registerTailwindProcessor(processTailwind);
 *
 * // In @pdfn/react (uses registry)
 * import { getTailwindProcessor } from "@pdfn/core";
 * const processor = getTailwindProcessor();
 * if (processor) {
 *   css = await processor(html, options);
 * }
 * ```
 */

/**
 * Options passed to the Tailwind processor
 */
export interface TailwindProcessorOptions {
  /** Path to CSS file containing Tailwind imports */
  cssPath?: string;
}

/**
 * Function signature for the Tailwind CSS processor
 */
export type TailwindProcessor = (
  html: string,
  options?: TailwindProcessorOptions
) => Promise<string>;

// Internal registry state
let tailwindProcessor: TailwindProcessor | null = null;

/**
 * Register the Tailwind CSS processor.
 *
 * Called by @pdfn/tailwind when it's imported. This allows @pdfn/react
 * to use Tailwind processing without directly importing @pdfn/tailwind.
 *
 * @param processor - The processTailwind function from @pdfn/tailwind
 */
export function registerTailwindProcessor(processor: TailwindProcessor): void {
  tailwindProcessor = processor;
}

/**
 * Get the registered Tailwind CSS processor.
 *
 * Returns null if @pdfn/tailwind hasn't been imported.
 *
 * @returns The registered processor or null
 */
export function getTailwindProcessor(): TailwindProcessor | null {
  return tailwindProcessor;
}

/**
 * Check if a Tailwind processor is registered.
 *
 * Useful for providing helpful error messages when Tailwind markers
 * are found but @pdfn/tailwind isn't imported.
 */
export function hasTailwindProcessor(): boolean {
  return tailwindProcessor !== null;
}
