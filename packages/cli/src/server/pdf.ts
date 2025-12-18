import type { Page, PDFOptions } from "puppeteer";

export interface PdfGenerationOptions {
  /** PDF format (default: A4) */
  format?: "A4" | "Letter" | "Legal" | "Tabloid" | "A3" | "A5";
  /** Print background graphics */
  printBackground?: boolean;
  /** Timeout for waiting for ready state (ms) */
  timeout?: number;
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
  };
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

  try {
    // Set content and wait for network idle
    const contentStart = performance.now();
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout,
    });
    contentLoadTime = performance.now() - contentStart;

    // Wait for PDFX.ready to be true (Paged.js completion)
    const pagedStart = performance.now();
    await page.waitForFunction(
      () => (window as any).PDFX?.ready === true,
      { timeout }
    );
    pagedJsTime = performance.now() - pagedStart;

    // Get page count from PDFX metrics
    pageCount = await page.evaluate(() => {
      return (window as any).PDFX?.metrics?.pages ?? 1;
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

    return {
      buffer: Buffer.from(buffer),
      metrics: {
        total: Math.round(totalTime),
        contentLoad: Math.round(contentLoadTime),
        pagedJs: Math.round(pagedJsTime),
        pdfCapture: Math.round(pdfCaptureTime),
        pageCount,
      },
    };
  } finally {
    // Close the page after use
    await page.close().catch(() => {});
  }
}
