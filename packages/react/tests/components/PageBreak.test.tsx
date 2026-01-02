import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PageBreak } from "../../src/components/PageBreak";

describe("PageBreak", () => {
  it("renders with correct attributes and print styles", () => {
    const html = renderToStaticMarkup(<PageBreak />);

    // Data attribute for styling/selection
    expect(html).toContain("data-pdfn-page-break");

    // Modern CSS for page breaks
    expect(html).toContain("break-after:page");

    // Legacy CSS for older browsers
    expect(html).toContain("page-break-after:always");

    // Should be invisible (zero height)
    expect(html).toContain("height:0");

    // Accessibility - hidden from screen readers
    expect(html).toContain('aria-hidden="true"');
  });
});
