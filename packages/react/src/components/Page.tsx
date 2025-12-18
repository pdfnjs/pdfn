import type { PageProps, WatermarkConfig } from "../types";

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
  const pageStyle = getPageStyles({ size, orientation, margin, background });

  return (
    <div data-pdfx-page style={pageStyle}>
      {watermark && renderWatermark(watermark)}
      {header && <header data-pdfx-header>{header}</header>}
      <main data-pdfx-content>{children}</main>
      {footer && <footer data-pdfx-footer>{footer}</footer>}
    </div>
  );
}

function renderWatermark(watermark: string | WatermarkConfig) {
  if (typeof watermark === "string") {
    return (
      <div data-pdfx-watermark>
        {watermark}
      </div>
    );
  }

  const {
    text,
    content,
    opacity = 0.1,
    rotation = -45,
    className,
  } = watermark;

  const watermarkStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
    fontSize: "4rem",
    opacity,
    pointerEvents: "none",
    whiteSpace: "nowrap",
    zIndex: 1000,
  };

  return (
    <div
      data-pdfx-watermark
      className={className}
      style={watermarkStyle}
    >
      {content || text}
    </div>
  );
}

interface PageStyleParams {
  size: PageProps["size"];
  orientation: PageProps["orientation"];
  margin: PageProps["margin"];
  background: PageProps["background"];
}

function getPageStyles({ size, orientation, margin, background }: PageStyleParams): React.CSSProperties {
  const dimensions = getPageDimensions(size, orientation);
  const margins = getMargins(margin);

  return {
    width: dimensions.width,
    minHeight: dimensions.height,
    background,
    padding: margins,
    boxSizing: "border-box",
    position: "relative",
  };
}

const PAGE_SIZES = {
  A4: { width: "210mm", height: "297mm" },
  A3: { width: "297mm", height: "420mm" },
  A5: { width: "148mm", height: "210mm" },
  Letter: { width: "8.5in", height: "11in" },
  Legal: { width: "8.5in", height: "14in" },
} as const;

function getPageDimensions(
  size: PageProps["size"],
  orientation: PageProps["orientation"]
): { width: string; height: string } {
  let dimensions: { width: string; height: string };

  if (Array.isArray(size)) {
    dimensions = { width: size[0], height: size[1] };
  } else if (size && size in PAGE_SIZES) {
    dimensions = PAGE_SIZES[size as keyof typeof PAGE_SIZES];
  } else {
    dimensions = PAGE_SIZES.A4;
  }

  if (orientation === "landscape") {
    return { width: dimensions.height, height: dimensions.width };
  }

  return dimensions;
}

function getMargins(margin: PageProps["margin"]): string {
  if (typeof margin === "string") {
    return margin;
  }

  const { top = "0", right = "0", bottom = "0", left = "0" } = margin || {};
  return `${top} ${right} ${bottom} ${left}`;
}
