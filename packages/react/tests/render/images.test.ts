import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { isRelativePath, processImages, processCssImages } from "../../src/render/images";

describe("Image Processing", () => {
  // Create a temporary test fixtures directory
  const fixturesDir = path.join(__dirname, "../fixtures/images");
  const testImagePath = path.join(fixturesDir, "test.png");

  beforeAll(() => {
    // Create fixtures directory
    fs.mkdirSync(fixturesDir, { recursive: true });

    // Create a minimal valid PNG (1x1 transparent pixel)
    const minimalPng = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
      0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, // IDAT chunk
      0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, // IEND chunk
      0x42, 0x60, 0x82,
    ]);
    fs.writeFileSync(testImagePath, minimalPng);
  });

  afterAll(() => {
    // Clean up fixtures
    fs.rmSync(fixturesDir, { recursive: true, force: true });
  });

  describe("isRelativePath", () => {
    it("returns false for http URLs", () => {
      expect(isRelativePath("http://example.com/image.png")).toBe(false);
    });

    it("returns false for https URLs", () => {
      expect(isRelativePath("https://example.com/image.png")).toBe(false);
    });

    it("returns false for data URIs", () => {
      expect(isRelativePath("data:image/png;base64,abc123")).toBe(false);
    });

    it("returns false for protocol-relative URLs", () => {
      expect(isRelativePath("//example.com/image.png")).toBe(false);
    });

    it("returns true for relative paths with ./", () => {
      expect(isRelativePath("./image.png")).toBe(true);
    });

    it("returns true for relative paths with ../", () => {
      expect(isRelativePath("../assets/image.png")).toBe(true);
    });

    it("returns true for simple filenames", () => {
      expect(isRelativePath("image.png")).toBe(true);
    });

    it("returns true for paths without leading ./", () => {
      expect(isRelativePath("assets/image.png")).toBe(true);
    });

    it("returns true for absolute file paths", () => {
      expect(isRelativePath("/var/www/image.png")).toBe(true);
    });
  });

  describe("processImages", () => {
    it("embeds relative image as base64 data URI", () => {
      const html = `<img src="./test.png">`;
      const result = processImages(html, fixturesDir);

      expect(result).toContain("data:image/png;base64,");
      expect(result).not.toContain("./test.png");
    });

    it("preserves http URLs", () => {
      const html = `<img src="https://example.com/image.png">`;
      const result = processImages(html, fixturesDir);

      expect(result).toBe(html);
    });

    it("preserves https URLs", () => {
      const html = `<img src="https://example.com/image.png">`;
      const result = processImages(html, fixturesDir);

      expect(result).toBe(html);
    });

    it("preserves data URIs", () => {
      const html = `<img src="data:image/png;base64,abc123">`;
      const result = processImages(html, fixturesDir);

      expect(result).toBe(html);
    });

    it("handles img tags with other attributes", () => {
      const html = `<img class="logo" src="./test.png" alt="Logo" width="100">`;
      const result = processImages(html, fixturesDir);

      expect(result).toContain("data:image/png;base64,");
      expect(result).toContain('class="logo"');
      expect(result).toContain('alt="Logo"');
      expect(result).toContain('width="100"');
    });

    it("handles multiple images", () => {
      const html = `
        <img src="./test.png">
        <img src="https://example.com/remote.png">
        <img src="./test.png">
      `;
      const result = processImages(html, fixturesDir);

      // Should have 2 embedded images (both ./test.png)
      const dataUriMatches = result.match(/data:image\/png;base64,/g);
      expect(dataUriMatches?.length).toBe(2);

      // Remote URL should be preserved
      expect(result).toContain("https://example.com/remote.png");
    });

    it("keeps original src for missing files", () => {
      const html = `<img src="./nonexistent.png">`;
      const result = processImages(html, fixturesDir);

      expect(result).toBe(html);
    });

    it("handles single quotes in src", () => {
      const html = `<img src='./test.png'>`;
      const result = processImages(html, fixturesDir);

      expect(result).toContain("data:image/png;base64,");
    });

    it("handles self-closing img tags", () => {
      const html = `<img src="./test.png" />`;
      const result = processImages(html, fixturesDir);

      expect(result).toContain("data:image/png;base64,");
    });

    it("uses correct MIME type for different extensions", () => {
      // Create test files with different extensions
      const jpgPath = path.join(fixturesDir, "test.jpg");
      const svgPath = path.join(fixturesDir, "test.svg");

      fs.writeFileSync(jpgPath, Buffer.from([0xff, 0xd8, 0xff, 0xe0])); // JPEG magic bytes
      fs.writeFileSync(svgPath, "<svg></svg>");

      const htmlJpg = `<img src="./test.jpg">`;
      const resultJpg = processImages(htmlJpg, fixturesDir);
      expect(resultJpg).toContain("data:image/jpeg;base64,");

      const htmlSvg = `<img src="./test.svg">`;
      const resultSvg = processImages(htmlSvg, fixturesDir);
      expect(resultSvg).toContain("data:image/svg+xml;base64,");

      // Clean up
      fs.unlinkSync(jpgPath);
      fs.unlinkSync(svgPath);
    });
  });

  describe("processCssImages", () => {
    it("embeds relative image in url() as base64", () => {
      const css = `.logo { background-image: url("./test.png"); }`;
      const result = processCssImages(css, fixturesDir);

      expect(result).toContain("data:image/png;base64,");
      expect(result).not.toContain("./test.png");
    });

    it("preserves http URLs in url()", () => {
      const css = `.logo { background-image: url("https://example.com/bg.png"); }`;
      const result = processCssImages(css, fixturesDir);

      expect(result).toBe(css);
    });

    it("handles url() without quotes", () => {
      const css = `.logo { background-image: url(./test.png); }`;
      const result = processCssImages(css, fixturesDir);

      expect(result).toContain("data:image/png;base64,");
    });

    it("handles url() with single quotes", () => {
      const css = `.logo { background-image: url('./test.png'); }`;
      const result = processCssImages(css, fixturesDir);

      expect(result).toContain("data:image/png;base64,");
    });

    it("handles multiple url() in CSS", () => {
      const css = `
        .logo { background-image: url("./test.png"); }
        .banner { background: url("https://example.com/banner.png"); }
        .icon { background-image: url("./test.png"); }
      `;
      const result = processCssImages(css, fixturesDir);

      // Should have 2 embedded images
      const dataUriMatches = result.match(/data:image\/png;base64,/g);
      expect(dataUriMatches?.length).toBe(2);

      // Remote URL should be preserved
      expect(result).toContain("https://example.com/banner.png");
    });
  });
});
