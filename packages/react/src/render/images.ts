/**
 * Image Processing for PDFN
 *
 * Embeds local images as base64 data URIs for self-contained HTML output.
 * Edge-compatible: only imports Node.js modules when local images are detected.
 */

import { debug } from "../utils/debug";
import { isNodeJS, EdgeErrors, warnEdgeIncompatibility } from "../utils/runtime";

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
 * Check if a path is a relative/local path that would need embedding
 */
export function isLocalPath(src: string): boolean {
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

// Re-export for backwards compatibility
export const isRelativePath = isLocalPath;

/**
 * Extract all local image paths from HTML
 */
function extractLocalImagePaths(html: string): string[] {
  const imgRegex = /<img\s+[^>]*?src=["']([^"']+)["'][^>]*?>/gi;
  const paths: string[] = [];

  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    if (src && isLocalPath(src)) {
      paths.push(src);
    }
  }

  return paths;
}

/**
 * Get MIME type from file extension (edge-safe, no path module needed)
 */
function getMimeType(filePath: string): string {
  const lastDot = filePath.lastIndexOf(".");
  if (lastDot === -1) return "application/octet-stream";
  const ext = filePath.slice(lastDot).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

/**
 * Process all images in HTML and embed relative ones as base64
 *
 * Edge-compatible: Throws helpful error if local images detected on edge runtime.
 *
 * @param html - The HTML content to process
 * @param basePath - Base path for resolving relative image paths (defaults to cwd)
 * @returns HTML with relative images embedded as data URIs
 */
export async function processImages(html: string, basePath?: string): Promise<string> {
  // Extract local image paths first (edge-safe operation)
  const localPaths = extractLocalImagePaths(html);

  // If no local images, return HTML unchanged (works on edge)
  if (localPaths.length === 0) {
    debug("images: no local images found");
    return html;
  }

  // Local images detected - check runtime
  if (!isNodeJS()) {
    throw new Error(EdgeErrors.localImages(localPaths));
  }

  warnEdgeIncompatibility("images", localPaths);

  // Node.js runtime - dynamically import fs and path
  const [fs, path] = await Promise.all([
    import("node:fs"),
    import("node:path"),
  ]);

  const resolveFrom = basePath || process.cwd();

  // Track which images we embed so we can remove their preload hints
  const embeddedPaths = new Set<string>();

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
  function resolvePath(src: string): string {
    if (path.isAbsolute(src)) {
      return src;
    }
    return path.resolve(resolveFrom, src);
  }

  // Match img tags with src attribute
  const imgRegex = /<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi;

  let processedCount = 0;
  let skippedCount = 0;

  let result = html.replace(imgRegex, (match, before, src, after) => {
    // Skip non-local paths
    if (!isLocalPath(src)) {
      skippedCount++;
      return match;
    }

    // Resolve the path
    const absolutePath = resolvePath(src);

    // Convert to data URI
    const dataUri = fileToDataUri(absolutePath);

    if (dataUri) {
      processedCount++;
      embeddedPaths.add(src);
      return `<img ${before}src="${dataUri}"${after}>`;
    }

    // If file not found, keep original (will fail gracefully in browser)
    debug(`images: keeping original src for missing file: ${src}`);
    return match;
  });

  // Remove React 19's preload hints for images we've embedded
  if (embeddedPaths.size > 0) {
    const linkRegex = /<link\s+([^>]*?)\/?>/gi;
    result = result.replace(linkRegex, (match, attrs) => {
      const isPreload = /rel=["']preload["']/i.test(attrs);
      const isImage = /as=["']image["']/i.test(attrs);
      const hrefMatch = attrs.match(/href=["']([^"']+)["']/i);

      if (isPreload && isImage && hrefMatch) {
        const href = hrefMatch[1];
        if (embeddedPaths.has(href)) {
          debug(`images: removed preload hint for embedded image: ${href}`);
          return "";
        }
      }
      return match;
    });
  }

  if (processedCount > 0 || skippedCount > 0) {
    debug(`images: embedded ${processedCount}, skipped ${skippedCount}`);
  }

  return result;
}

/**
 * Extract local image paths from CSS url() declarations
 */
function extractLocalCssImagePaths(css: string): string[] {
  const urlRegex = /url\(["']?([^"')]+)["']?\)/gi;
  const paths: string[] = [];

  let match;
  while ((match = urlRegex.exec(css)) !== null) {
    const src = match[1];
    if (src && isLocalPath(src)) {
      paths.push(src);
    }
  }

  return paths;
}

/**
 * Process CSS background images and embed relative ones as base64
 *
 * Edge-compatible: Throws helpful error if local images detected on edge runtime.
 *
 * @param css - The CSS content to process
 * @param basePath - Base path for resolving relative image paths
 * @returns CSS with relative images embedded as data URIs
 */
export async function processCssImages(css: string, basePath?: string): Promise<string> {
  // Extract local paths first (edge-safe)
  const localPaths = extractLocalCssImagePaths(css);

  // If no local images, return CSS unchanged
  if (localPaths.length === 0) {
    return css;
  }

  // Local images detected - check runtime
  if (!isNodeJS()) {
    throw new Error(EdgeErrors.localImages(localPaths));
  }

  warnEdgeIncompatibility("css-images", localPaths);

  // Node.js runtime - dynamically import fs and path
  const [fs, path] = await Promise.all([
    import("node:fs"),
    import("node:path"),
  ]);

  const resolveFrom = basePath || process.cwd();

  function fileToDataUri(filePath: string): string | null {
    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }
      const buffer = fs.readFileSync(filePath);
      const base64 = buffer.toString("base64");
      const mimeType = getMimeType(filePath);
      return `data:${mimeType};base64,${base64}`;
    } catch {
      return null;
    }
  }

  const urlRegex = /url\(["']?([^"')]+)["']?\)/gi;

  const result = css.replace(urlRegex, (match, src) => {
    if (!isLocalPath(src)) {
      return match;
    }

    const absolutePath = path.isAbsolute(src)
      ? src
      : path.resolve(resolveFrom, src);

    const dataUri = fileToDataUri(absolutePath);

    if (dataUri) {
      return `url("${dataUri}")`;
    }

    return match;
  });

  return result;
}
