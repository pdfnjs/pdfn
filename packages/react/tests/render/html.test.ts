import { describe, it, expect } from "vitest";
import { assembleHtml, BASE_STYLES, PDFX_SCRIPT } from "../../src/render/html";

describe("HTML Assembly", () => {
  describe("BASE_STYLES", () => {
    it("includes print color adjust", () => {
      expect(BASE_STYLES).toContain("-webkit-print-color-adjust: exact");
      expect(BASE_STYLES).toContain("print-color-adjust: exact");
    });

    it("includes page counter styles", () => {
      expect(BASE_STYLES).toContain("[data-pdfx-page-number]::after");
      expect(BASE_STYLES).toContain("content: counter(page)");
      expect(BASE_STYLES).toContain("[data-pdfx-total-pages]::after");
      expect(BASE_STYLES).toContain("content: counter(pages)");
    });

    it("includes page break styles", () => {
      expect(BASE_STYLES).toContain("[data-pdfx-page-break]");
      expect(BASE_STYLES).toContain("break-after: page");
    });

    it("includes avoid break styles", () => {
      expect(BASE_STYLES).toContain("[data-pdfx-avoid-break]");
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

  describe("PDFX_SCRIPT (Event System)", () => {
    it("creates window.PDFX object", () => {
      expect(PDFX_SCRIPT).toContain("window.PDFX = {");
    });

    it("includes ready flag", () => {
      expect(PDFX_SCRIPT).toContain("ready: false");
    });

    it("includes metrics object", () => {
      expect(PDFX_SCRIPT).toContain("metrics: {}");
    });

    it("includes on method for event listeners", () => {
      expect(PDFX_SCRIPT).toContain("on: function(event, callback)");
      expect(PDFX_SCRIPT).toContain("addEventListener");
    });

    it("includes off method for removing listeners", () => {
      expect(PDFX_SCRIPT).toContain("off: function(event, callback)");
      expect(PDFX_SCRIPT).toContain("removeEventListener");
    });

    it("includes emit method for dispatching events", () => {
      expect(PDFX_SCRIPT).toContain("emit: function(event, data)");
      expect(PDFX_SCRIPT).toContain("CustomEvent");
    });

    it("includes mark method for timing metrics", () => {
      expect(PDFX_SCRIPT).toContain("mark: function(name)");
      expect(PDFX_SCRIPT).toContain("performance.now()");
    });

    it("hooks into Paged.js completion", () => {
      expect(PDFX_SCRIPT).toContain("Paged.Handler");
      expect(PDFX_SCRIPT).toContain("afterRendered");
      expect(PDFX_SCRIPT).toContain("window.PDFX.ready = true");
    });

    it("emits ready event after Paged.js completes", () => {
      expect(PDFX_SCRIPT).toContain("window.PDFX.emit('ready'");
    });

    it("handles case when Paged.js is not present", () => {
      expect(PDFX_SCRIPT).toContain("typeof Paged !== 'undefined'");
      expect(PDFX_SCRIPT).toContain("DOMContentLoaded");
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

    it("includes PDFX script", () => {
      const html = assembleHtml("<div>test</div>");
      expect(html).toContain("window.PDFX");
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
      const content = '<div data-pdfx-page data-pdfx-width="210mm" data-pdfx-height="297mm" data-pdfx-margin="1in">content</div>';
      const html = assembleHtml(content);
      // @page CSS should be in the head
      expect(html).toContain("@page {");
      expect(html).toContain("size: 210mm 297mm");
      expect(html).toContain("margin: 1in");
    });

    it("extracts landscape page configuration", () => {
      const content = '<div data-pdfx-page data-pdfx-width="297mm" data-pdfx-height="210mm" data-pdfx-margin="0.5in">content</div>';
      const html = assembleHtml(content);
      expect(html).toContain("size: 297mm 210mm");
      expect(html).toContain("margin: 0.5in");
    });

    it("extracts Letter size page configuration", () => {
      const content = '<div data-pdfx-page data-pdfx-width="8.5in" data-pdfx-height="11in" data-pdfx-margin="0.75in">content</div>';
      const html = assembleHtml(content);
      expect(html).toContain("size: 8.5in 11in");
      expect(html).toContain("margin: 0.75in");
    });

    it("uses default margin when not specified in data attributes", () => {
      const content = '<div data-pdfx-page data-pdfx-width="210mm" data-pdfx-height="297mm">content</div>';
      const html = assembleHtml(content);
      expect(html).toContain("margin: 1in");
    });
  });
});
