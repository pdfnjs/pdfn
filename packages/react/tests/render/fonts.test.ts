import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  isLocalFontPath,
  processLocalFonts,
  separateFonts,
  processCssFontFaces,
} from "../../src/render/fonts";
import type { FontConfig } from "../../src/types";

describe("Font Processing", () => {
  // Create a temporary test fixtures directory
  const fixturesDir = path.join(__dirname, "../fixtures/fonts");
  const testFontPath = path.join(fixturesDir, "test.woff2");
  const testTtfPath = path.join(fixturesDir, "test.ttf");

  beforeAll(() => {
    // Create fixtures directory
    fs.mkdirSync(fixturesDir, { recursive: true });

    // Create a minimal valid WOFF2 file header
    // WOFF2 signature: 'wOF2' (0x774F4632)
    const minimalWoff2 = Buffer.from([
      0x77, 0x4f, 0x46, 0x32, // wOF2 signature
      0x00, 0x01, 0x00, 0x00, // flavor (TrueType)
      0x00, 0x00, 0x00, 0x20, // length (32 bytes minimum)
      0x00, 0x00, // numTables
      0x00, 0x00, // reserved
      0x00, 0x00, 0x00, 0x00, // totalSfntSize
      0x00, 0x00, 0x00, 0x00, // totalCompressedSize
      0x00, 0x00, // majorVersion
      0x00, 0x00, // minorVersion
      0x00, 0x00, 0x00, 0x00, // metaOffset
      0x00, 0x00, 0x00, 0x00, // metaLength
    ]);
    fs.writeFileSync(testFontPath, minimalWoff2);

    // Create a minimal TTF file header
    // TTF signature starts with 0x00010000 for TrueType
    const minimalTtf = Buffer.from([
      0x00, 0x01, 0x00, 0x00, // sfntVersion (TrueType)
      0x00, 0x00, // numTables
      0x00, 0x00, // searchRange
      0x00, 0x00, // entrySelector
      0x00, 0x00, // rangeShift
    ]);
    fs.writeFileSync(testTtfPath, minimalTtf);
  });

  afterAll(() => {
    // Clean up fixtures
    fs.rmSync(fixturesDir, { recursive: true, force: true });
  });

  describe("isLocalFontPath", () => {
    it("returns false for http URLs", () => {
      expect(isLocalFontPath("http://example.com/font.woff2")).toBe(false);
    });

    it("returns false for https URLs", () => {
      expect(isLocalFontPath("https://example.com/font.woff2")).toBe(false);
    });

    it("returns false for data URIs", () => {
      expect(isLocalFontPath("data:font/woff2;base64,abc123")).toBe(false);
    });

    it("returns false for protocol-relative URLs", () => {
      expect(isLocalFontPath("//example.com/font.woff2")).toBe(false);
    });

    it("returns true for relative paths with ./", () => {
      expect(isLocalFontPath("./font.woff2")).toBe(true);
    });

    it("returns true for relative paths with ../", () => {
      expect(isLocalFontPath("../assets/font.woff2")).toBe(true);
    });

    it("returns true for simple filenames", () => {
      expect(isLocalFontPath("font.woff2")).toBe(true);
    });

    it("returns true for paths without leading ./", () => {
      expect(isLocalFontPath("assets/font.woff2")).toBe(true);
    });

    it("returns true for absolute file paths", () => {
      expect(isLocalFontPath("/var/www/font.woff2")).toBe(true);
    });
  });

  describe("separateFonts", () => {
    it("separates local fonts from Google Fonts", () => {
      const fonts: FontConfig[] = [
        { family: "Inter" }, // Google Font (no src)
        { family: "CustomFont", src: "./custom.woff2" }, // Local font
        { family: "Roboto", weights: [400, 700] }, // Google Font (no src)
        { family: "AnotherLocal", src: "/fonts/another.ttf", weight: 700 }, // Local font
      ];

      const { localFonts, googleFonts } = separateFonts(fonts);

      expect(googleFonts).toHaveLength(2);
      expect(googleFonts[0].family).toBe("Inter");
      expect(googleFonts[1].family).toBe("Roboto");

      expect(localFonts).toHaveLength(2);
      expect(localFonts[0].family).toBe("CustomFont");
      expect(localFonts[1].family).toBe("AnotherLocal");
    });

    it("returns empty arrays for empty input", () => {
      const { localFonts, googleFonts } = separateFonts([]);
      expect(localFonts).toHaveLength(0);
      expect(googleFonts).toHaveLength(0);
    });

    it("handles all Google Fonts", () => {
      const fonts: FontConfig[] = [
        { family: "Inter" },
        { family: "Roboto" },
      ];

      const { localFonts, googleFonts } = separateFonts(fonts);

      expect(googleFonts).toHaveLength(2);
      expect(localFonts).toHaveLength(0);
    });

    it("handles all local fonts", () => {
      const fonts: FontConfig[] = [
        { family: "CustomA", src: "./a.woff2" },
        { family: "CustomB", src: "./b.woff2" },
      ];

      const { localFonts, googleFonts } = separateFonts(fonts);

      expect(localFonts).toHaveLength(2);
      expect(googleFonts).toHaveLength(0);
    });

    it("excludes remote font URLs from both arrays", () => {
      const fonts: FontConfig[] = [
        { family: "RemoteFont", src: "https://example.com/font.woff2" },
      ];

      const { localFonts, googleFonts } = separateFonts(fonts);

      // Remote URLs are not embedded and not Google Fonts
      expect(localFonts).toHaveLength(0);
      expect(googleFonts).toHaveLength(0);
    });
  });

  describe("processLocalFonts", () => {
    it("generates @font-face CSS for local WOFF2 font", () => {
      const fonts: FontConfig[] = [
        { family: "TestFont", src: "./test.woff2" },
      ];

      const css = processLocalFonts(fonts, fixturesDir);

      expect(css).toContain("@font-face");
      expect(css).toContain("font-family: 'TestFont'");
      expect(css).toContain("data:font/woff2;base64,");
      expect(css).toContain("font-weight: 400"); // default
      expect(css).toContain("font-style: normal"); // default
      expect(css).toContain("font-display: swap");
    });

    it("generates @font-face CSS for local TTF font", () => {
      const fonts: FontConfig[] = [
        { family: "TestTtf", src: "./test.ttf" },
      ];

      const css = processLocalFonts(fonts, fixturesDir);

      expect(css).toContain("@font-face");
      expect(css).toContain("font-family: 'TestTtf'");
      expect(css).toContain("data:font/ttf;base64,");
    });

    it("respects custom weight and style", () => {
      const fonts: FontConfig[] = [
        { family: "TestFont", src: "./test.woff2", weight: 700, style: "italic" },
      ];

      const css = processLocalFonts(fonts, fixturesDir);

      expect(css).toContain("font-weight: 700");
      expect(css).toContain("font-style: italic");
    });

    it("skips fonts without src", () => {
      const fonts: FontConfig[] = [
        { family: "GoogleFont" }, // No src = Google Font
      ];

      const css = processLocalFonts(fonts, fixturesDir);

      expect(css).toBe("");
    });

    it("skips remote font URLs", () => {
      const fonts: FontConfig[] = [
        { family: "RemoteFont", src: "https://example.com/font.woff2" },
      ];

      const css = processLocalFonts(fonts, fixturesDir);

      expect(css).toBe("");
    });

    it("handles multiple local fonts", () => {
      const fonts: FontConfig[] = [
        { family: "Font1", src: "./test.woff2", weight: 400 },
        { family: "Font2", src: "./test.ttf", weight: 700 },
      ];

      const css = processLocalFonts(fonts, fixturesDir);

      expect(css).toContain("font-family: 'Font1'");
      expect(css).toContain("font-family: 'Font2'");
      expect(css).toContain("data:font/woff2;base64,");
      expect(css).toContain("data:font/ttf;base64,");
    });

    it("handles missing font files gracefully", () => {
      const fonts: FontConfig[] = [
        { family: "MissingFont", src: "./nonexistent.woff2" },
      ];

      const css = processLocalFonts(fonts, fixturesDir);

      // Should return empty string when file not found
      expect(css).toBe("");
    });

    it("uses absolute paths correctly", () => {
      const fonts: FontConfig[] = [
        { family: "AbsoluteFont", src: testFontPath },
      ];

      const css = processLocalFonts(fonts);

      expect(css).toContain("@font-face");
      expect(css).toContain("font-family: 'AbsoluteFont'");
      expect(css).toContain("data:font/woff2;base64,");
    });
  });

  describe("processCssFontFaces", () => {
    it("embeds local fonts from @font-face declarations", () => {
      const css = `
        @font-face {
          font-family: 'CustomFont';
          src: url('./test.woff2');
          font-weight: 400;
        }
        .text { color: red; }
      `;

      const result = processCssFontFaces(css, fixturesDir);

      expect(result).toContain("@font-face");
      expect(result).toContain("font-family: 'CustomFont'");
      expect(result).toContain("data:font/woff2;base64,");
      expect(result).toContain(".text { color: red; }");
      expect(result).not.toContain("url('./test.woff2')");
    });

    it("handles double-quoted URLs", () => {
      const css = `@font-face { font-family: 'Test'; src: url("./test.woff2"); }`;

      const result = processCssFontFaces(css, fixturesDir);

      expect(result).toContain("data:font/woff2;base64,");
    });

    it("handles single-quoted URLs", () => {
      const css = `@font-face { font-family: 'Test'; src: url('./test.woff2'); }`;

      const result = processCssFontFaces(css, fixturesDir);

      expect(result).toContain("data:font/woff2;base64,");
    });

    it("handles unquoted URLs", () => {
      const css = `@font-face { font-family: 'Test'; src: url(./test.woff2); }`;

      const result = processCssFontFaces(css, fixturesDir);

      expect(result).toContain("data:font/woff2;base64,");
    });

    it("skips remote font URLs", () => {
      const css = `
        @font-face {
          font-family: 'RemoteFont';
          src: url('https://example.com/font.woff2');
        }
      `;

      const result = processCssFontFaces(css, fixturesDir);

      expect(result).toContain("url('https://example.com/font.woff2')");
      expect(result).not.toContain("data:font");
    });

    it("handles multiple @font-face declarations", () => {
      const css = `
        @font-face {
          font-family: 'Font1';
          src: url('./test.woff2');
        }
        @font-face {
          font-family: 'Font2';
          src: url('./test.ttf');
        }
      `;

      const result = processCssFontFaces(css, fixturesDir);

      expect(result).toContain("data:font/woff2;base64,");
      expect(result).toContain("data:font/ttf;base64,");
    });

    it("handles src with format()", () => {
      const css = `
        @font-face {
          font-family: 'CustomFont';
          src: url('./test.woff2') format('woff2');
        }
      `;

      const result = processCssFontFaces(css, fixturesDir);

      expect(result).toContain("data:font/woff2;base64,");
      expect(result).toContain("format('woff2')");
    });

    it("handles multiple src URLs (fallbacks)", () => {
      const css = `
        @font-face {
          font-family: 'CustomFont';
          src: url('./test.woff2') format('woff2'),
               url('./test.ttf') format('truetype');
        }
      `;

      const result = processCssFontFaces(css, fixturesDir);

      expect(result).toContain("data:font/woff2;base64,");
      expect(result).toContain("data:font/ttf;base64,");
    });

    it("preserves CSS without @font-face", () => {
      const css = `
        .container { display: flex; }
        .text { color: blue; }
      `;

      const result = processCssFontFaces(css, fixturesDir);

      expect(result).toBe(css);
    });

    it("handles missing font files gracefully", () => {
      const css = `
        @font-face {
          font-family: 'MissingFont';
          src: url('./nonexistent.woff2');
        }
      `;

      const result = processCssFontFaces(css, fixturesDir);

      // Should keep original URL when file not found
      expect(result).toContain("url('./nonexistent.woff2')");
      expect(result).not.toContain("data:font");
    });

    it("handles mixed local and remote fonts", () => {
      const css = `
        @font-face {
          font-family: 'LocalFont';
          src: url('./test.woff2');
        }
        @font-face {
          font-family: 'RemoteFont';
          src: url('https://fonts.example.com/remote.woff2');
        }
      `;

      const result = processCssFontFaces(css, fixturesDir);

      // Local font should be embedded
      expect(result).toContain("data:font/woff2;base64,");
      // Remote font should be kept as-is
      expect(result).toContain("url('https://fonts.example.com/remote.woff2')");
    });
  });
});
