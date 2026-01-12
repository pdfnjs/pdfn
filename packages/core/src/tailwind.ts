/**
 * @pdfn/core/tailwind - Server-only Tailwind CSS compilation
 *
 * This entry point contains server-only code that uses Node.js built-ins
 * (fs, path, module) and dependencies like fast-glob. Import from this
 * entry point only in server-side code (build plugins, CLI tools).
 *
 * For browser-safe utilities, import from @pdfn/core instead.
 *
 * @example
 * ```typescript
 * // In @pdfn/next or @pdfn/vite plugins (server-side only)
 * import { compileTailwind } from '@pdfn/core/tailwind';
 *
 * const { css } = await compileTailwind({
 *   templatePatterns: ['./pdfn-templates/**\/*.tsx'],
 *   cwd: process.cwd(),
 * });
 * ```
 */

export {
  compileTailwind,
  type CompileTailwindOptions,
  type CompileTailwindResult,
} from "./tailwind/index.js";
