import { describe, it, expect } from "vitest";
import { generatePageCss, extractPageConfig } from "../src/css/page-css.js";

describe("generatePageCss", () => {
  it("returns empty string when no config provided", () => {
    expect(generatePageCss()).toBe("");
    expect(generatePageCss(undefined)).toBe("");
  });

  it("returns empty string when no dimensions provided", () => {
    const css = generatePageCss({ margin: "1in" });
    expect(css).toBe("");
  });

  it("generates @page CSS with size and default margin", () => {
    const css = generatePageCss({ width: "595.28pt", height: "841.89pt" });
    expect(css).toContain("@page");
    expect(css).toContain("size: 595.28pt 841.89pt");
    expect(css).toContain("margin: 1in");
  });

  it("generates @page CSS with custom margin", () => {
    const css = generatePageCss({
      width: "612pt",
      height: "792pt",
      margin: "0.5in",
    });
    expect(css).toContain("size: 612pt 792pt");
    expect(css).toContain("margin: 0.5in");
  });

  it("generates watermark CSS with text", () => {
    const css = generatePageCss({
      width: "595.28pt",
      height: "841.89pt",
      watermark: { text: "DRAFT" },
    });
    expect(css).toContain('content: "DRAFT"');
    expect(css).toContain("rotate(-35deg)"); // default rotation
    expect(css).toContain(".pagedjs_page > .pagedjs_sheet::before");
  });

  it("generates watermark CSS with custom rotation", () => {
    const css = generatePageCss({
      width: "595.28pt",
      height: "841.89pt",
      watermark: { text: "CONFIDENTIAL", rotation: -45 },
    });
    expect(css).toContain('content: "CONFIDENTIAL"');
    expect(css).toContain("rotate(-45deg)");
  });

  it("generates watermark CSS with custom opacity", () => {
    const css = generatePageCss({
      width: "595.28pt",
      height: "841.89pt",
      watermark: { text: "SAMPLE", opacity: 0.2 },
    });
    expect(css).toContain('content: "SAMPLE"');
    // opacity * 1.5 = 0.3, capped at 0.3
    expect(css).toContain("rgba(156, 163, 175, 0.3)");
  });

  it("caps watermark alpha at 0.3", () => {
    const css = generatePageCss({
      width: "595.28pt",
      height: "841.89pt",
      watermark: { text: "BRIGHT", opacity: 0.5 },
    });
    // 0.5 * 1.5 = 0.75, but capped at 0.3
    expect(css).toContain("rgba(156, 163, 175, 0.3)");
  });

  it("uses default opacity when not specified", () => {
    const css = generatePageCss({
      width: "595.28pt",
      height: "841.89pt",
      watermark: { text: "TEST" },
    });
    // default opacity is 0.1, alpha = 0.1 * 1.5 = 0.15
    // Use regex to handle floating point precision (0.15000000000000002)
    expect(css).toMatch(/rgba\(156, 163, 175, 0\.15\d*\)/);
  });

  it("includes all necessary watermark styling", () => {
    const css = generatePageCss({
      width: "595.28pt",
      height: "841.89pt",
      watermark: { text: "DRAFT" },
    });
    expect(css).toContain("position: absolute");
    expect(css).toContain("top: 50%");
    expect(css).toContain("left: 50%");
    expect(css).toContain("translate(-50%, -50%)");
    expect(css).toContain("font-size: 5rem");
    expect(css).toContain("font-weight: 900");
    expect(css).toContain("text-transform: uppercase");
    expect(css).toContain("pointer-events: none");
    expect(css).toContain("z-index: 9999");
  });
});

describe("extractPageConfig", () => {
  it("returns undefined when no page dimensions found", () => {
    const config = extractPageConfig("<div>Content</div>");
    expect(config).toBeUndefined();
  });

  it("returns undefined when only width is found", () => {
    const config = extractPageConfig('<div data-pdfn-width="595.28pt">Content</div>');
    expect(config).toBeUndefined();
  });

  it("returns undefined when only height is found", () => {
    const config = extractPageConfig('<div data-pdfn-height="841.89pt">Content</div>');
    expect(config).toBeUndefined();
  });

  it("extracts basic page dimensions", () => {
    const html = '<div data-pdfn-width="595.28pt" data-pdfn-height="841.89pt">Content</div>';
    const config = extractPageConfig(html);
    expect(config).toEqual({
      width: "595.28pt",
      height: "841.89pt",
      margin: undefined,
      watermark: undefined,
    });
  });

  it("extracts page dimensions with margin", () => {
    const html =
      '<div data-pdfn-width="612pt" data-pdfn-height="792pt" data-pdfn-margin="0.5in">Content</div>';
    const config = extractPageConfig(html);
    expect(config).toEqual({
      width: "612pt",
      height: "792pt",
      margin: "0.5in",
      watermark: undefined,
    });
  });

  it("extracts watermark text", () => {
    const html = `<div data-pdfn-width="595.28pt" data-pdfn-height="841.89pt" data-pdfn-watermark-text="DRAFT">Content</div>`;
    const config = extractPageConfig(html);
    expect(config?.watermark?.text).toBe("DRAFT");
  });

  it("extracts watermark with opacity", () => {
    const html = `<div data-pdfn-width="595.28pt" data-pdfn-height="841.89pt" data-pdfn-watermark-text="SAMPLE" data-pdfn-watermark-opacity="0.2">Content</div>`;
    const config = extractPageConfig(html);
    expect(config?.watermark?.text).toBe("SAMPLE");
    expect(config?.watermark?.opacity).toBe(0.2);
  });

  it("extracts watermark with rotation", () => {
    const html = `<div data-pdfn-width="595.28pt" data-pdfn-height="841.89pt" data-pdfn-watermark-text="CONFIDENTIAL" data-pdfn-watermark-rotation="-45">Content</div>`;
    const config = extractPageConfig(html);
    expect(config?.watermark?.text).toBe("CONFIDENTIAL");
    expect(config?.watermark?.rotation).toBe(-45);
  });

  it("extracts full watermark config", () => {
    const html = `<div data-pdfn-width="595.28pt" data-pdfn-height="841.89pt" data-pdfn-margin="1in" data-pdfn-watermark-text="TOP SECRET" data-pdfn-watermark-opacity="0.15" data-pdfn-watermark-rotation="-30">Content</div>`;
    const config = extractPageConfig(html);
    expect(config).toEqual({
      width: "595.28pt",
      height: "841.89pt",
      margin: "1in",
      watermark: {
        text: "TOP SECRET",
        opacity: 0.15,
        rotation: -30,
      },
    });
  });

  it("handles multiline HTML", () => {
    const html = `
      <html>
        <body>
          <div
            data-pdfn-width="595.28pt"
            data-pdfn-height="841.89pt"
            data-pdfn-margin="2cm"
          >
            Content
          </div>
        </body>
      </html>
    `;
    const config = extractPageConfig(html);
    expect(config?.width).toBe("595.28pt");
    expect(config?.height).toBe("841.89pt");
    expect(config?.margin).toBe("2cm");
  });

  it("handles attributes in any order", () => {
    const html =
      '<div data-pdfn-margin="1in" data-pdfn-height="792pt" data-pdfn-width="612pt">Content</div>';
    const config = extractPageConfig(html);
    expect(config).toEqual({
      width: "612pt",
      height: "792pt",
      margin: "1in",
      watermark: undefined,
    });
  });
});
