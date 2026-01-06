import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Tr } from "../../src/components/Tr";

describe("Tr", () => {
  it("renders children within tr element", () => {
    const html = renderToStaticMarkup(
      <table>
        <tbody>
          <Tr>
            <td>Cell 1</td>
            <td>Cell 2</td>
          </Tr>
        </tbody>
      </table>
    );
    expect(html).toContain("<tr");
    expect(html).toContain("Cell 1");
    expect(html).toContain("Cell 2");
  });

  it("renders without keep styles by default", () => {
    const html = renderToStaticMarkup(
      <table>
        <tbody>
          <Tr>
            <td>Cell</td>
          </Tr>
        </tbody>
      </table>
    );
    expect(html).toContain("data-pdfn-tr");
    expect(html).not.toContain("break-inside");
    expect(html).not.toContain("data-keep");
  });

  it("renders with keep styles when keep prop is true", () => {
    const html = renderToStaticMarkup(
      <table>
        <tbody>
          <Tr keep>
            <td>Cell</td>
          </Tr>
        </tbody>
      </table>
    );
    expect(html).toContain("data-pdfn-tr");
    expect(html).toContain("break-inside:avoid");
    expect(html).toContain('data-keep="true"');
  });

  it("applies custom className", () => {
    const html = renderToStaticMarkup(
      <table>
        <tbody>
          <Tr className="data-row">
            <td>Cell</td>
          </Tr>
        </tbody>
      </table>
    );
    expect(html).toContain('class="data-row"');
  });

  it("merges custom styles with keep styles", () => {
    const html = renderToStaticMarkup(
      <table>
        <tbody>
          <Tr keep style={{ backgroundColor: "red" }}>
            <td>Cell</td>
          </Tr>
        </tbody>
      </table>
    );
    expect(html).toContain("break-inside:avoid");
    expect(html).toContain("background-color:red");
  });

  it("applies custom styles without keep", () => {
    const html = renderToStaticMarkup(
      <table>
        <tbody>
          <Tr style={{ backgroundColor: "blue" }}>
            <td>Cell</td>
          </Tr>
        </tbody>
      </table>
    );
    expect(html).toContain("background-color:blue");
    expect(html).not.toContain("break-inside");
  });

  it("passes through additional HTML attributes", () => {
    const html = renderToStaticMarkup(
      <table>
        <tbody>
          <Tr id="row-1" data-testid="tr">
            <td>Cell</td>
          </Tr>
        </tbody>
      </table>
    );
    expect(html).toContain('id="row-1"');
    expect(html).toContain('data-testid="tr"');
  });
});
