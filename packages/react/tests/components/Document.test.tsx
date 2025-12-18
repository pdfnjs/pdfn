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
    expect(html).toContain("data-pdfx-document");
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
});
