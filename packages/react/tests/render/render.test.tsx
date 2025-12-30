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
    expect(html).toContain("data-pdfx-document");
    expect(html).toContain("data-pdfx-page");
  });

  it("includes base print styles", async () => {
    const html = await render(
      <Document>
        <Page>Content</Page>
      </Document>
    );

    expect(html).toContain("print-color-adjust: exact");
    expect(html).toContain("[data-pdfx-page]");
    expect(html).toContain("[data-pdfx-content]");
  });

  it("includes page number CSS counters", async () => {
    const html = await render(
      <Document>
        <Page>Content</Page>
      </Document>
    );

    expect(html).toContain("[data-pdfx-page-number]::after");
    expect(html).toContain("content: counter(page)");
    expect(html).toContain("[data-pdfx-total-pages]::after");
    expect(html).toContain("content: counter(pages)");
  });

  it("includes PDFX event system script", async () => {
    const html = await render(
      <Document>
        <Page>Content</Page>
      </Document>
    );

    expect(html).toContain("window.PDFX");
    expect(html).toContain("PDFX.ready");
    expect(html).toContain("PDFX.emit");
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

});
