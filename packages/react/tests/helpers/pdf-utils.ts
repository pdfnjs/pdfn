import { PDFDocument } from "pdf-lib";

// PDF points per unit conversions (72 points = 1 inch)
const MM_TO_POINTS = 72 / 25.4; // 2.834645669
const IN_TO_POINTS = 72;

/**
 * Canonical page dimensions in PDF points.
 * These MUST match PAGE_SIZES_PT in Page.tsx exactly!
 * US sizes are exact whole numbers (no tolerance needed).
 * ISO sizes use canonical values (minimal tolerance for float precision).
 */
export const PAGE_DIMENSIONS = {
  // US Sizes - EXACT whole numbers (inches × 72)
  Letter: { width: 612, height: 792, exact: true },      // 8.5 × 11 in
  Legal: { width: 612, height: 1008, exact: true },      // 8.5 × 14 in
  Tabloid: { width: 792, height: 1224, exact: true },    // 11 × 17 in
  // ISO A Series - Canonical point values (mm × 72/25.4)
  A3: { width: 841.89, height: 1190.55, exact: false },  // 297 × 420 mm
  A4: { width: 595.28, height: 841.89, exact: false },   // 210 × 297 mm
  A5: { width: 419.53, height: 595.28, exact: false },   // 148 × 210 mm
  // ISO B Series
  B4: { width: 708.66, height: 1000.63, exact: false },  // 250 × 353 mm
  B5: { width: 498.90, height: 708.66, exact: false },   // 176 × 250 mm
} as const;

export type PageSizeName = keyof typeof PAGE_DIMENSIONS;

export interface PdfPageInfo {
  pageCount: number;
  pages: Array<{
    width: number;
    height: number;
    isLandscape: boolean;
  }>;
}

export interface PdfMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
}

/**
 * Get information about a PDF document
 */
export async function getPdfInfo(
  pdfBuffer: Buffer | Uint8Array
): Promise<PdfPageInfo> {
  const pdf = await PDFDocument.load(pdfBuffer);
  const pageCount = pdf.getPageCount();
  const pages = [];

  for (let i = 0; i < pageCount; i++) {
    const page = pdf.getPage(i);
    const { width, height } = page.getSize();
    pages.push({
      width,
      height,
      isLandscape: width > height,
    });
  }

  return { pageCount, pages };
}

/**
 * Get PDF metadata
 */
export async function getPdfMetadata(
  pdfBuffer: Buffer | Uint8Array
): Promise<PdfMetadata> {
  const pdf = await PDFDocument.load(pdfBuffer);
  return {
    title: pdf.getTitle(),
    author: pdf.getAuthor(),
    subject: pdf.getSubject(),
    keywords: pdf.getKeywords(),
    creator: pdf.getCreator(),
    producer: pdf.getProducer(),
  };
}

/**
 * Assert that a page has the expected size.
 *
 * For US sizes (Letter, Legal, Tabloid): Uses near-zero tolerance (0.01pt)
 * because these are defined as exact whole numbers internally.
 *
 * For ISO sizes (A4, A3, etc.): Uses 0.5pt tolerance for float precision.
 *
 * @param actual - Actual page dimensions from PDF
 * @param expected - Expected page size name
 * @param orientation - Expected orientation (default: portrait)
 */
export function assertPageSize(
  actual: { width: number; height: number },
  expected: PageSizeName,
  orientation: "portrait" | "landscape" = "portrait"
): void {
  const dims = PAGE_DIMENSIONS[expected];
  const expectedWidth = orientation === "landscape" ? dims.height : dims.width;
  const expectedHeight = orientation === "landscape" ? dims.width : dims.height;

  // US sizes are exact, ISO sizes allow small tolerance for Puppeteer/CSS rounding
  const tolerance = dims.exact ? 0.01 : 1;

  const widthDiff = Math.abs(actual.width - expectedWidth);
  const heightDiff = Math.abs(actual.height - expectedHeight);

  if (widthDiff > tolerance || heightDiff > tolerance) {
    throw new Error(
      `Page size mismatch for ${expected} ${orientation}:\n` +
        `  Expected: ${expectedWidth.toFixed(2)} x ${expectedHeight.toFixed(2)} points\n` +
        `  Actual: ${actual.width.toFixed(2)} x ${actual.height.toFixed(2)} points\n` +
        `  Difference: ${widthDiff.toFixed(2)} x ${heightDiff.toFixed(2)} points\n` +
        `  Tolerance: ${tolerance} points (${dims.exact ? "exact US size" : "ISO size"})`
    );
  }
}

/**
 * Assert exact page dimensions (for custom sizes)
 */
export function assertPageDimensions(
  actual: { width: number; height: number },
  expectedWidth: number,
  expectedHeight: number,
  tolerance = 0.5
): void {
  const widthDiff = Math.abs(actual.width - expectedWidth);
  const heightDiff = Math.abs(actual.height - expectedHeight);

  if (widthDiff > tolerance || heightDiff > tolerance) {
    throw new Error(
      `Page dimension mismatch:\n` +
        `  Expected: ${expectedWidth.toFixed(2)} x ${expectedHeight.toFixed(2)} points\n` +
        `  Actual: ${actual.width.toFixed(2)} x ${actual.height.toFixed(2)} points\n` +
        `  Difference: ${widthDiff.toFixed(2)} x ${heightDiff.toFixed(2)} points`
    );
  }
}

/**
 * Convert mm to PDF points
 */
export function mmToPoints(mm: number): number {
  return mm * MM_TO_POINTS;
}

/**
 * Convert inches to PDF points
 */
export function inchesToPoints(inches: number): number {
  return inches * IN_TO_POINTS;
}

/**
 * Parse a dimension string to points (same logic as Page.tsx)
 */
export function parseToPoints(value: string): number {
  const match = value.trim().match(/^([\d.]+)\s*(pt|in|mm|cm|px)?$/i);
  if (!match) {
    throw new Error(`Invalid dimension format: "${value}"`);
  }

  const num = parseFloat(match[1]!);
  const unit = (match[2] || "pt").toLowerCase();

  switch (unit) {
    case "pt":
      return num;
    case "in":
      return num * 72;
    case "mm":
      return num * (72 / 25.4);
    case "cm":
      return num * (72 / 2.54);
    case "px":
      return num * (72 / 96);
    default:
      return num;
  }
}
