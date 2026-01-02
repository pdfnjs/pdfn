import { describe, it, expect } from "vitest";
import { assembleHtml, BASE_STYLES, PDFN_SCRIPT } from "../../src/render/html";

describe("HTML Assembly", () => {
  describe("BASE_STYLES", () => {
    it("includes print color adjust", () => {
      expect(BASE_STYLES).toContain("-webkit-print-color-adjust: exact");
      expect(BASE_STYLES).toContain("print-color-adjust: exact");
    });

    it("includes page counter styles", () => {
      expect(BASE_STYLES).toContain("[data-pdfn-page-number]::after");
      expect(BASE_STYLES).toContain("content: counter(page)");
      expect(BASE_STYLES).toContain("[data-pdfn-total-pages]::after");
      expect(BASE_STYLES).toContain("content: counter(pages)");
    });

    it("includes page break styles", () => {
      expect(BASE_STYLES).toContain("[data-pdfn-page-break]");
      expect(BASE_STYLES).toContain("break-after: page");
    });

    it("includes avoid break styles", () => {
      expect(BASE_STYLES).toContain("[data-pdfn-avoid-break]");
      expect(BASE_STYLES).toContain("break-inside: avoid");
    });

    it("includes header/footer running elements", () => {
      expect(BASE_STYLES).toContain("position: running(header)");
      expect(BASE_STYLES).toContain("position: running(footer)");
    });

    it("includes @page rule for header/footer", () => {
      expect(BASE_STYLES).toContain("@page");
      expect(BASE_STYLES).toContain("content: element(header)");
      expect(BASE_STYLES).toContain("content: element(footer)");
    });
  });

  describe("PDFN_SCRIPT (Event System)", () => {
    it("creates window.PDFN object", () => {
      expect(PDFN_SCRIPT).toContain("window.PDFN = {");
    });

    it("includes ready flag", () => {
      expect(PDFN_SCRIPT).toContain("ready: false");
    });

    it("includes metrics object with timing properties", () => {
      expect(PDFN_SCRIPT).toContain("metrics: {");
      expect(PDFN_SCRIPT).toContain("start: performance.now()");
      expect(PDFN_SCRIPT).toContain("pages: 0");
      expect(PDFN_SCRIPT).toContain("paginationTime: 0");
    });

    it("includes on method for event listeners", () => {
      expect(PDFN_SCRIPT).toContain("on: function(event, callback)");
      expect(PDFN_SCRIPT).toContain("addEventListener");
    });

    it("includes off method for removing listeners", () => {
      expect(PDFN_SCRIPT).toContain("off: function(event, callback)");
      expect(PDFN_SCRIPT).toContain("removeEventListener");
    });

    it("includes emit method for dispatching events", () => {
      expect(PDFN_SCRIPT).toContain("emit: function(event, data)");
      expect(PDFN_SCRIPT).toContain("CustomEvent");
    });

    it("includes mark method for timing metrics", () => {
      expect(PDFN_SCRIPT).toContain("mark: function(name)");
      expect(PDFN_SCRIPT).toContain("performance.now()");
    });

    it("hooks into Paged.js completion", () => {
      expect(PDFN_SCRIPT).toContain("Paged.Handler");
      expect(PDFN_SCRIPT).toContain("afterRendered");
      expect(PDFN_SCRIPT).toContain("window.PDFN.ready = true");
    });

    it("emits ready event after Paged.js completes", () => {
      expect(PDFN_SCRIPT).toContain("window.PDFN.emit('ready'");
    });

    it("handles case when Paged.js is not present", () => {
      expect(PDFN_SCRIPT).toContain("typeof Paged !== 'undefined'");
      expect(PDFN_SCRIPT).toContain("DOMContentLoaded");
    });
  });

  describe("assembleHtml", () => {
    it("returns valid HTML document", () => {
      const html = assembleHtml("<div>test</div>");

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("<html");
      expect(html).toContain("</html>");
      expect(html).toContain("<head>");
      expect(html).toContain("<body>");
    });

    it("includes content in body", () => {
      const content = "<div>Hello World</div>";
      const html = assembleHtml(content);

      expect(html).toContain(content);
    });

    it("includes base styles", () => {
      const html = assembleHtml("<div>test</div>");
      expect(html).toContain(BASE_STYLES);
    });

    it("includes PDFN script", () => {
      const html = assembleHtml("<div>test</div>");
      expect(html).toContain("window.PDFN");
    });

    it("includes Paged.js CDN script by default", () => {
      const html = assembleHtml("<div>test</div>");
      expect(html).toContain("unpkg.com/pagedjs");
      expect(html).toContain("paged.polyfill.js");
    });

    it("can exclude Paged.js CDN script", () => {
      const html = assembleHtml("<div>test</div>", { includePagedJs: false });
      expect(html).not.toContain("unpkg.com/pagedjs");
      expect(html).not.toContain("paged.polyfill.js");
    });

    it("includes title when provided", () => {
      const html = assembleHtml("<div>test</div>", {
        metadata: { title: "My Document" },
      });
      expect(html).toContain("<title>My Document</title>");
    });

    it("includes author meta tag when provided", () => {
      const html = assembleHtml("<div>test</div>", {
        metadata: { author: "John Doe" },
      });
      expect(html).toContain('name="author"');
      expect(html).toContain("John Doe");
    });

    it("includes language attribute", () => {
      const html = assembleHtml("<div>test</div>", {
        metadata: { language: "fr" },
      });
      expect(html).toContain('lang="fr"');
    });

    it("defaults to English language", () => {
      const html = assembleHtml("<div>test</div>");
      expect(html).toContain('lang="en"');
    });

    it("includes custom CSS when provided", () => {
      const customCss = ".custom { color: red; }";
      const html = assembleHtml("<div>test</div>", { css: customCss });
      expect(html).toContain(customCss);
    });

    it("escapes HTML in metadata", () => {
      const html = assembleHtml("<div>test</div>", {
        metadata: { title: "<script>alert('xss')</script>" },
      });
      expect(html).toContain("&lt;script&gt;");
      expect(html).not.toContain("<script>alert");
    });

    it("extracts page configuration from data attributes", () => {
      const content = '<div data-pdfn-page data-pdfn-width="210mm" data-pdfn-height="297mm" data-pdfn-margin="1in">content</div>';
      const html = assembleHtml(content);
      // @page CSS should be in the head
      expect(html).toContain("@page {");
      expect(html).toContain("size: 210mm 297mm");
      expect(html).toContain("margin: 1in");
    });

    it("extracts landscape page configuration", () => {
      const content = '<div data-pdfn-page data-pdfn-width="297mm" data-pdfn-height="210mm" data-pdfn-margin="0.5in">content</div>';
      const html = assembleHtml(content);
      expect(html).toContain("size: 297mm 210mm");
      expect(html).toContain("margin: 0.5in");
    });

    it("extracts Letter size page configuration", () => {
      const content = '<div data-pdfn-page data-pdfn-width="8.5in" data-pdfn-height="11in" data-pdfn-margin="0.75in">content</div>';
      const html = assembleHtml(content);
      expect(html).toContain("size: 8.5in 11in");
      expect(html).toContain("margin: 0.75in");
    });

    it("uses default margin when not specified in data attributes", () => {
      const content = '<div data-pdfn-page data-pdfn-width="210mm" data-pdfn-height="297mm">content</div>';
      const html = assembleHtml(content);
      expect(html).toContain("margin: 1in");
    });
  });

  describe("Google Fonts", () => {
    it("includes Google Fonts preconnect links when fonts provided", () => {
      const html = assembleHtml("<div>test</div>", {
        fonts: [{ family: "Inter" }],
      });
      expect(html).toContain('rel="preconnect"');
      expect(html).toContain("fonts.googleapis.com");
      expect(html).toContain("fonts.gstatic.com");
    });

    it("generates correct Google Fonts URL for single font", () => {
      const html = assembleHtml("<div>test</div>", {
        fonts: [{ family: "Inter" }],
      });
      expect(html).toContain("fonts.googleapis.com/css2");
      expect(html).toContain("family=Inter");
    });

    it("handles font names with spaces", () => {
      const html = assembleHtml("<div>test</div>", {
        fonts: [{ family: "Roboto Mono" }],
      });
      expect(html).toContain("family=Roboto+Mono");
    });

    it("includes multiple fonts in URL", () => {
      const html = assembleHtml("<div>test</div>", {
        fonts: [{ family: "Inter" }, { family: "Fira Code" }],
      });
      expect(html).toContain("family=Inter");
      expect(html).toContain("family=Fira+Code");
    });

    it("uses default weights when not specified", () => {
      const html = assembleHtml("<div>test</div>", {
        fonts: [{ family: "Inter" }],
      });
      // Default weights: 400, 500, 600, 700
      expect(html).toContain("0,400");
      expect(html).toContain("0,500");
      expect(html).toContain("0,600");
      expect(html).toContain("0,700");
    });

    it("uses custom weights when specified", () => {
      const html = assembleHtml("<div>test</div>", {
        fonts: [{ family: "Inter", weights: [300, 400, 800] }],
      });
      expect(html).toContain("0,300");
      expect(html).toContain("0,400");
      expect(html).toContain("0,800");
    });

    it("handles italic style", () => {
      const html = assembleHtml("<div>test</div>", {
        fonts: [{ family: "Inter", style: "italic" }],
      });
      // Italic uses 1,weight format
      expect(html).toContain("1,400");
    });

    it("includes display=swap parameter", () => {
      const html = assembleHtml("<div>test</div>", {
        fonts: [{ family: "Inter" }],
      });
      expect(html).toContain("display=swap");
    });

    it("does not include fonts link when no fonts provided", () => {
      const html = assembleHtml("<div>test</div>", {
        fonts: [],
      });
      expect(html).not.toContain("fonts.googleapis.com");
    });

    it("does not include fonts link when fonts undefined", () => {
      const html = assembleHtml("<div>test</div>");
      expect(html).not.toContain("fonts.googleapis.com");
    });
  });
});
