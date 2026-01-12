import type { FontConfig, GoogleFontConfig } from "../types";
import { processLocalFonts, separateFonts } from "./fonts";
import {
  BASE_STYLES,
  PAGED_JS_CDN,
  extractPageConfig,
  generatePageCss,
} from "@pdfn/core";

// Re-export BASE_STYLES for backward compatibility
export { BASE_STYLES };

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

      // Wait for fonts to load before signaling ready
      document.fonts.ready.then(function() {
        window.PDFN.ready = true;
        window.PDFN.emit('ready', { pages: pages.length });
        window.PDFN.notifyParent();
      });
    }
  }

  // Handler for repeating thead across pages
  // Based on: https://gist.github.com/theinvensi/e1aacc43bb5a3d852e2e85b08cf85c8a
  class RepeatTheadHandler extends Paged.Handler {
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
  Paged.registerHandlers(RepeatTheadHandler);
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
function generateGoogleFontsLink(fonts: GoogleFontConfig[]): string {
  if (fonts.length === 0) return "";

  const families = fonts.map((font) => {
    // URL-encode the family name (spaces become +)
    const family = font.family.replace(/ /g, "+");

    // Build weight/style specification
    const weights = font.weights ?? [400, 500, 600, 700];
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

// extractPageConfig is now imported from @pdfn/core

/**
 * Assembles the final HTML document
 */
export async function assembleHtml(content: string, options: HtmlOptions = {}): Promise<string> {
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

  // Separate local fonts (with src) from Google Fonts (without src)
  const { localFonts, googleFonts } = separateFonts(fonts);

  // Generate embedded @font-face CSS for local fonts
  const localFontsCss = localFonts.length > 0 ? await processLocalFonts(localFonts) : "";

  // Generate Google Fonts link for remote fonts
  const fontsLink = googleFonts.length > 0 ? generateGoogleFontsLink(googleFonts) : "";

  // Extract page configuration from content and generate @page CSS
  // This must be in the <head> for Paged.js to see it before processing
  const pageConfig = extractPageConfig(content);

  // Build @page CSS with size, margin, and optional watermark using @pdfn/core
  const pageCss = generatePageCss(pageConfig);

  // Paged.js CDN - use polyfill version for print preview compatibility
  const pagedJsScript = includePagedJs
    ? `<script src="${PAGED_JS_CDN}"></script>`
    : "";

  return `<!DOCTYPE html>
<html lang="${language}">
  <head>
    ${metaTags}
    ${fontsLink}
    <style>
${localFontsCss}
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
