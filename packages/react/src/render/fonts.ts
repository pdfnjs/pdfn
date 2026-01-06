/**
 * Font Processing for PDFN
 *
 * Embeds local fonts as base64 data URIs for self-contained HTML output.
 * Edge-compatible: only imports Node.js modules when local fonts are detected.
 */

import type { FontConfig, LocalFontConfig, GoogleFontConfig } from "../types";
import { debug } from "../utils/debug";
import { isNodeJS, EdgeErrors, warnEdgeIncompatibility } from "../utils/runtime";

/**
 * Type guard to check if a font config is a local font (has src property)
 */
export function isLocalFont(font: FontConfig): font is LocalFontConfig {
  return "src" in font && typeof font.src === "string";
}

/**
 * Type guard to check if a font config is a Google Font (no src property)
 */
export function isGoogleFont(font: FontConfig): font is GoogleFontConfig {
  return !("src" in font);
}

/**
 * MIME types for common font formats
 */
const FONT_MIME_TYPES: Record<string, string> = {
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".eot": "application/vnd.ms-fontobject",
};

/**
 * Check if a path is a local path that should be embedded
 */
export function isLocalFontPath(src: string): boolean {
  // Skip absolute URLs
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return false;
  }

  // Skip data URIs (already embedded)
  if (src.startsWith("data:")) {
    return false;
  }

  // Skip protocol-relative URLs
  if (src.startsWith("//")) {
    return false;
  }

  // Everything else is considered local
  return true;
}

/**
 * Get MIME type from font file extension (edge-safe, no path module needed)
 */
function getFontMimeType(filePath: string): string {
  const lastDot = filePath.lastIndexOf(".");
  if (lastDot === -1) return "application/octet-stream";
  const ext = filePath.slice(lastDot).toLowerCase();
  return FONT_MIME_TYPES[ext] || "application/octet-stream";
}

/**
 * Generate @font-face CSS for a local font
 */
function generateFontFace(font: LocalFontConfig, dataUri: string): string {
  const weight = font.weight ?? 400;
  const style = font.style ?? "normal";

  return `@font-face {
  font-family: '${font.family}';
  src: url('${dataUri}');
  font-weight: ${weight};
  font-style: ${style};
  font-display: swap;
}`;
}

/**
 * Extract local font paths from font config array
 */
function extractLocalFontPaths(fonts: FontConfig[]): string[] {
  const paths: string[] = [];
  for (const font of fonts) {
    if (isLocalFont(font) && isLocalFontPath(font.src)) {
      paths.push(font.src);
    }
  }
  return paths;
}

/**
 * Process local fonts and generate embedded @font-face CSS
 *
 * Edge-compatible: Throws helpful error if local fonts detected on edge runtime.
 *
 * @param fonts - Array of font configurations
 * @param basePath - Base path for resolving relative font paths (defaults to cwd)
 * @returns CSS string with @font-face declarations for local fonts
 */
export async function processLocalFonts(
  fonts: FontConfig[],
  basePath?: string
): Promise<string> {
  // Extract local font paths first (edge-safe)
  const localPaths = extractLocalFontPaths(fonts);

  // If no local fonts, return empty string (works on edge)
  if (localPaths.length === 0) {
    debug("fonts: no local fonts found");
    return "";
  }

  // Local fonts detected - check runtime
  if (!isNodeJS()) {
    throw new Error(EdgeErrors.localFonts(localPaths));
  }

  warnEdgeIncompatibility("fonts", localPaths);

  // Node.js runtime - dynamically import fs and path
  const [fs, path] = await Promise.all([
    import("node:fs"),
    import("node:path"),
  ]);

  const resolveFrom = basePath || process.cwd();
  const fontFaces: string[] = [];

  let processedCount = 0;
  let skippedCount = 0;

  /**
   * Read a font file and convert to base64 data URI
   */
  function fontToDataUri(filePath: string): string | null {
    try {
      if (!fs.existsSync(filePath)) {
        debug(`fonts: file not found: ${filePath}`);
        return null;
      }

      const buffer = fs.readFileSync(filePath);
      const base64 = buffer.toString("base64");
      const mimeType = getFontMimeType(filePath);

      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      debug(`fonts: failed to read file ${filePath}: ${message}`);
      return null;
    }
  }

  /**
   * Resolve a font path to an absolute path
   */
  function resolveFontPath(src: string): string {
    if (path.isAbsolute(src)) {
      return src;
    }
    return path.resolve(resolveFrom, src);
  }

  for (const font of fonts) {
    // Skip fonts without src (Google Fonts)
    if (!isLocalFont(font)) {
      skippedCount++;
      continue;
    }

    // Skip remote fonts
    if (!isLocalFontPath(font.src)) {
      skippedCount++;
      continue;
    }

    // Resolve the path
    const absolutePath = resolveFontPath(font.src);

    // Convert to data URI
    const dataUri = fontToDataUri(absolutePath);

    if (dataUri) {
      processedCount++;
      fontFaces.push(generateFontFace(font, dataUri));
    } else {
      debug(`fonts: keeping original src for missing file: ${font.src}`);
    }
  }

  if (processedCount > 0 || skippedCount > 0) {
    debug(`fonts: embedded ${processedCount}, skipped ${skippedCount}`);
  }

  return fontFaces.join("\n\n");
}

/**
 * Separate fonts into local (with src) and Google Fonts (without src)
 */
export function separateFonts(fonts: FontConfig[]): {
  localFonts: LocalFontConfig[];
  googleFonts: GoogleFontConfig[];
} {
  const localFonts: LocalFontConfig[] = [];
  const googleFonts: GoogleFontConfig[] = [];

  for (const font of fonts) {
    if (isLocalFont(font) && isLocalFontPath(font.src)) {
      localFonts.push(font);
    } else if (isGoogleFont(font)) {
      googleFonts.push(font);
    }
    // Remote font URLs are passed through as-is (not embedded)
  }

  return { localFonts, googleFonts };
}

/**
 * Extract local font paths from CSS @font-face declarations
 */
function extractLocalCssFontPaths(css: string): string[] {
  const paths: string[] = [];
  const fontFaceRegex = /@font-face\s*\{[^}]*\}/gi;
  const urlRegex = /url\(\s*["']?([^"')]+)["']?\s*\)/g;

  let fontFaceMatch;
  while ((fontFaceMatch = fontFaceRegex.exec(css)) !== null) {
    const fontFaceBlock = fontFaceMatch[0];
    let urlMatch;
    while ((urlMatch = urlRegex.exec(fontFaceBlock)) !== null) {
      const src = urlMatch[1];
      if (src && isLocalFontPath(src)) {
        paths.push(src);
      }
    }
  }

  return paths;
}

/**
 * Parse @font-face declarations from CSS and embed local fonts
 *
 * Edge-compatible: Throws helpful error if local fonts detected on edge runtime.
 *
 * @param css - The CSS content to process
 * @param basePath - Base path for resolving relative font paths (defaults to cwd)
 * @returns CSS with local fonts embedded as base64 data URIs
 */
export async function processCssFontFaces(css: string, basePath?: string): Promise<string> {
  // Extract local font paths first (edge-safe)
  const localPaths = extractLocalCssFontPaths(css);

  // If no local fonts, return CSS unchanged (works on edge)
  if (localPaths.length === 0) {
    debug("fonts: no local fonts in CSS");
    return css;
  }

  // Local fonts detected - check runtime
  if (!isNodeJS()) {
    throw new Error(EdgeErrors.localFonts(localPaths));
  }

  warnEdgeIncompatibility("css-fonts", localPaths);

  // Node.js runtime - dynamically import fs and path
  const [fs, path] = await Promise.all([
    import("node:fs"),
    import("node:path"),
  ]);

  const resolveFrom = basePath || process.cwd();

  /**
   * Read a font file and convert to base64 data URI
   */
  function fontToDataUri(filePath: string): string | null {
    try {
      if (!fs.existsSync(filePath)) {
        debug(`fonts: file not found: ${filePath}`);
        return null;
      }

      const buffer = fs.readFileSync(filePath);
      const base64 = buffer.toString("base64");
      const mimeType = getFontMimeType(filePath);

      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      debug(`fonts: failed to read file ${filePath}: ${message}`);
      return null;
    }
  }

  /**
   * Resolve a font path to an absolute path
   */
  function resolveFontPath(src: string): string {
    if (path.isAbsolute(src)) {
      return src;
    }
    return path.resolve(resolveFrom, src);
  }

  // Regex to match @font-face blocks
  const fontFaceRegex = /@font-face\s*\{[^}]*\}/gi;

  let processedCount = 0;
  let skippedCount = 0;

  const result = css.replace(fontFaceRegex, (fontFaceBlock) => {
    // Find src property within the @font-face block
    const srcRegex = /src\s*:\s*([^;]+);/i;
    const srcMatch = fontFaceBlock.match(srcRegex);

    if (!srcMatch || !srcMatch[1]) {
      return fontFaceBlock;
    }

    const srcValue = srcMatch[1];

    // Find all url() references in the src value
    const urlRegex = /url\(\s*["']?([^"')]+)["']?\s*\)/g;
    let hasLocalFont = false;

    const newSrcValue = srcValue.replace(urlRegex, (urlMatch, urlPath) => {
      // Skip if not a local path
      if (!isLocalFontPath(urlPath)) {
        skippedCount++;
        return urlMatch;
      }

      // Resolve the path
      const absolutePath = resolveFontPath(urlPath);

      // Convert to data URI
      const dataUri = fontToDataUri(absolutePath);

      if (dataUri) {
        processedCount++;
        hasLocalFont = true;
        return `url("${dataUri}")`;
      }

      // Keep original if file not found
      debug(`fonts: CSS @font-face - file not found: ${urlPath}`);
      return urlMatch;
    });

    if (hasLocalFont) {
      // Replace the src value in the @font-face block
      return fontFaceBlock.replace(srcRegex, `src: ${newSrcValue};`);
    }

    return fontFaceBlock;
  });

  if (processedCount > 0 || skippedCount > 0) {
    debug(
      `fonts: CSS @font-face - embedded ${processedCount}, skipped ${skippedCount}`
    );
  }

  return result;
}
