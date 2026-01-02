import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PageNumber } from "../../src/components/PageNumber";

describe("PageNumber", () => {
  it("renders with data-pdfn-page-number attribute", () => {
    const html = renderToStaticMarkup(<PageNumber />);
    expect(html).toContain("data-pdfn-page-number");
    expect(html).toContain("<span");
  });

  it("applies custom className", () => {
    const html = renderToStaticMarkup(<PageNumber className="page-num" />);
    expect(html).toContain('class="page-num"');
  });
});
