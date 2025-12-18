import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Page } from "../../src/components/Page";

describe("Page", () => {
  it("renders children in main content area", () => {
    const html = renderToStaticMarkup(
      <Page>
        <div>Content</div>
      </Page>
    );
    expect(html).toContain("data-pdfx-content");
    expect(html).toContain("Content");
  });

  it("renders header when provided", () => {
    const html = renderToStaticMarkup(
      <Page header={<span>Header</span>}>
        <div>Content</div>
      </Page>
    );
    expect(html).toContain("data-pdfx-header");
    expect(html).toContain("Header");
  });

  it("renders footer when provided", () => {
    const html = renderToStaticMarkup(
      <Page footer={<span>Footer</span>}>
        <div>Content</div>
      </Page>
    );
    expect(html).toContain("data-pdfx-footer");
    expect(html).toContain("Footer");
  });

  it("does not render header/footer when not provided", () => {
    const html = renderToStaticMarkup(
      <Page>
        <div>Content</div>
      </Page>
    );
    expect(html).not.toContain("data-pdfx-header");
    expect(html).not.toContain("data-pdfx-footer");
  });

  it("applies A4 dimensions by default", () => {
    const html = renderToStaticMarkup(
      <Page>
        <div>Content</div>
      </Page>
    );
    expect(html).toContain("210mm");
    expect(html).toContain("297mm");
  });

  it("applies Letter dimensions", () => {
    const html = renderToStaticMarkup(
      <Page size="Letter">
        <div>Content</div>
      </Page>
    );
    expect(html).toContain("8.5in");
    expect(html).toContain("11in");
  });

  it("applies custom dimensions", () => {
    const html = renderToStaticMarkup(
      <Page size={["200mm", "300mm"]}>
        <div>Content</div>
      </Page>
    );
    expect(html).toContain("200mm");
    expect(html).toContain("300mm");
  });

  it("applies landscape orientation", () => {
    const html = renderToStaticMarkup(
      <Page size="A4" orientation="landscape">
        <div>Content</div>
      </Page>
    );
    // Landscape swaps width/height: 297mm x 210mm
    expect(html).toContain("width:297mm");
    expect(html).toContain("min-height:210mm");
  });

  it("renders watermark when provided as string", () => {
    const html = renderToStaticMarkup(
      <Page watermark="DRAFT">
        <div>Content</div>
      </Page>
    );
    expect(html).toContain("data-pdfx-watermark");
    expect(html).toContain("DRAFT");
  });
});
