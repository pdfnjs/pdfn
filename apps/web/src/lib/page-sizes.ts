// Page dimensions in points (72 dpi)
export const PAGE_SIZES = {
  A4: { width: 595, height: 842 },
  A3: { width: 842, height: 1191 },
  A5: { width: 420, height: 595 },
  Letter: { width: 612, height: 792 },
  Legal: { width: 612, height: 1008 },
  Tabloid: { width: 792, height: 1224 },
  B4: { width: 729, height: 1032 },
  B5: { width: 516, height: 729 },
} as const;

export type PageSize = keyof typeof PAGE_SIZES;
export type Orientation = "portrait" | "landscape";

// Convert points to pixels (96 dpi screen / 72 dpi PDF)
export const PT_TO_PX = 96 / 72;

export function getPageDimensions(
  size: PageSize,
  orientation: Orientation = "portrait"
) {
  const dimensions = PAGE_SIZES[size];
  const width = (orientation === "landscape" ? dimensions.height : dimensions.width) * PT_TO_PX;
  const height = (orientation === "landscape" ? dimensions.width : dimensions.height) * PT_TO_PX;
  return { width, height };
}
