/**
 * Page configuration for @page CSS generation
 */
export interface PageConfig {
  width?: string;
  height?: string;
  margin?: string;
  watermark?: {
    text?: string;
    opacity?: number;
    rotation?: number;
  };
}

/**
 * Default watermark settings
 */
const WATERMARK_DEFAULTS = {
  rotation: -35,
  opacity: 0.1,
};

/**
 * Generate @page CSS for page size, margin, and watermark
 */
export function generatePageCss(pageConfig?: PageConfig): string {
  if (!pageConfig) return "";

  let pageCss = "";

  // Page size and margin
  if (pageConfig.width && pageConfig.height) {
    pageCss = `
/* Page size and margin - extracted from Page component */
@page {
  size: ${pageConfig.width} ${pageConfig.height};
  margin: ${pageConfig.margin || "1in"};
}`;
  }

  // Watermark CSS that repeats on every page
  if (pageConfig.watermark?.text) {
    const rotation = pageConfig.watermark.rotation ?? WATERMARK_DEFAULTS.rotation;
    const opacity = pageConfig.watermark.opacity ?? WATERMARK_DEFAULTS.opacity;
    const alpha = Math.min(opacity * 1.5, 0.3);

    pageCss += `

/* Watermark - repeats on every page via @page and Paged.js */
@page {
  background: transparent;
}

/* Watermark overlay on each Paged.js page */
.pagedjs_page {
  position: relative;
}

.pagedjs_page > .pagedjs_sheet::before {
  content: "${pageConfig.watermark.text}";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(${rotation}deg);
  font-size: 5rem;
  font-weight: 900;
  color: rgba(156, 163, 175, ${alpha});
  text-transform: uppercase;
  letter-spacing: 0.1em;
  white-space: nowrap;
  pointer-events: none;
  z-index: 9999;
}`;
  }

  return pageCss;
}

/**
 * Extract page configuration from HTML content data attributes
 *
 * Looks for data-pdfn-* attributes added by the Page component:
 * - data-pdfn-width
 * - data-pdfn-height
 * - data-pdfn-margin
 * - data-pdfn-watermark-text
 * - data-pdfn-watermark-opacity
 * - data-pdfn-watermark-rotation
 */
export function extractPageConfig(html: string): PageConfig | undefined {
  const widthMatch = html.match(/data-pdfn-width="([^"]+)"/);
  const heightMatch = html.match(/data-pdfn-height="([^"]+)"/);
  const marginMatch = html.match(/data-pdfn-margin="([^"]+)"/);
  const watermarkTextMatch = html.match(/data-pdfn-watermark-text="([^"]+)"/);
  const watermarkOpacityMatch = html.match(/data-pdfn-watermark-opacity="([^"]+)"/);
  const watermarkRotationMatch = html.match(/data-pdfn-watermark-rotation="([^"]+)"/);

  // If no page dimensions found, return undefined
  if (!widthMatch || !heightMatch) {
    return undefined;
  }

  return {
    width: widthMatch[1],
    height: heightMatch[1],
    margin: marginMatch?.[1],
    watermark: watermarkTextMatch?.[1]
      ? {
          text: watermarkTextMatch[1],
          opacity: watermarkOpacityMatch?.[1] ? parseFloat(watermarkOpacityMatch[1]) : undefined,
          rotation: watermarkRotationMatch?.[1] ? parseFloat(watermarkRotationMatch[1]) : undefined,
        }
      : undefined,
  };
}
