import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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
  });

});
