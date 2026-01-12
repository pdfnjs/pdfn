/**
 * Export parsing utilities for code transformation
 *
 * Used by @pdfn/vite and @pdfn/next for marking client components and templates
 */

/**
 * Parse export names from JavaScript/TypeScript code.
 *
 * Handles:
 * - export function Name() {}
 * - export const Name = ...
 * - export { Name }
 * - export default function Name() {}
 * - export default Name
 * - export class Name {}
 */
export function parseExportsFromCode(code: string): string[] {
  const exports: string[] = [];

  // Match: export function Name
  const funcExportRegex = /export\s+function\s+(\w+)/g;
  let match;
  while ((match = funcExportRegex.exec(code)) !== null) {
    if (match[1]) exports.push(match[1]);
  }

  // Match: export const Name = or export let Name = or export var Name =
  const constExportRegex = /export\s+(?:const|let|var)\s+(\w+)\s*=/g;
  while ((match = constExportRegex.exec(code)) !== null) {
    if (match[1]) exports.push(match[1]);
  }

  // Match: export class Name
  const classExportRegex = /export\s+class\s+(\w+)/g;
  while ((match = classExportRegex.exec(code)) !== null) {
    if (match[1]) exports.push(match[1]);
  }

  // Match: export { Name } or export { Name as Alias }
  const namedExportRegex = /export\s*\{([^}]+)\}/g;
  while ((match = namedExportRegex.exec(code)) !== null) {
    if (!match[1]) continue;
    const names = match[1].split(",");
    for (const name of names) {
      // Handle "Name as Alias" - we want the exported name (Alias)
      const parts = name.trim().split(/\s+as\s+/);
      const exportedName = parts.length > 1 ? parts[1] : parts[0];
      if (exportedName) {
        const cleaned = exportedName.trim();
        if (cleaned && /^\w+$/.test(cleaned)) {
          exports.push(cleaned);
        }
      }
    }
  }

  // Note: We skip "export default" as the default export doesn't have a stable name
  // that we can reference. Users should use named exports for client components.

  return [...new Set(exports)]; // Remove duplicates
}

/**
 * Check if code has a default export
 */
export function hasDefaultExport(code: string): boolean {
  // Match: export default function, export default class, export default <expr>
  return /export\s+default\s+/.test(code);
}

/**
 * Get the name of the default exported function/class if it has one
 */
export function getDefaultExportName(code: string): string | null {
  // Match: export default function Name
  const funcMatch = /export\s+default\s+function\s+(\w+)/.exec(code);
  if (funcMatch?.[1]) return funcMatch[1];

  // Match: export default class Name
  const classMatch = /export\s+default\s+class\s+(\w+)/.exec(code);
  if (classMatch?.[1]) return classMatch[1];

  return null;
}

/**
 * Check if code has "use client" directive
 */
export function hasUseClientDirective(code: string): boolean {
  const trimmedCode = code.trimStart();
  return trimmedCode.startsWith('"use client"') || trimmedCode.startsWith("'use client'");
}
