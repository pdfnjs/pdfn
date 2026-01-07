/**
 * Webpack loader to transform <Tailwind> components to use pre-compiled CSS
 * CommonJS format for webpack loader compatibility
 */

const CSS_MODULE_PATH = "__pdfn_tailwind_css__";

/**
 * @param {string} source
 * @returns {string}
 */
module.exports = function pdfnTransformLoader(source) {
  // Only transform files that import Tailwind from @pdfn/tailwind and use <Tailwind>
  if (!source.includes("@pdfn/tailwind") || !source.includes("<Tailwind")) {
    return source;
  }

  // Check if file already has pre-compiled CSS import
  if (source.includes("__pdfnPrecompiledCss__")) {
    return source;
  }

  // Add import for pre-compiled CSS at the top
  const importStatement = `import { css as __pdfnPrecompiledCss__ } from "${CSS_MODULE_PATH}";\n`;

  // Transform <Tailwind> to <Tailwind css={__pdfnPrecompiledCss__}>
  let transformed = source;

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

  return transformed;
};
