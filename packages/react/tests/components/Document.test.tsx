import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Document } from "../../src/components/Document";
import { Page } from "../../src/components/Page";

describe("Document", () => {
  it("renders children", () => {
    const html = renderToStaticMarkup(
      <Document>
        <Page>
          <div>Hello</div>
        </Page>
      </Document>
    );
    expect(html).toContain("Hello");
  });

  it("includes metadata as data attributes", () => {
    const html = renderToStaticMarkup(
      <Document title="Test" author="Author" language="en">
        <Page>
          <div>Content</div>
        </Page>
      </Document>
    );
    expect(html).toContain('data-title="Test"');
    expect(html).toContain('data-author="Author"');
    expect(html).toContain('data-language="en"');
  });

  it("renders without metadata", () => {
    const html = renderToStaticMarkup(
      <Document>
        <Page>
          <div>Content</div>
        </Page>
      </Document>
    );
    expect(html).toContain("data-pdfn-document");
  });

  it("sets default language to en", () => {
    const html = renderToStaticMarkup(
      <Document>
        <Page>
          <div>Content</div>
        </Page>
      </Document>
    );
    expect(html).toContain('data-language="en"');
  });

  it("includes keywords as comma-separated string", () => {
    const html = renderToStaticMarkup(
      <Document keywords={["invoice", "pdf", "react"]}>
        <Page>
          <div>Content</div>
        </Page>
      </Document>
    );
    expect(html).toContain('data-keywords="invoice,pdf,react"');
  });

  describe("fonts prop", () => {
    it("serializes string font names to data-fonts attribute", () => {
      const html = renderToStaticMarkup(
        <Document fonts={["Inter", "Roboto Mono"]}>
          <Page>
            <div>Content</div>
          </Page>
        </Document>
      );
      expect(html).toContain("data-fonts=");
      // Should contain normalized FontConfig objects
      expect(html).toContain("Inter");
      expect(html).toContain("Roboto Mono");
    });

    it("serializes FontConfig objects to data-fonts attribute", () => {
      const html = renderToStaticMarkup(
        <Document
          fonts={[
            { family: "Inter", weights: [400, 500, 700] },
            { family: "Fira Code", weights: [400, 600], style: "normal" },
          ]}
        >
          <Page>
            <div>Content</div>
          </Page>
        </Document>
      );
      expect(html).toContain("data-fonts=");
      expect(html).toContain("Inter");
      expect(html).toContain("Fira Code");
    });

    it("does not include data-fonts when fonts not provided", () => {
      const html = renderToStaticMarkup(
        <Document>
          <Page>
            <div>Content</div>
          </Page>
        </Document>
      );
      // data-fonts should not be present (undefined values are not rendered)
      expect(html).not.toContain("data-fonts=");
    });

    it("handles empty fonts array", () => {
      const html = renderToStaticMarkup(
        <Document fonts={[]}>
          <Page>
            <div>Content</div>
          </Page>
        </Document>
      );
      expect(html).not.toContain("data-fonts=");
    });

    it("handles mixed string and FontConfig fonts", () => {
      const html = renderToStaticMarkup(
        <Document
          fonts={[
            "Inter",
            { family: "Roboto Mono", weights: [400, 700] },
          ]}
        >
          <Page>
            <div>Content</div>
          </Page>
        </Document>
      );
      expect(html).toContain("data-fonts=");
      expect(html).toContain("Inter");
      expect(html).toContain("Roboto Mono");
    });
  });
});
