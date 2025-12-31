import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TableHeader } from "../../src/components/TableHeader";

describe("TableHeader", () => {
  it("renders children within thead element", () => {
    const html = renderToStaticMarkup(
      <table>
        <TableHeader>
          <tr>
            <th>Item</th>
            <th>Price</th>
          </tr>
        </TableHeader>
      </table>
    );
    expect(html).toContain("<thead");
    expect(html).toContain("Item");
    expect(html).toContain("Price");
  });

  it("renders with correct attributes and styles for print", () => {
    const html = renderToStaticMarkup(
      <table>
        <TableHeader>
          <tr>
            <th>Column</th>
          </tr>
        </TableHeader>
      </table>
    );
    expect(html).toContain("data-pdfx-table-header");
    expect(html).toContain("display:table-header-group");
  });

  it("applies custom className", () => {
    const html = renderToStaticMarkup(
      <table>
        <TableHeader className="header-row">
          <tr>
            <th>Column</th>
          </tr>
        </TableHeader>
      </table>
    );
    expect(html).toContain('class="header-row"');
  });
});
