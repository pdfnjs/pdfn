/**
 * Webpack loader for pdfn transforms:
 * 1. Transform <Tailwind> components to use pre-compiled CSS
 * 2. Mark "use client" components for client-side rendering
 * 3. Mark template files with their source path
 *
 * CommonJS format for webpack loader compatibility
 *
 * FIXME: Add support for inlining CSS files read via fs.readFileSync at build time
 * This would enable plain CSS templates to work on edge runtimes without <Tailwind> wrapper
 */

const CSS_MODULE_PATH = "__pdfn_tailwind_css__";

/**
 * Parse export names from JavaScript/TypeScript code.
 * @param {string} code
 * @returns {string[]}
 */
function parseExportsFromCode(code) {
  const exports = [];

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

  return [...new Set(exports)];
}

/**
 * Check if code has a default export
 * @param {string} code
 * @returns {boolean}
 */
function hasDefaultExport(code) {
  return /export\s+default\s+/.test(code);
}

/**
 * Get the name of the default exported function/class if it has one
 * @param {string} code
 * @returns {string|null}
 */
function getDefaultExportName(code) {
  // Match: export default function Name
  const funcMatch = /export\s+default\s+function\s+(\w+)/.exec(code);
  if (funcMatch && funcMatch[1]) return funcMatch[1];

  // Match: export default class Name
  const classMatch = /export\s+default\s+class\s+(\w+)/.exec(code);
  if (classMatch && classMatch[1]) return classMatch[1];

  return null;
}

/**
 * Check if a file path is a template file in pdfn-templates/ root
 * @param {string} filePath
 * @returns {boolean}
 */
function isTemplateFile(filePath) {
  if (!filePath) return false;
  // Check if file is a .tsx file directly in pdfn-templates/
  // e.g., /path/to/pdfn-templates/report.tsx but NOT /path/to/pdfn-templates/components/Chart.tsx
  const match = filePath.match(/pdfn-templates[\\/]([^\\/]+\.tsx)$/);
  return !!match;
}

/**
 * @param {string} source
 * @returns {string}
 */
module.exports = function pdfnTransformLoader(source) {
  let transformed = source;
  let addedCode = "";
  const resourcePath = this.resourcePath || "";

  // === Transform 1: Mark "use client" components ===
  const trimmedSource = source.trimStart();
  const hasUseClient =
    trimmedSource.startsWith('"use client"') ||
    trimmedSource.startsWith("'use client'");

  if (hasUseClient) {
    const exports = parseExportsFromCode(source);

    if (exports.length > 0) {
      // Generate marker code for each export
      const markerCode = exports
        .map(
          (name) =>
            `\ntry { ${name}.__pdfn_client = true; ${name}.__pdfn_source = ${JSON.stringify(resourcePath)}; } catch(e) {}`
        )
        .join("");
      addedCode += markerCode;
    }
  }

  // === Transform 2: Pre-compile Tailwind CSS ===
  if (source.includes("@pdfn/tailwind") && source.includes("<Tailwind")) {
    // Check if file already has pre-compiled CSS import
    if (!source.includes("__pdfnPrecompiledCss__")) {
      // Add import for pre-compiled CSS at the top
      const importStatement = `import { css as __pdfnPrecompiledCss__ } from "${CSS_MODULE_PATH}";\n`;

      // Replace <Tailwind> with <Tailwind css={__pdfnPrecompiledCss__}>
      transformed = transformed.replace(
        /<Tailwind(\s*)>/g,
        "<Tailwind css={__pdfnPrecompiledCss__}>"
      );

      // Replace <Tailwind ...props> with <Tailwind css={__pdfnPrecompiledCss__} ...props>
      // But only if css prop is not already present
      transformed = transformed.replace(
        /<Tailwind(\s+)(?!css=)/g,
        "<Tailwind$1css={__pdfnPrecompiledCss__} "
      );

      // Only add import if we made changes
      if (transformed !== source) {
        transformed = importStatement + transformed;
      }
    }
  }

  // === Transform 3: Mark template files with source path ===
  if (isTemplateFile(resourcePath) && hasDefaultExport(source)) {
    const defaultName = getDefaultExportName(source);
    if (defaultName) {
      // Named default export: export default function Report() {}
      addedCode += `\ntry { ${defaultName}.__pdfn_template_source = ${JSON.stringify(resourcePath)}; } catch(e) {}`;
    }
  }

  // Add any marker code at the end
  if (addedCode) {
    transformed = transformed + addedCode;
  }

  return transformed;
};
