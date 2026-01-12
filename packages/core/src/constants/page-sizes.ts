/**
 * Page size dimensions in points (72 dpi)
 *
 * US sizes use exact whole numbers (inches × 72)
 * ISO sizes use canonical point values (mm × 72/25.4)
 */
export const PAGE_SIZES = {
  // US Sizes - EXACT whole numbers (inches × 72)
  Letter: { width: 612, height: 792 }, // 8.5 × 11 in
  Legal: { width: 612, height: 1008 }, // 8.5 × 14 in
  Tabloid: { width: 792, height: 1224 }, // 11 × 17 in

  // ISO A Series - Canonical point values (mm × 72/25.4)
  A3: { width: 841.89, height: 1190.55 }, // 297 × 420 mm
  A4: { width: 595.28, height: 841.89 }, // 210 × 297 mm
  A5: { width: 419.53, height: 595.28 }, // 148 × 210 mm

  // ISO B Series
  B4: { width: 708.66, height: 1000.63 }, // 250 × 353 mm
  B5: { width: 498.9, height: 708.66 }, // 176 × 250 mm
} as const;

/**
 * Standard page size names
 */
export type PageSizeName = keyof typeof PAGE_SIZES;

/**
 * Page size dimensions
 */
export interface PageDimensions {
  width: number;
  height: number;
}

/**
 * Page orientation
 */
export type PageOrientation = "portrait" | "landscape";

/**
 * Get page dimensions for a given size and orientation
 */
export function getPageDimensions(
  size: PageSizeName | string,
  orientation: PageOrientation = "portrait"
): PageDimensions {
  const defaultSize = { width: 595.28, height: 841.89 }; // A4
  const sizeConfig = PAGE_SIZES[size as PageSizeName] ?? defaultSize;

  if (orientation === "landscape") {
    return { width: sizeConfig.height, height: sizeConfig.width };
  }

  return { width: sizeConfig.width, height: sizeConfig.height };
}

/**
 * Convert page dimensions to CSS size string (e.g., "595.28pt 841.89pt")
 */
export function pageDimensionsToCss(dimensions: PageDimensions): string {
  return `${dimensions.width}pt ${dimensions.height}pt`;
}

/**
 * Get CSS size string for a page size and orientation
 */
export function getPageSizeCss(
  size: PageSizeName | string,
  orientation: PageOrientation = "portrait"
): string {
  const dimensions = getPageDimensions(size, orientation);
  return pageDimensionsToCss(dimensions);
}
