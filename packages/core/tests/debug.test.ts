import { describe, it, expect } from "vitest";
import {
  injectDebugSupport,
  PDFN_DEBUG_CSS,
  ALL_DEBUG_OPTIONS,
} from "../src/debug/index.js";

describe("ALL_DEBUG_OPTIONS constant", () => {
  it("has all debug options enabled", () => {
    expect(ALL_DEBUG_OPTIONS).toEqual({
      grid: true,
      margins: true,
      headers: true,
      breaks: true,
    });
  });
});

describe("PDFN_DEBUG_CSS constant", () => {
  it("contains grid overlay styles", () => {
    expect(PDFN_DEBUG_CSS).toContain(".pdfn-debug-grid");
    expect(PDFN_DEBUG_CSS).toContain("background-size: 10mm 10mm");
  });

  it("contains margin boundary styles", () => {
    expect(PDFN_DEBUG_CSS).toContain(".pdfn-debug-margins");
    expect(PDFN_DEBUG_CSS).toContain(".pagedjs_sheet");
    expect(PDFN_DEBUG_CSS).toContain(".pagedjs_pagebox");
  });

  it("contains header/footer highlight styles", () => {
    expect(PDFN_DEBUG_CSS).toContain(".pdfn-debug-headers");
    expect(PDFN_DEBUG_CSS).toContain("[data-pdfn-header]");
    expect(PDFN_DEBUG_CSS).toContain("[data-pdfn-footer]");
  });

  it("contains page number badge styles", () => {
    expect(PDFN_DEBUG_CSS).toContain(".pdfn-debug-breaks");
    expect(PDFN_DEBUG_CSS).toContain("Page");
    expect(PDFN_DEBUG_CSS).toContain("data-page-number");
  });
});

describe("injectDebugSupport", () => {
  const baseHtml = `<!DOCTYPE html>
<html>
<head>
<title>Test</title>
</head>
<body>
<div>Content</div>
</body>
</html>`;

  describe("when disabled", () => {
    it("returns unchanged HTML when options is false", () => {
      const result = injectDebugSupport(baseHtml, false);
      expect(result).toBe(baseHtml);
    });

    it("returns unchanged HTML when no options passed", () => {
      const result = injectDebugSupport(baseHtml);
      expect(result).toBe(baseHtml);
    });

    it("returns unchanged HTML when empty options object", () => {
      const result = injectDebugSupport(baseHtml, {});
      expect(result).toBe(baseHtml);
    });

    it("returns unchanged HTML when all options are false", () => {
      const result = injectDebugSupport(baseHtml, {
        grid: false,
        margins: false,
        headers: false,
        breaks: false,
      });
      expect(result).toBe(baseHtml);
    });
  });

  describe("when enabled with true", () => {
    it("injects all debug classes", () => {
      const result = injectDebugSupport(baseHtml, true);
      expect(result).toContain('class="pdfn-debug-grid');
      expect(result).toContain("pdfn-debug-margins");
      expect(result).toContain("pdfn-debug-headers");
      expect(result).toContain("pdfn-debug-breaks");
    });

    it("injects debug CSS styles", () => {
      const result = injectDebugSupport(baseHtml, true);
      expect(result).toContain('<style id="pdfn-debug-styles">');
      expect(result).toContain(".pdfn-debug-grid");
    });

    it("injects CSS before </head>", () => {
      const result = injectDebugSupport(baseHtml, true);
      const styleIndex = result.indexOf('<style id="pdfn-debug-styles">');
      const headEndIndex = result.indexOf("</head>");
      expect(styleIndex).toBeLessThan(headEndIndex);
    });
  });

  describe("with specific options", () => {
    it("injects only grid class on html element when grid: true", () => {
      const result = injectDebugSupport(baseHtml, { grid: true });
      // Check the html class attribute contains only grid class
      expect(result).toMatch(/<html class="pdfn-debug-grid">/);
    });

    it("injects only margins class on html element when margins: true", () => {
      const result = injectDebugSupport(baseHtml, { margins: true });
      expect(result).toMatch(/<html class="pdfn-debug-margins">/);
    });

    it("injects only headers class on html element when headers: true", () => {
      const result = injectDebugSupport(baseHtml, { headers: true });
      expect(result).toMatch(/<html class="pdfn-debug-headers">/);
    });

    it("injects only breaks class on html element when breaks: true", () => {
      const result = injectDebugSupport(baseHtml, { breaks: true });
      expect(result).toMatch(/<html class="pdfn-debug-breaks">/);
    });

    it("injects multiple classes on html element when multiple options true", () => {
      const result = injectDebugSupport(baseHtml, {
        grid: true,
        margins: true,
      });
      // Check the html class attribute contains both classes
      expect(result).toMatch(/<html class="pdfn-debug-grid pdfn-debug-margins">/);
    });
  });

  describe("HTML handling", () => {
    it("handles HTML already having a class attribute", () => {
      const htmlWithClass = `<!DOCTYPE html>
<html class="existing-class">
<head><title>Test</title></head>
<body></body>
</html>`;
      const result = injectDebugSupport(htmlWithClass, { grid: true });
      expect(result).toContain("pdfn-debug-grid");
      expect(result).toContain("existing-class");
    });

    it("handles HTML without head tag", () => {
      const noHead = `<html><body><div>Content</div></body></html>`;
      const result = injectDebugSupport(noHead, { grid: true });
      // Should still add classes even without head
      expect(result).toContain("pdfn-debug-grid");
      // CSS won't be injected without </head> but shouldn't crash
      expect(result).not.toContain('<style id="pdfn-debug-styles">');
    });

    it("handles minimal HTML", () => {
      const minimal = `<html><head></head><body></body></html>`;
      const result = injectDebugSupport(minimal, true);
      expect(result).toContain("pdfn-debug-grid");
      expect(result).toContain('<style id="pdfn-debug-styles">');
    });

    it("preserves rest of HTML structure", () => {
      const result = injectDebugSupport(baseHtml, true);
      expect(result).toContain("<!DOCTYPE html>");
      expect(result).toContain("<title>Test</title>");
      expect(result).toContain("<div>Content</div>");
      expect(result).toContain("</body>");
      expect(result).toContain("</html>");
    });
  });

  describe("class merging", () => {
    it("properly merges classes when html tag already has class", () => {
      const htmlWithClass = `<html class="dark theme-custom">
<head></head>
<body></body>
</html>`;
      const result = injectDebugSupport(htmlWithClass, { grid: true, margins: true });
      // Should have debug classes and existing classes
      expect(result).toContain("pdfn-debug-grid");
      expect(result).toContain("pdfn-debug-margins");
      // The existing class should be preserved
      expect(result).toContain("dark");
      expect(result).toContain("theme-custom");
    });
  });
});
