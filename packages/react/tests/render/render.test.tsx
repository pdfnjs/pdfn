import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { render } from "../../src/render/render";
import { Document } from "../../src/components/Document";
import { Page } from "../../src/components/Page";

describe("render", () => {
  beforeEach(() => {
    // Suppress console.warn from tailwind processing
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns valid HTML document", async () => {
    const html = await render(
      <Document>
        <Page>
          <h1>Test</h1>
        </Page>
      </Document>
    );

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html");
    expect(html).toContain("</html>");
    expect(html).toContain("<head>");
    expect(html).toContain("<body>");
  });

  it("includes rendered React content", async () => {
    const html = await render(
      <Document>
        <Page>
          <h1>Hello World</h1>
        </Page>
      </Document>
    );

    expect(html).toContain("Hello World");
    expect(html).toContain("data-pdfn-document");
    expect(html).toContain("data-pdfn-page");
  });

  it("includes base print styles", async () => {
    const html = await render(
      <Document>
        <Page>Content</Page>
      </Document>
    );

    expect(html).toContain("print-color-adjust: exact");
    expect(html).toContain("[data-pdfn-page]");
    expect(html).toContain("[data-pdfn-content]");
  });

  it("includes page number CSS counters", async () => {
    const html = await render(
      <Document>
        <Page>Content</Page>
      </Document>
    );

    expect(html).toContain("[data-pdfn-page-number]::after");
    expect(html).toContain("content: counter(page)");
    expect(html).toContain("[data-pdfn-total-pages]::after");
    expect(html).toContain("content: counter(pages)");
  });

  it("includes PDFN event system script", async () => {
    const html = await render(
      <Document>
        <Page>Content</Page>
      </Document>
    );

    expect(html).toContain("window.PDFN");
    expect(html).toContain("PDFN.ready");
    expect(html).toContain("PDFN.emit");
  });

  it("includes Paged.js by default", async () => {
    const html = await render(
      <Document>
        <Page>Content</Page>
      </Document>
    );

    expect(html).toContain("paged.polyfill.js");
  });

  it("includes document metadata in HTML", async () => {
    const html = await render(
      <Document
        title="Test Document"
        author="Test Author"
        subject="Test Subject"
        keywords={["test", "document"]}
        language="en"
      >
        <Page>Content</Page>
      </Document>
    );

    expect(html).toContain("<title>Test Document</title>");
    expect(html).toContain('name="author" content="Test Author"');
    expect(html).toContain('name="description" content="Test Subject"');
    expect(html).toContain('name="keywords" content="test, document"');
    expect(html).toContain('lang="en"');
  });

  describe("fonts support", () => {
    // Create test font fixtures
    const fixturesDir = path.join(__dirname, "../fixtures/fonts");
    const testFontPath = path.join(fixturesDir, "test.woff2");

    beforeAll(() => {
      fs.mkdirSync(fixturesDir, { recursive: true });
      // Create a minimal valid WOFF2 file
      const minimalWoff2 = Buffer.from([
        0x77, 0x4f, 0x46, 0x32, // wOF2 signature
        0x00, 0x01, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x20,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
      ]);
      fs.writeFileSync(testFontPath, minimalWoff2);
    });

    afterAll(() => {
      fs.rmSync(fixturesDir, { recursive: true, force: true });
    });

    it("includes Google Fonts link when fonts prop specified with strings", async () => {
      const html = await render(
        <Document fonts={["Inter", "Roboto Mono"]}>
          <Page>Content</Page>
        </Document>
      );

      expect(html).toContain("fonts.googleapis.com");
      expect(html).toContain("family=Inter");
      expect(html).toContain("family=Roboto+Mono");
    });

    it("includes Google Fonts link when fonts prop specified with FontConfig", async () => {
      const html = await render(
        <Document
          fonts={[
            { family: "Inter", weights: [400, 700] },
            { family: "Fira Code", weights: [400, 500] },
          ]}
        >
          <Page>Content</Page>
        </Document>
      );

      expect(html).toContain("fonts.googleapis.com");
      expect(html).toContain("family=Inter");
      expect(html).toContain("family=Fira+Code");
    });

    it("does not include Google Fonts link when no fonts specified", async () => {
      const html = await render(
        <Document>
          <Page>Content</Page>
        </Document>
      );

      expect(html).not.toContain("fonts.googleapis.com");
    });

    it("includes preconnect hints for Google Fonts", async () => {
      const html = await render(
        <Document fonts={["Inter"]}>
          <Page>Content</Page>
        </Document>
      );

      expect(html).toContain('rel="preconnect"');
      expect(html).toContain("fonts.gstatic.com");
    });

    it("embeds local font as base64 when src is provided", async () => {
      const html = await render(
        <Document
          fonts={[{ family: "CustomFont", src: testFontPath, weight: 400 }]}
        >
          <Page>Content</Page>
        </Document>
      );

      // Should contain @font-face with base64 data
      expect(html).toContain("@font-face");
      expect(html).toContain("font-family: 'CustomFont'");
      expect(html).toContain("data:font/woff2;base64,");
      expect(html).toContain("font-weight: 400");
      // Should NOT include Google Fonts link for local font
      expect(html).not.toContain("fonts.googleapis.com");
    });

    it("handles mix of local and Google Fonts", async () => {
      const html = await render(
        <Document
          fonts={[
            { family: "Inter" }, // Google Font
            { family: "LocalFont", src: testFontPath, weight: 700 }, // Local font
          ]}
        >
          <Page>Content</Page>
        </Document>
      );

      // Should have Google Fonts link for Inter
      expect(html).toContain("fonts.googleapis.com");
      expect(html).toContain("family=Inter");
      // Should have embedded @font-face for local font
      expect(html).toContain("@font-face");
      expect(html).toContain("font-family: 'LocalFont'");
      expect(html).toContain("data:font/woff2;base64,");
      expect(html).toContain("font-weight: 700");
    });

    it("embeds local font with italic style", async () => {
      const html = await render(
        <Document
          fonts={[
            { family: "CustomItalic", src: testFontPath, weight: 400, style: "italic" },
          ]}
        >
          <Page>Content</Page>
        </Document>
      );

      expect(html).toContain("@font-face");
      expect(html).toContain("font-family: 'CustomItalic'");
      expect(html).toContain("font-style: italic");
    });
  });

});
