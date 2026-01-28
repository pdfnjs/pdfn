import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NoBreak } from "../../src/components/NoBreak";

describe("NoBreak", () => {
  it("renders children with correct attributes and print styles", () => {
    const html = renderToStaticMarkup(
      <NoBreak>
        <p>Keep together</p>
      </NoBreak>
    );

    // Children are rendered
    expect(html).toContain("Keep together");

    // Data attribute for styling/selection
    expect(html).toContain("data-pdfn-avoid-break");

    // Modern CSS for avoiding breaks
    expect(html).toContain("break-inside:avoid");

    // Legacy CSS for older browsers
    expect(html).toContain("page-break-inside:avoid");
  });

  it("applies custom className", () => {
    const html = renderToStaticMarkup(
      <NoBreak className="custom-class">
        <p>Content</p>
      </NoBreak>
    );
    expect(html).toContain('class="custom-class"');
  });
});
