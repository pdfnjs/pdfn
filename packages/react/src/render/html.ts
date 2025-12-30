import type { DocumentProps } from "../types";

/**
 * Base CSS for PDF rendering
 * Includes print-specific styles and component placeholders
 */
export const BASE_STYLES = `
/* Reset and base styles */
*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, sans-serif;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* Page styles */
[data-pdfx-page] {
  position: relative;
  display: flex;
  flex-direction: column;
}

[data-pdfx-content] {
  flex: 1;
}

[data-pdfx-header] {
  position: running(header);
}

[data-pdfx-footer] {
  position: running(footer);
}

/* Watermark */
[data-pdfx-watermark] {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 4rem;
  opacity: 0.1;
  pointer-events: none;
  white-space: nowrap;
  z-index: 1000;
}

/* Page number and total pages - Paged.js counters */
[data-pdfx-page-number]::after {
  content: counter(page);
}

[data-pdfx-total-pages]::after {
  content: counter(pages);
}

/* Page break */
[data-pdfx-page-break] {
  break-after: page;
  page-break-after: always;
  height: 0;
}

/* Avoid break */
[data-pdfx-avoid-break] {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* Repeatable table header */
[data-pdfx-repeatable-header] {
  display: table-header-group;
}

/* Print styles */
@media print {
  body {
    background: white;
  }

  [data-pdfx-page] {
    page-break-after: always;
  }

  [data-pdfx-page]:last-child {
    page-break-after: auto;
  }
}

/* Paged.js integration */
@page {
  @top-center {
    content: element(header);
  }
  @bottom-center {
    content: element(footer);
  }
}
`;

/**
 * Paged.js configuration and event system
 */
export const PDFX_SCRIPT = `
window.PDFX = {
  ready: false,
  metrics: {},
  on: function(event, callback) {
    window.addEventListener('pdfx:' + event, function(e) {
      callback(e.detail);
    });
  },
  off: function(event, callback) {
    window.removeEventListener('pdfx:' + event, callback);
  },
  emit: function(event, data) {
    window.dispatchEvent(new CustomEvent('pdfx:' + event, { detail: data }));
  },
  mark: function(name) {
    this.metrics[name] = performance.now();
  }
};

// Signal when ready (after Paged.js if present, otherwise immediately)
if (typeof Paged !== 'undefined') {
  class PagedHandler extends Paged.Handler {
    constructor(chunker, polisher, caller) {
      super(chunker, polisher, caller);
    }
    afterRendered(pages) {
      window.PDFX.ready = true;
      window.PDFX.metrics.pages = pages.length;
      window.PDFX.mark('pagedjs_complete');
      window.PDFX.emit('ready', { pages: pages.length });
    }
  }
  Paged.registerHandlers(PagedHandler);
} else {
  // No Paged.js, ready immediately after DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      window.PDFX.ready = true;
      window.PDFX.emit('ready', {});
    });
  } else {
    window.PDFX.ready = true;
    window.PDFX.emit('ready', {});
  }
}
`;

export interface HtmlOptions {
  /** Document metadata */
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    language?: string;
  };
  /** Custom CSS to inject */
  css?: string;
  /** Whether to include Paged.js */
  includePagedJs?: boolean;
}

/**
 * Extract page dimensions from rendered content
 * Looks for data-pdfx-width, data-pdfx-height, data-pdfx-margin attributes
 */
function extractPageConfig(content: string): { width?: string; height?: string; margin?: string } {
  // Match data-pdfx-width="..."
  const widthMatch = content.match(/data-pdfx-width="([^"]+)"/);
  const heightMatch = content.match(/data-pdfx-height="([^"]+)"/);
  const marginMatch = content.match(/data-pdfx-margin="([^"]+)"/);

  return {
    width: widthMatch?.[1],
    height: heightMatch?.[1],
    margin: marginMatch?.[1],
  };
}

/**
 * Assembles the final HTML document
 */
export function assembleHtml(content: string, options: HtmlOptions = {}): string {
  const { metadata = {}, css = "", includePagedJs = true } = options;
  const { title = "", author = "", subject = "", keywords = [], language = "en" } = metadata;

  const metaTags = [
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    title && `<title>${escapeHtml(title)}</title>`,
    author && `<meta name="author" content="${escapeHtml(author)}">`,
    subject && `<meta name="description" content="${escapeHtml(subject)}">`,
    keywords.length > 0 && `<meta name="keywords" content="${escapeHtml(keywords.join(", "))}">`,
  ]
    .filter(Boolean)
    .join("\n    ");

  // Extract page configuration from content and generate @page CSS
  // This must be in the <head> for Paged.js to see it before processing
  const pageConfig = extractPageConfig(content);
  const pageCss = pageConfig.width && pageConfig.height
    ? `
/* Page size and margin - extracted from Page component */
@page {
  size: ${pageConfig.width} ${pageConfig.height};
  margin: ${pageConfig.margin || "1in"};
}`
    : "";

  // Paged.js CDN - use polyfill version for print preview compatibility
  const pagedJsScript = includePagedJs
    ? '<script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>'
    : "";

  return `<!DOCTYPE html>
<html lang="${language}">
  <head>
    ${metaTags}
    <style>
${pageCss}
${BASE_STYLES}
${css}
    </style>
    ${pagedJsScript}
  </head>
  <body>
    ${content}
    <script>
${PDFX_SCRIPT}
    </script>
  </body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
