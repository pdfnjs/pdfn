/**
 * Image Processing for PDFX
 *
 * Embeds local images as base64 data URIs for self-contained HTML output.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { debug } from "../utils/debug";

/**
 * MIME types for common image formats
 */
const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".bmp": "image/bmp",
  ".avif": "image/avif",
};

/**
 * Check if a path is a relative path that should be embedded
 */
export function isRelativePath(src: string): boolean {
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

  // Everything else is considered relative
  return true;
}

/**
 * Get MIME type from file extension
 */
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

/**
 * Read a file and convert to base64 data URI
 */
function fileToDataUri(filePath: string): string | null {
  try {
    if (!fs.existsSync(filePath)) {
      debug(`images: file not found: ${filePath}`);
      return null;
    }

    const buffer = fs.readFileSync(filePath);
    const base64 = buffer.toString("base64");
    const mimeType = getMimeType(filePath);

    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    debug(`images: failed to read file ${filePath}: ${message}`);
    return null;
  }
}

/**
 * Resolve a relative path to an absolute path
 */
function resolvePath(src: string, basePath: string): string {
  // If it's already absolute, return as-is
  if (path.isAbsolute(src)) {
    return src;
  }

  // Resolve relative to base path
  return path.resolve(basePath, src);
}

/**
 * Process all images in HTML and embed relative ones as base64
 *
 * @param html - The HTML content to process
 * @param basePath - Base path for resolving relative image paths (defaults to cwd)
 * @returns HTML with relative images embedded as data URIs
 */
export function processImages(html: string, basePath?: string): string {
  const resolveFrom = basePath || process.cwd();

  // Match img tags with src attribute
  // Handles: <img src="..."> and <img ... src="..." ...>
  const imgRegex = /<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi;

  let processedCount = 0;
  let skippedCount = 0;

  const result = html.replace(imgRegex, (match, before, src, after) => {
    // Skip non-relative paths
    if (!isRelativePath(src)) {
      skippedCount++;
      return match;
    }

    // Resolve the path
    const absolutePath = resolvePath(src, resolveFrom);

    // Convert to data URI
    const dataUri = fileToDataUri(absolutePath);

    if (dataUri) {
      processedCount++;
      return `<img ${before}src="${dataUri}"${after}>`;
    }

    // If file not found, keep original (will fail gracefully in browser)
    debug(`images: keeping original src for missing file: ${src}`);
    return match;
  });

  if (processedCount > 0 || skippedCount > 0) {
    debug(`images: embedded ${processedCount}, skipped ${skippedCount}`);
  }

  return result;
}

/**
 * Process CSS background images and embed relative ones as base64
 *
 * @param css - The CSS content to process
 * @param basePath - Base path for resolving relative image paths
 * @returns CSS with relative images embedded as data URIs
 */
export function processCssImages(css: string, basePath?: string): string {
  const resolveFrom = basePath || process.cwd();

  // Match url() in CSS
  // Handles: url("..."), url('...'), url(...)
  const urlRegex = /url\(["']?([^"')]+)["']?\)/gi;

  const result = css.replace(urlRegex, (match, src) => {
    // Skip non-relative paths
    if (!isRelativePath(src)) {
      return match;
    }

    // Resolve the path
    const absolutePath = resolvePath(src, resolveFrom);

    // Convert to data URI
    const dataUri = fileToDataUri(absolutePath);

    if (dataUri) {
      return `url("${dataUri}")`;
    }

    // Keep original if file not found
    return match;
  });

  return result;
}
