/**
 * Webpack loader to transform <Tailwind> components to use pre-compiled CSS
 * and transform cssFile props to inline CSS
 * CommonJS format for webpack loader compatibility
 */

const fs = require("node:fs");
const path = require("node:path");

const CSS_MODULE_PATH = "__pdfn_tailwind_css__";

/**
 * @param {string} source
 * @returns {string}
 */
module.exports = function pdfnTransformLoader(source) {
  let transformed = source;
  let hasChanges = false;

  // --- Handle Tailwind transform ---
  if (source.includes("@pdfn/tailwind") && source.includes("<Tailwind")) {
    // Check if file already has pre-compiled CSS import
    if (!source.includes("__pdfnPrecompiledCss__")) {
      // Add import for pre-compiled CSS at the top
      const importStatement = `import { css as __pdfnPrecompiledCss__ } from "${CSS_MODULE_PATH}";\n`;

      // Transform <Tailwind> to <Tailwind css={__pdfnPrecompiledCss__}>
      let tailwindTransformed = transformed;

      // Replace <Tailwind> with <Tailwind css={__pdfnPrecompiledCss__}>
      tailwindTransformed = tailwindTransformed.replace(
        /<Tailwind(\s*)>/g,
        "<Tailwind css={__pdfnPrecompiledCss__}>"
      );

      // Replace <Tailwind ...props> with <Tailwind css={__pdfnPrecompiledCss__} ...props>
      // But only if css prop is not already present
      tailwindTransformed = tailwindTransformed.replace(
        /<Tailwind(\s+)(?!css=)/g,
        "<Tailwind$1css={__pdfnPrecompiledCss__} "
      );

      // Only add import if we made changes
      if (tailwindTransformed !== transformed) {
        transformed = importStatement + tailwindTransformed;
        hasChanges = true;
      }
    }
  }

  // --- Handle Document cssFile prop ---
  if (transformed.includes("cssFile=")) {
    const cssFileRegex = /cssFile=["']([^"']+)["']/g;

    // Get the resource path from webpack context
    const resourcePath = this.resourcePath;
    const templateDir = resourcePath ? path.dirname(resourcePath) : process.cwd();

    // Collect all matches first (we need to process in reverse order)
    const matches = [];
    let match;
    while ((match = cssFileRegex.exec(transformed)) !== null) {
      matches.push({
        full: match[0],
        path: match[1],
        index: match.index,
      });
    }

    // Process in reverse order to maintain string indices
    for (const m of matches.reverse()) {
      const cssFilePath = m.path;

      // Resolve path relative to the template file
      const fullCssPath = path.resolve(templateDir, cssFilePath);

      // Check file exists
      if (!fs.existsSync(fullCssPath)) {
        this.emitError(
          new Error(
            `CSS file not found: ${cssFilePath}\n` +
              `Resolved to: ${fullCssPath}\n` +
              `Template: ${resourcePath}`
          )
        );
        continue;
      }

      // Add this CSS file as a dependency for watch mode
      if (this.addDependency) {
        this.addDependency(fullCssPath);
      }

      // Read and encode CSS
      const cssContent = fs.readFileSync(fullCssPath, "utf8");
      const encoded = Buffer.from(cssContent).toString("base64");

      // Replace cssFile="./x.css" with css={decoded}
      // Use an IIFE to decode base64 at runtime
      const replacement = `css={(() => {
            const e = "${encoded}";
            return typeof Buffer !== 'undefined'
              ? Buffer.from(e, 'base64').toString('utf8')
              : decodeURIComponent(escape(atob(e)));
          })()}`;

      transformed =
        transformed.slice(0, m.index) +
        replacement +
        transformed.slice(m.index + m.full.length);

      hasChanges = true;
    }
  }

  return transformed;
};
