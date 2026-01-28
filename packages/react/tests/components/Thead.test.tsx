import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Thead } from "../../src/components/Thead";

describe("Thead", () => {
  it("renders children within thead element", () => {
    const html = renderToStaticMarkup(
      <table>
        <Thead>
          <tr>
            <th>Item</th>
            <th>Price</th>
          </tr>
        </Thead>
      </table>
    );
    expect(html).toContain("<thead");
    expect(html).toContain("Item");
    expect(html).toContain("Price");
  });

  it("repeats by default", () => {
    const html = renderToStaticMarkup(
      <table>
        <Thead>
          <tr>
            <th>Column</th>
          </tr>
        </Thead>
      </table>
    );
    expect(html).toContain("data-pdfn-thead");
    expect(html).toContain("display:table-header-group");
    expect(html).toContain('data-repeat="true"');
  });

  it("does not repeat when repeat={false}", () => {
    const html = renderToStaticMarkup(
      <table>
        <Thead repeat={false}>
          <tr>
            <th>Column</th>
          </tr>
        </Thead>
      </table>
    );
    expect(html).toContain("data-pdfn-thead");
    expect(html).not.toContain("display:table-header-group");
    expect(html).not.toContain("data-repeat");
  });

  it("applies custom className", () => {
    const html = renderToStaticMarkup(
      <table>
        <Thead className="header-row">
          <tr>
            <th>Column</th>
          </tr>
        </Thead>
      </table>
    );
    expect(html).toContain('class="header-row"');
  });

  it("passes through additional HTML attributes", () => {
    const html = renderToStaticMarkup(
      <table>
        <Thead id="main-header" data-testid="thead">
          <tr>
            <th>Column</th>
          </tr>
        </Thead>
      </table>
    );
    expect(html).toContain('id="main-header"');
    expect(html).toContain('data-testid="thead"');
  });
});
