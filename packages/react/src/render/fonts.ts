/**
 * Font Processing for PDFN
 *
 * Embeds local fonts as base64 data URIs for self-contained HTML output.
 * Similar to how images.ts handles local image embedding.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { FontConfig, LocalFontConfig, GoogleFontConfig } from "../types";
import { debug } from "../utils/debug";

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
 * Get MIME type from font file extension
 */
function getFontMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return FONT_MIME_TYPES[ext] || "application/octet-stream";
}

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
function resolveFontPath(src: string, basePath: string): string {
  // If it's already absolute, return as-is
  if (path.isAbsolute(src)) {
    return src;
  }

  // Resolve relative to base path
  return path.resolve(basePath, src);
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
 * Process local fonts and generate embedded @font-face CSS
 *
 * @param fonts - Array of font configurations
 * @param basePath - Base path for resolving relative font paths (defaults to cwd)
 * @returns CSS string with @font-face declarations for local fonts
 */
export function processLocalFonts(
  fonts: FontConfig[],
  basePath?: string
): string {
  const resolveFrom = basePath || process.cwd();
  const fontFaces: string[] = [];

  let processedCount = 0;
  let skippedCount = 0;

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
    const absolutePath = resolveFontPath(font.src, resolveFrom);

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
 * Parse @font-face declarations from CSS and embed local fonts
 *
 * This function finds @font-face rules in CSS, extracts local font file paths,
 * converts them to base64 data URIs, and returns the modified CSS.
 *
 * @param css - The CSS content to process
 * @param basePath - Base path for resolving relative font paths (defaults to cwd)
 * @returns CSS with local fonts embedded as base64 data URIs
 */
export function processCssFontFaces(css: string, basePath?: string): string {
  const resolveFrom = basePath || process.cwd();

  // Regex to match @font-face blocks
  // This handles nested braces and multiline content
  const fontFaceRegex = /@font-face\s*\{[^}]*\}/gi;

  let processedCount = 0;
  let skippedCount = 0;

  const result = css.replace(fontFaceRegex, (fontFaceBlock) => {
    // Find src property within the @font-face block
    // Matches: src: url("path") format("woff2"), url("path2");
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
      const absolutePath = resolveFontPath(urlPath, resolveFrom);

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
