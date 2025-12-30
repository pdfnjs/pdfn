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

  it("applies A4 dimensions by default (in points)", () => {
    const html = renderToStaticMarkup(
      <Page>
        <div>Content</div>
      </Page>
    );
    // A4: 595.28pt x 841.89pt
    expect(html).toContain("595.28pt");
    expect(html).toContain("841.89pt");
  });

  it("applies Letter dimensions (in points)", () => {
    const html = renderToStaticMarkup(
      <Page size="Letter">
        <div>Content</div>
      </Page>
    );
    // Letter: 612pt x 792pt (exact whole numbers)
    expect(html).toContain("612pt");
    expect(html).toContain("792pt");
  });

  it("applies custom dimensions (converted to points)", () => {
    const html = renderToStaticMarkup(
      <Page size={["200mm", "300mm"]}>
        <div>Content</div>
      </Page>
    );
    // Custom sizes are converted to points
    expect(html).toContain("pt");
    expect(html).toContain('data-pdfx-size="Custom"');
  });

  it("applies landscape orientation", () => {
    const html = renderToStaticMarkup(
      <Page size="A4" orientation="landscape">
        <div>Content</div>
      </Page>
    );
    // Landscape swaps width/height: 841.89pt x 595.28pt
    expect(html).toContain('data-pdfx-width="841.89pt"');
    expect(html).toContain('data-pdfx-height="595.28pt"');
    expect(html).toContain('data-pdfx-size="A4 Landscape"');
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

  it("renders watermark with WatermarkConfig text", () => {
    const html = renderToStaticMarkup(
      <Page watermark={{ text: "CONFIDENTIAL" }}>
        <div>Content</div>
      </Page>
    );
    expect(html).toContain("data-pdfx-watermark");
    expect(html).toContain("CONFIDENTIAL");
  });

  it("renders watermark with custom opacity", () => {
    const html = renderToStaticMarkup(
      <Page watermark={{ text: "DRAFT", opacity: 0.2 }}>
        <div>Content</div>
      </Page>
    );
    expect(html).toContain("opacity:0.2");
  });

  it("renders watermark with custom rotation", () => {
    const html = renderToStaticMarkup(
      <Page watermark={{ text: "DRAFT", rotation: -30 }}>
        <div>Content</div>
      </Page>
    );
    expect(html).toContain("rotate(-30deg)");
  });

  it("renders watermark with custom className", () => {
    const html = renderToStaticMarkup(
      <Page watermark={{ text: "DRAFT", className: "my-watermark" }}>
        <div>Content</div>
      </Page>
    );
    expect(html).toContain('class="my-watermark"');
  });

  it("renders watermark with React content", () => {
    const html = renderToStaticMarkup(
      <Page watermark={{ content: <span className="custom">Custom Watermark</span> }}>
        <div>Content</div>
      </Page>
    );
    expect(html).toContain("Custom Watermark");
    expect(html).toContain('class="custom"');
  });

  it("includes page size and margin data attributes", () => {
    const html = renderToStaticMarkup(
      <Page size="A4" margin="1in">
        <div>Content</div>
      </Page>
    );
    expect(html).toContain('data-pdfx-size="A4"');
    expect(html).toContain('data-pdfx-margin="1in"');
  });

  it("includes custom margin in data attribute", () => {
    const html = renderToStaticMarkup(
      <Page size="Letter" margin={{ top: "0.5in", right: "1in", bottom: "0.5in", left: "1in" }}>
        <div>Content</div>
      </Page>
    );
    expect(html).toContain('data-pdfx-size="Letter"');
    expect(html).toContain('data-pdfx-margin="0.5in 1in 0.5in 1in"');
  });
});
