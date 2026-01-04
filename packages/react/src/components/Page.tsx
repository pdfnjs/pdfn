import type { PageProps } from "../types";

/**
 * Page - Container for page content
 *
 * Defines page size, margins, and optional header/footer.
 *
 * @example
 * ```tsx
 * <Page
 *   size="A4"
 *   margin="1in"
 *   header={<span>Company Name</span>}
 *   footer={<PageNumber />}
 * >
 *   <h1>Page Content</h1>
 * </Page>
 * ```
 */
export function Page({
  size = "A4",
  orientation = "portrait",
  margin = "1in",
  background = "#ffffff",
  header,
  footer,
  watermark,
  children,
}: PageProps) {
  const dimensions = getPageDimensions(size, orientation);
  const marginCss = getMarginCss(margin);

  const pageStyle: React.CSSProperties = {
    background,
    position: "relative",
    minHeight: "100%",
  };

  // Get size name for display
  const sizeName = getSizeName(size, orientation);

  // Store dimensions as data attributes for html.ts to extract and put in <head>
  // This ensures Paged.js sees @page { size } before processing
  //
  // IMPORTANT: Running elements (header/footer) must appear BEFORE the content
  // in the DOM for paged.js to capture them for the first page.
  // Watermark text is stored as data attribute for CSS @page rule.
  return (
    <div
      data-pdfn-page
      data-pdfn-size={sizeName}
      data-pdfn-margin={marginCss}
      data-pdfn-width={dimensions.width}
      data-pdfn-height={dimensions.height}
      data-pdfn-watermark-text={typeof watermark === "string" ? watermark : watermark?.text}
      data-pdfn-watermark-opacity={typeof watermark === "object" ? watermark.opacity : undefined}
      data-pdfn-watermark-rotation={typeof watermark === "object" ? watermark.rotation : undefined}
      style={pageStyle}
    >
      {/* Running elements BEFORE content for paged.js to capture on page 1 */}
      {header && <header data-pdfn-header>{header}</header>}
      {footer && <footer data-pdfn-footer>{footer}</footer>}
      <main data-pdfn-content>{children}</main>
    </div>
  );
}

function getSizeName(size: PageProps["size"], orientation: PageProps["orientation"]): string {
  if (Array.isArray(size)) {
    return `Custom${orientation === "landscape" ? " Landscape" : ""}`;
  }
  return `${size || "A4"}${orientation === "landscape" ? " Landscape" : ""}`;
}

/**
 * Canonical page sizes in PDF points (72 points = 1 inch)
 * Using points internally eliminates conversion rounding errors.
 * US sizes are exact whole numbers, ISO sizes use canonical values.
 */
const PAGE_SIZES_PT = {
  // US Sizes - EXACT whole numbers (inches × 72)
  Letter: { width: 612, height: 792 },      // 8.5 × 11 in
  Legal: { width: 612, height: 1008 },      // 8.5 × 14 in
  Tabloid: { width: 792, height: 1224 },    // 11 × 17 in
  // ISO A Series - Canonical point values (mm × 72/25.4)
  A3: { width: 841.89, height: 1190.55 },   // 297 × 420 mm
  A4: { width: 595.28, height: 841.89 },    // 210 × 297 mm
  A5: { width: 419.53, height: 595.28 },    // 148 × 210 mm
  // ISO B Series
  B4: { width: 708.66, height: 1000.63 },   // 250 × 353 mm
  B5: { width: 498.90, height: 708.66 },    // 176 × 250 mm
} as const;

/**
 * Parse a dimension string (e.g., "210mm", "8.5in", "72pt") to points
 */
function parseToPoints(value: string): number {
  const match = value.trim().match(/^([\d.]+)\s*(pt|in|mm|cm|px)?$/i);
  if (!match) {
    throw new Error(`Invalid dimension format: "${value}". Use format like "210mm", "8.5in", or "72pt"`);
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
      return num * (72 / 96); // Assuming 96 DPI
    default:
      return num;
  }
}

function getPageDimensions(
  size: PageProps["size"],
  orientation: PageProps["orientation"]
): { width: string; height: string } {
  let widthPt: number;
  let heightPt: number;

  if (Array.isArray(size)) {
    // Custom size - parse to points
    widthPt = parseToPoints(size[0]);
    heightPt = parseToPoints(size[1]);
  } else if (size && size in PAGE_SIZES_PT) {
    // Predefined size - use exact point values
    const dims = PAGE_SIZES_PT[size as keyof typeof PAGE_SIZES_PT];
    widthPt = dims.width;
    heightPt = dims.height;
  } else {
    // Default to A4
    widthPt = PAGE_SIZES_PT.A4.width;
    heightPt = PAGE_SIZES_PT.A4.height;
  }

  // Swap for landscape
  if (orientation === "landscape") {
    [widthPt, heightPt] = [heightPt, widthPt];
  }

  // Return as pt strings for CSS @page
  return {
    width: `${widthPt}pt`,
    height: `${heightPt}pt`,
  };
}

function getMarginCss(margin: PageProps["margin"]): string {
  if (typeof margin === "string") {
    return margin;
  }

  const { top = "0", right = "0", bottom = "0", left = "0" } = margin || {};
  return `${top} ${right} ${bottom} ${left}`;
}
