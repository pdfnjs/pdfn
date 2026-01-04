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
    expect(html).toContain("data-pdfn-content");
    expect(html).toContain("Content");
  });

  it("renders header when provided", () => {
    const html = renderToStaticMarkup(
      <Page header={<span>Header</span>}>
        <div>Content</div>
      </Page>
    );
    expect(html).toContain("data-pdfn-header");
    expect(html).toContain("Header");
  });

  it("renders footer when provided", () => {
    const html = renderToStaticMarkup(
      <Page footer={<span>Footer</span>}>
        <div>Content</div>
      </Page>
    );
    expect(html).toContain("data-pdfn-footer");
    expect(html).toContain("Footer");
  });

  it("does not render header/footer when not provided", () => {
    const html = renderToStaticMarkup(
      <Page>
        <div>Content</div>
      </Page>
    );
    expect(html).not.toContain("data-pdfn-header");
    expect(html).not.toContain("data-pdfn-footer");
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
    expect(html).toContain('data-pdfn-size="Custom"');
  });

  it("applies landscape orientation", () => {
    const html = renderToStaticMarkup(
      <Page size="A4" orientation="landscape">
        <div>Content</div>
      </Page>
    );
    // Landscape swaps width/height: 841.89pt x 595.28pt
    expect(html).toContain('data-pdfn-width="841.89pt"');
    expect(html).toContain('data-pdfn-height="595.28pt"');
    expect(html).toContain('data-pdfn-size="A4 Landscape"');
  });

  it("renders watermark when provided as string", () => {
    const html = renderToStaticMarkup(
      <Page watermark="DRAFT">
        <div>Content</div>
      </Page>
    );
    expect(html).toContain('data-pdfn-watermark-text="DRAFT"');
  });

  it("renders watermark with WatermarkConfig text", () => {
    const html = renderToStaticMarkup(
      <Page watermark={{ text: "CONFIDENTIAL" }}>
        <div>Content</div>
      </Page>
    );
    expect(html).toContain('data-pdfn-watermark-text="CONFIDENTIAL"');
  });

  it("stores watermark opacity as data attribute", () => {
    const html = renderToStaticMarkup(
      <Page watermark={{ text: "DRAFT", opacity: 0.2 }}>
        <div>Content</div>
      </Page>
    );
    expect(html).toContain('data-pdfn-watermark-text="DRAFT"');
    expect(html).toContain('data-pdfn-watermark-opacity="0.2"');
  });

  it("stores watermark rotation as data attribute", () => {
    const html = renderToStaticMarkup(
      <Page watermark={{ text: "DRAFT", rotation: -30 }}>
        <div>Content</div>
      </Page>
    );
    expect(html).toContain('data-pdfn-watermark-text="DRAFT"');
    expect(html).toContain('data-pdfn-watermark-rotation="-30"');
  });

  it("renders watermark with text prop only", () => {
    const html = renderToStaticMarkup(
      <Page watermark={{ text: "Custom Watermark" }}>
        <div>Content</div>
      </Page>
    );
    expect(html).toContain('data-pdfn-watermark-text="Custom Watermark"');
  });

  it("includes page size and margin data attributes", () => {
    const html = renderToStaticMarkup(
      <Page size="A4" margin="1in">
        <div>Content</div>
      </Page>
    );
    expect(html).toContain('data-pdfn-size="A4"');
    expect(html).toContain('data-pdfn-margin="1in"');
  });

  it("includes custom margin in data attribute", () => {
    const html = renderToStaticMarkup(
      <Page size="Letter" margin={{ top: "0.5in", right: "1in", bottom: "0.5in", left: "1in" }}>
        <div>Content</div>
      </Page>
    );
    expect(html).toContain('data-pdfn-size="Letter"');
    expect(html).toContain('data-pdfn-margin="0.5in 1in 0.5in 1in"');
  });
});
