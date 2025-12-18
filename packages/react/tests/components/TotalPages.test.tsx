import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TotalPages } from "../../src/components/TotalPages";

describe("TotalPages", () => {
  it("renders with data-pdfx-total-pages attribute", () => {
    const html = renderToStaticMarkup(<TotalPages />);
    expect(html).toContain("data-pdfx-total-pages");
    expect(html).toContain("<span");
  });

  it("applies custom className", () => {
    const html = renderToStaticMarkup(<TotalPages className="total-pages" />);
    expect(html).toContain('class="total-pages"');
  });
});
