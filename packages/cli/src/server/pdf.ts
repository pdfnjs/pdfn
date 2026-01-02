import type { Page, PDFOptions, HTTPRequest, HTTPResponse } from "puppeteer";
import { debug } from "../utils/debug";

export interface PdfGenerationOptions {
  /** PDF format (default: A4) */
  format?: "A4" | "Letter" | "Legal" | "Tabloid" | "A3" | "A5";
  /** Print background graphics */
  printBackground?: boolean;
  /** Timeout for waiting for ready state (ms) */
  timeout?: number;
}

/** Asset information tracked during PDF generation */
export interface AssetInfo {
  /** Asset URL */
  url: string;
  /** Asset type (image, font, stylesheet, script, other) */
  type: "image" | "font" | "stylesheet" | "script" | "other";
  /** Size in bytes (0 if failed) */
  size: number;
  /** Load time in ms */
  duration: number;
  /** Whether the asset loaded successfully */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

export interface PdfResult {
  /** PDF buffer */
  buffer: Buffer;
  /** Generation metrics */
  metrics: {
    /** Total generation time in ms */
    total: number;
    /** Time waiting for content to load */
    contentLoad: number;
    /** Time waiting for Paged.js */
    pagedJs: number;
    /** Time for PDF capture */
    pdfCapture: number;
    /** Number of pages */
    pageCount: number;
    /** PDF file size in bytes */
    pdfSize: number;
  };
  /** Assets loaded during generation */
  assets: AssetInfo[];
  /** Warnings detected during generation */
  warnings: string[];
}

/** Size threshold for large asset warning (200KB - web best practice) */
const LARGE_ASSET_THRESHOLD = 200 * 1024;

/** Duration threshold for slow asset warning (1000ms - lenient for fonts) */
const SLOW_ASSET_THRESHOLD = 1000;

/** Determine asset type from resource type */
function getAssetType(resourceType: string): AssetInfo["type"] {
  switch (resourceType) {
    case "image":
      return "image";
    case "font":
      return "font";
    case "stylesheet":
      return "stylesheet";
    case "script":
      return "script";
    default:
      return "other";
  }
}

/** Get short URL for display (remove data: prefix, truncate long URLs) */
function getShortUrl(url: string): string {
  if (url.startsWith("data:")) {
    const match = url.match(/^data:([^;,]+)/);
    return match ? `data:${match[1]}...` : "data:...";
  }
  if (url.length > 80) {
    return url.substring(0, 77) + "...";
  }
  return url;
}

/**
 * Generate PDF from HTML content using a Puppeteer page
 */
export async function generatePdf(
  page: Page,
  html: string,
  options: PdfGenerationOptions = {}
): Promise<PdfResult> {
  const {
    format = "A4",
    printBackground = true,
    timeout = 30000,
  } = options;

  const startTime = performance.now();
  let contentLoadTime = 0;
  let pagedJsTime = 0;
  let pdfCaptureTime = 0;
  let pageCount = 0;

  // Asset tracking
  const assets: AssetInfo[] = [];
  const requestStartTimes = new Map<string, number>();
  const warnings: string[] = [];

  // Request handler to track start times
  const onRequest = (request: HTTPRequest) => {
    const url = request.url();
    const resourceType = request.resourceType();

    // Only track relevant resource types
    if (["image", "font", "stylesheet", "script"].includes(resourceType)) {
      requestStartTimes.set(url, performance.now());
    }
  };

  // Response handler to track completed requests
  const onResponse = (response: HTTPResponse) => {
    const url = response.url();
    const request = response.request();
    const resourceType = request.resourceType();
    const startTime = requestStartTimes.get(url);

    if (startTime === undefined) return;

    const duration = Math.round(performance.now() - startTime);
    const status = response.status();
    const success = status >= 200 && status < 400;

    // Get content length from headers
    const contentLength = response.headers()["content-length"];
    const size = contentLength ? parseInt(contentLength, 10) : 0;

    const asset: AssetInfo = {
      url: getShortUrl(url),
      type: getAssetType(resourceType),
      size,
      duration,
      success,
    };

    if (!success) {
      asset.error = `HTTP ${status}`;
      warnings.push(`Failed: ${asset.url} (${status})`);
    } else {
      if (size > LARGE_ASSET_THRESHOLD) {
        warnings.push(`Large: ${asset.url} (${(size / 1024).toFixed(0)}KB)`);
      }
      if (duration > SLOW_ASSET_THRESHOLD) {
        warnings.push(`Slow: ${asset.url} (${duration}ms)`);
      }
    }

    assets.push(asset);
    requestStartTimes.delete(url);
  };

  // Request failed handler
  const onRequestFailed = (request: HTTPRequest) => {
    const url = request.url();
    const resourceType = request.resourceType();
    const startTime = requestStartTimes.get(url);

    if (startTime === undefined) return;

    const duration = Math.round(performance.now() - startTime);
    const failure = request.failure();
    const errorText = failure?.errorText || "Unknown error";

    const asset: AssetInfo = {
      url: getShortUrl(url),
      type: getAssetType(resourceType),
      size: 0,
      duration,
      success: false,
      error: errorText,
    };

    warnings.push(`Failed: ${asset.url} (${errorText})`);
    assets.push(asset);
    requestStartTimes.delete(url);
  };

  // Set up request interception
  page.on("request", onRequest);
  page.on("response", onResponse);
  page.on("requestfailed", onRequestFailed);

  try {
    // Set content and wait for network idle
    const contentStart = performance.now();
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout,
    });
    contentLoadTime = performance.now() - contentStart;

    // Wait for PDFN.ready to be true (Paged.js completion)
    const pagedStart = performance.now();
    await page.waitForFunction(
      () => (window as any).PDFN?.ready === true,
      { timeout }
    );
    pagedJsTime = performance.now() - pagedStart;

    // Get page count from PDFN metrics
    pageCount = await page.evaluate(() => {
      return (window as any).PDFN?.metrics?.pages ?? 1;
    });

    // Generate PDF
    const pdfStart = performance.now();
    const pdfOptions: PDFOptions = {
      format,
      printBackground,
      preferCSSPageSize: true,
    };

    const buffer = await page.pdf(pdfOptions);
    pdfCaptureTime = performance.now() - pdfStart;

    const totalTime = performance.now() - startTime;
    const pdfBuffer = Buffer.from(buffer);

    debug(
      `pdf: ${Math.round(totalTime)}ms (load: ${Math.round(contentLoadTime)}ms, paged: ${Math.round(pagedJsTime)}ms, capture: ${Math.round(pdfCaptureTime)}ms) - ${pageCount} pages, ${(pdfBuffer.length / 1024).toFixed(1)}KB`
    );

    if (assets.length > 0) {
      debug(`assets: ${assets.length} (${assets.filter(a => !a.success).length} failed)`);
    }

    if (warnings.length > 0) {
      warnings.forEach(w => debug(`warning: ${w}`));
    }

    return {
      buffer: pdfBuffer,
      metrics: {
        total: Math.round(totalTime),
        contentLoad: Math.round(contentLoadTime),
        pagedJs: Math.round(pagedJsTime),
        pdfCapture: Math.round(pdfCaptureTime),
        pageCount,
        pdfSize: pdfBuffer.length,
      },
      assets,
      warnings,
    };
  } finally {
    // Clean up event listeners
    page.off("request", onRequest);
    page.off("response", onResponse);
    page.off("requestfailed", onRequestFailed);

    // Close the page after use
    await page.close().catch(() => {});
  }
}
