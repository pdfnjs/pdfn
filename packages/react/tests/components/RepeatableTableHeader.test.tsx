import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { RepeatableTableHeader } from "../../src/components/RepeatableTableHeader";

describe("RepeatableTableHeader", () => {
  it("renders children within thead element", () => {
    const html = renderToStaticMarkup(
      <table>
        <RepeatableTableHeader>
          <tr>
            <th>Item</th>
            <th>Price</th>
          </tr>
        </RepeatableTableHeader>
      </table>
    );
    expect(html).toContain("<thead");
    expect(html).toContain("Item");
    expect(html).toContain("Price");
  });

  it("renders with correct attributes and styles for print", () => {
    const html = renderToStaticMarkup(
      <table>
        <RepeatableTableHeader>
          <tr>
            <th>Column</th>
          </tr>
        </RepeatableTableHeader>
      </table>
    );
    expect(html).toContain("data-pdfx-repeatable-header");
    expect(html).toContain("display:table-header-group");
  });

  it("applies custom className", () => {
    const html = renderToStaticMarkup(
      <table>
        <RepeatableTableHeader className="header-row">
          <tr>
            <th>Column</th>
          </tr>
        </RepeatableTableHeader>
      </table>
    );
    expect(html).toContain('class="header-row"');
  });
});
