import type { FontConfig } from "../types";

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
[data-pdfn-page] {
  position: relative;
  display: flex;
  flex-direction: column;
}

[data-pdfn-content] {
  flex: 1;
}

[data-pdfn-header] {
  position: running(header);
}

[data-pdfn-footer] {
  position: running(footer);
}

/* Watermark - now handled via @page CSS for multi-page support */
[data-pdfn-watermark] {
  display: none;
}

/* Page number and total pages - Paged.js counters */
[data-pdfn-page-number]::after {
  content: counter(page);
}

[data-pdfn-total-pages]::after {
  content: counter(pages);
}

/* Page break */
[data-pdfn-page-break] {
  break-after: page;
  page-break-after: always;
  height: 0;
}

/* Avoid break */
[data-pdfn-avoid-break] {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* Table header - repeats on each page with paged.js */
[data-pdfn-table-header] {
  display: table-header-group;
  break-inside: avoid;
}

/* Paged.js table header repetition */
table {
  border-collapse: collapse;
}

thead {
  display: table-header-group;
}

tbody {
  display: table-row-group;
}

tr {
  break-inside: avoid;
}

/* Print styles */
@media print {
  body {
    background: white;
  }

  [data-pdfn-page] {
    page-break-after: always;
  }

  [data-pdfn-page]:last-child {
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
export const PDFN_SCRIPT = `
window.PDFN = {
  ready: false,
  metrics: {
    start: performance.now(),
    pages: 0,
    paginationTime: 0
  },
  on: function(event, callback) {
    window.addEventListener('pdfn:' + event, function(e) {
      callback(e.detail);
    });
  },
  off: function(event, callback) {
    window.removeEventListener('pdfn:' + event, callback);
  },
  emit: function(event, data) {
    window.dispatchEvent(new CustomEvent('pdfn:' + event, { detail: data }));
  },
  mark: function(name) {
    this.metrics[name] = performance.now();
  },
  // Send metrics to parent window (for dev server)
  notifyParent: function() {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'pdfn:metrics',
        metrics: this.metrics
      }, '*');
    }
  }
};

// Signal when ready (after Paged.js if present, otherwise immediately)
if (typeof Paged !== 'undefined') {
  // Mark when Paged.js starts processing
  window.PDFN.mark('pagedjs_start');

  // Handler for PDFN ready state
  class PagedHandler extends Paged.Handler {
    constructor(chunker, polisher, caller) {
      super(chunker, polisher, caller);
    }
    afterRendered(pages) {
      // Update all metrics first
      window.PDFN.mark('pagedjs_complete');
      window.PDFN.metrics.pages = pages.length;
      window.PDFN.metrics.paginationTime = Math.round(
        window.PDFN.metrics.pagedjs_complete - window.PDFN.metrics.pagedjs_start
      );

      // Now mark as ready and notify
      window.PDFN.ready = true;
      window.PDFN.emit('ready', { pages: pages.length });
      window.PDFN.notifyParent();
    }
  }

  // Handler for repeating table headers across pages
  // Based on: https://gist.github.com/theinvensi/e1aacc43bb5a3d852e2e85b08cf85c8a
  class RepeatTableHeadersHandler extends Paged.Handler {
    constructor(chunker, polisher, caller) {
      super(chunker, polisher, caller);
      this.splitTablesRefs = [];
    }

    afterPageLayout(pageElement, page, breakToken, chunker) {
      this.chunker = chunker;
      this.splitTablesRefs = [];

      if (breakToken) {
        const node = breakToken.node;
        const tables = this.findAllAncestors(node, "table");

        if (node.tagName === "TABLE") tables.push(node);

        if (tables.length > 0) {
          this.splitTablesRefs = tables.map(t => t.dataset.ref);

          let thead = node.tagName === "THEAD" ? node : this.findFirstAncestor(node, "thead");

          if (thead) {
            let lastTheadNode = thead.hasChildNodes() ? thead.lastChild : thead;
            breakToken.node = this.nodeAfter(lastTheadNode, chunker.source);
          }

          this.hideEmptyTables(pageElement, node);
        }
      }
    }

    hideEmptyTables(pageElement, breakTokenNode) {
      this.splitTablesRefs.forEach(ref => {
        let table = pageElement.querySelector("[data-ref='" + ref + "']");
        if (table) {
          let sourceBody = table.querySelector("tbody > tr");
          if (!sourceBody || this.refEquals(sourceBody.firstElementChild, breakTokenNode)) {
            table.style.visibility = "hidden";
            table.style.position = "absolute";
            let lineSpacer = table.nextSibling;
            if (lineSpacer) {
              lineSpacer.style.visibility = "hidden";
              lineSpacer.style.position = "absolute";
            }
          }
        }
      });
    }

    refEquals(a, b) {
      return a && a.dataset && b && b.dataset && a.dataset.ref === b.dataset.ref;
    }

    findFirstAncestor(element, selector) {
      while (element.parentNode && element.parentNode.nodeType === 1) {
        if (element.parentNode.matches(selector)) return element.parentNode;
        element = element.parentNode;
      }
      return null;
    }

    findAllAncestors(element, selector) {
      const ancestors = [];
      while (element.parentNode && element.parentNode.nodeType === 1) {
        if (element.parentNode.matches(selector)) ancestors.unshift(element.parentNode);
        element = element.parentNode;
      }
      return ancestors;
    }

    layout(rendered, layout) {
      this.splitTablesRefs.forEach(ref => {
        const renderedTable = rendered.querySelector("[data-ref='" + ref + "']");
        if (renderedTable) {
          if (!renderedTable.getAttribute("repeated-headers")) {
            const sourceTable = this.chunker.source.querySelector("[data-ref='" + ref + "']");
            this.repeatColgroup(sourceTable, renderedTable);
            this.repeatTHead(sourceTable, renderedTable);
            renderedTable.setAttribute("repeated-headers", true);
          }
        }
      });
    }

    repeatColgroup(sourceTable, renderedTable) {
      let colgroup = sourceTable.querySelectorAll("colgroup");
      let firstChild = renderedTable.firstChild;
      colgroup.forEach((colgroup) => {
        let clonedColgroup = colgroup.cloneNode(true);
        renderedTable.insertBefore(clonedColgroup, firstChild);
      });
    }

    repeatTHead(sourceTable, renderedTable) {
      let thead = sourceTable.querySelector("thead");
      if (thead) {
        let clonedThead = thead.cloneNode(true);
        renderedTable.insertBefore(clonedThead, renderedTable.firstChild);
      }
    }

    nodeAfter(node, limiter) {
      if (limiter && node === limiter) return;
      let significantNode = this.nextSignificantNode(node);
      if (significantNode) return significantNode;
      if (node.parentNode) {
        while ((node = node.parentNode)) {
          if (limiter && node === limiter) return;
          significantNode = this.nextSignificantNode(node);
          if (significantNode) return significantNode;
        }
      }
    }

    nextSignificantNode(sib) {
      while ((sib = sib.nextSibling)) { if (!this.isIgnorable(sib)) return sib; }
      return null;
    }

    isIgnorable(node) {
      return (
        (node.nodeType === 8)
        || ((node.nodeType === 3) && this.isAllWhitespace(node))
      );
    }

    isAllWhitespace(node) {
      return !(/[^ \\t\\n\\r]/.test(node.textContent));
    }
  }

  Paged.registerHandlers(PagedHandler);
  Paged.registerHandlers(RepeatTableHeadersHandler);
} else {
  // No Paged.js, ready immediately after DOM load
  function signalReady() {
    // Update metrics first
    window.PDFN.metrics.pages = 1;
    window.PDFN.metrics.paginationTime = 0;

    // Now mark as ready and notify
    window.PDFN.ready = true;
    window.PDFN.emit('ready', { pages: 1 });
    window.PDFN.notifyParent();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', signalReady);
  } else {
    signalReady();
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
  /** Google Fonts to load */
  fonts?: FontConfig[];
}

/**
 * Generate Google Fonts URL from font configurations
 */
function generateGoogleFontsLink(fonts: FontConfig[]): string {
  if (fonts.length === 0) return "";

  const families = fonts.map((font) => {
    // URL-encode the family name (spaces become +)
    const family = font.family.replace(/ /g, "+");

    // Build weight/style specification
    const weights = font.weights || [400, 500, 600, 700];
    const styles = font.style ? [font.style] : ["normal"];

    // Google Fonts v2 API format: Family:ital,wght@0,400;0,700;1,400
    const specs: string[] = [];
    for (const style of styles) {
      const ital = style === "italic" ? "1" : "0";
      for (const weight of weights) {
        specs.push(`${ital},${weight}`);
      }
    }

    return `${family}:ital,wght@${specs.join(";")}`;
  });

  return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join("&")}&display=swap" rel="stylesheet">`;
}

/**
 * Extract page configuration from rendered content
 * Looks for data-pdfn-* attributes
 */
function extractPageConfig(content: string): {
  width?: string;
  height?: string;
  margin?: string;
  watermark?: {
    text?: string;
    opacity?: number;
    rotation?: number;
  };
} {
  const widthMatch = content.match(/data-pdfn-width="([^"]+)"/);
  const heightMatch = content.match(/data-pdfn-height="([^"]+)"/);
  const marginMatch = content.match(/data-pdfn-margin="([^"]+)"/);
  const watermarkTextMatch = content.match(/data-pdfn-watermark-text="([^"]+)"/);
  const watermarkOpacityMatch = content.match(/data-pdfn-watermark-opacity="([^"]+)"/);
  const watermarkRotationMatch = content.match(/data-pdfn-watermark-rotation="([^"]+)"/);

  return {
    width: widthMatch?.[1],
    height: heightMatch?.[1],
    margin: marginMatch?.[1],
    watermark: watermarkTextMatch?.[1] ? {
      text: watermarkTextMatch[1],
      opacity: watermarkOpacityMatch?.[1] ? parseFloat(watermarkOpacityMatch[1]) : undefined,
      rotation: watermarkRotationMatch?.[1] ? parseFloat(watermarkRotationMatch[1]) : undefined,
    } : undefined,
  };
}

/**
 * Assembles the final HTML document
 */
export function assembleHtml(content: string, options: HtmlOptions = {}): string {
  const { metadata = {}, css = "", includePagedJs = true, fonts = [] } = options;
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

  // Generate Google Fonts link if fonts are specified
  const fontsLink = fonts.length > 0 ? generateGoogleFontsLink(fonts) : "";

  // Extract page configuration from content and generate @page CSS
  // This must be in the <head> for Paged.js to see it before processing
  const pageConfig = extractPageConfig(content);

  // Build @page CSS with size, margin, and optional watermark
  let pageCss = "";
  if (pageConfig.width && pageConfig.height) {
    pageCss = `
/* Page size and margin - extracted from Page component */
@page {
  size: ${pageConfig.width} ${pageConfig.height};
  margin: ${pageConfig.margin || "1in"};
}`;
  }

  // Add watermark CSS that repeats on every page
  if (pageConfig.watermark?.text) {
    const rotation = pageConfig.watermark.rotation ?? -35;
    const opacity = pageConfig.watermark.opacity ?? 0.1;
    // Convert opacity to rgba alpha value (0.1 opacity = 0.15 alpha for visibility)
    const alpha = Math.min(opacity * 1.5, 0.3);

    pageCss += `

/* Watermark - repeats on every page via @page and paged.js */
@page {
  background: transparent;
}

/* Watermark overlay on each paged.js page */
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

  // Paged.js CDN - use polyfill version for print preview compatibility
  const pagedJsScript = includePagedJs
    ? '<script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>'
    : "";

  return `<!DOCTYPE html>
<html lang="${language}">
  <head>
    ${metaTags}
    ${fontsLink}
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
${PDFN_SCRIPT}
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
