import React from "react";
import { describe, it, expect } from "vitest";
import { findClientComponents, hasClientComponents } from "../src/detect.js";

// Helper to create a marked client component
function createMarkedClientComponent(source: string) {
  function MarkedComponent({ children }: { children?: React.ReactNode }) {
    return <div>{children}</div>;
  }
  // Add pdfn markers
  (MarkedComponent as any).__pdfn_client = true;
  (MarkedComponent as any).__pdfn_source = source;
  return MarkedComponent;
}

// Helper to create a marked template component
function createMarkedTemplateComponent(source: string) {
  function TemplateComponent({ children }: { children?: React.ReactNode }) {
    return <div>{children}</div>;
  }
  // Add pdfn template marker
  (TemplateComponent as any).__pdfn_template_source = source;
  return TemplateComponent;
}

// Regular component without markers
function RegularComponent({ children }: { children?: React.ReactNode }) {
  return <div>{children}</div>;
}

describe("findClientComponents", () => {
  describe("basic detection", () => {
    it("returns empty results for regular components", () => {
      const result = findClientComponents(<RegularComponent />);
      expect(result.hasClient).toBe(false);
      expect(result.sources).toEqual([]);
      expect(result.templateSource).toBeUndefined();
    });

    it("detects a single marked client component", () => {
      const ClientChart = createMarkedClientComponent("/path/to/Chart.tsx");
      const result = findClientComponents(<ClientChart />);
      expect(result.hasClient).toBe(true);
      expect(result.sources).toEqual(["/path/to/Chart.tsx"]);
    });

    it("detects marked template component", () => {
      const Template = createMarkedTemplateComponent("/path/to/Invoice.tsx");
      const result = findClientComponents(<Template />);
      expect(result.templateSource).toBe("/path/to/Invoice.tsx");
    });
  });

  describe("nested components", () => {
    it("finds client component nested in regular component", () => {
      const ClientChart = createMarkedClientComponent("/path/to/Chart.tsx");
      const result = findClientComponents(
        <RegularComponent>
          <ClientChart />
        </RegularComponent>
      );
      expect(result.hasClient).toBe(true);
      expect(result.sources).toContain("/path/to/Chart.tsx");
    });

    it("finds deeply nested client components", () => {
      const ClientChart = createMarkedClientComponent("/path/to/Chart.tsx");
      const result = findClientComponents(
        <RegularComponent>
          <div>
            <section>
              <ClientChart />
            </section>
          </div>
        </RegularComponent>
      );
      expect(result.hasClient).toBe(true);
      expect(result.sources).toContain("/path/to/Chart.tsx");
    });

    it("finds multiple client components", () => {
      const Chart1 = createMarkedClientComponent("/path/to/Chart1.tsx");
      const Chart2 = createMarkedClientComponent("/path/to/Chart2.tsx");
      const result = findClientComponents(
        <RegularComponent>
          <Chart1 />
          <Chart2 />
        </RegularComponent>
      );
      expect(result.hasClient).toBe(true);
      expect(result.sources).toContain("/path/to/Chart1.tsx");
      expect(result.sources).toContain("/path/to/Chart2.tsx");
      expect(result.sources.length).toBe(2);
    });

    it("deduplicates same component used multiple times", () => {
      const Chart = createMarkedClientComponent("/path/to/Chart.tsx");
      const result = findClientComponents(
        <RegularComponent>
          <Chart />
          <Chart />
          <div>
            <Chart />
          </div>
        </RegularComponent>
      );
      expect(result.hasClient).toBe(true);
      expect(result.sources).toEqual(["/path/to/Chart.tsx"]);
    });
  });

  describe("template with client components", () => {
    it("detects both template and nested client components", () => {
      const Template = createMarkedTemplateComponent("/path/to/Report.tsx");
      const Chart = createMarkedClientComponent("/path/to/Chart.tsx");

      const result = findClientComponents(
        <Template>
          <Chart />
        </Template>
      );
      expect(result.templateSource).toBe("/path/to/Report.tsx");
      expect(result.hasClient).toBe(true);
      expect(result.sources).toContain("/path/to/Chart.tsx");
    });
  });

  describe("edge cases", () => {
    it("handles text children", () => {
      const result = findClientComponents(
        <RegularComponent>
          Just some text
        </RegularComponent>
      );
      expect(result.hasClient).toBe(false);
    });

    it("handles null children", () => {
      const result = findClientComponents(
        <RegularComponent>
          {null}
        </RegularComponent>
      );
      expect(result.hasClient).toBe(false);
    });

    it("handles array children", () => {
      const Chart = createMarkedClientComponent("/path/to/Chart.tsx");
      const result = findClientComponents(
        <RegularComponent>
          {[1, 2, 3].map((i) => (
            <Chart key={i} />
          ))}
        </RegularComponent>
      );
      expect(result.hasClient).toBe(true);
      expect(result.sources).toEqual(["/path/to/Chart.tsx"]);
    });

    it("handles mixed children types", () => {
      const Chart = createMarkedClientComponent("/path/to/Chart.tsx");
      const result = findClientComponents(
        <RegularComponent>
          Some text
          <div>A div</div>
          {null}
          <Chart />
          {undefined}
          More text
        </RegularComponent>
      );
      expect(result.hasClient).toBe(true);
      expect(result.sources).toContain("/path/to/Chart.tsx");
    });
  });
});

describe("hasClientComponents", () => {
  it("returns false for regular components", () => {
    expect(hasClientComponents(<RegularComponent />)).toBe(false);
  });

  it("returns true for marked client component", () => {
    const Chart = createMarkedClientComponent("/path/to/Chart.tsx");
    expect(hasClientComponents(<Chart />)).toBe(true);
  });

  it("returns true for nested client component", () => {
    const Chart = createMarkedClientComponent("/path/to/Chart.tsx");
    expect(
      hasClientComponents(
        <RegularComponent>
          <div>
            <Chart />
          </div>
        </RegularComponent>
      )
    ).toBe(true);
  });

  it("returns false for template without client components", () => {
    const Template = createMarkedTemplateComponent("/path/to/Invoice.tsx");
    expect(hasClientComponents(<Template><div>Content</div></Template>)).toBe(false);
  });

  it("early exits on first client component found", () => {
    const Chart1 = createMarkedClientComponent("/path/to/Chart1.tsx");
    const Chart2 = createMarkedClientComponent("/path/to/Chart2.tsx");
    // This tests efficiency - should return true after finding first
    expect(
      hasClientComponents(
        <RegularComponent>
          <Chart1 />
          <Chart2 />
        </RegularComponent>
      )
    ).toBe(true);
  });

  it("handles deeply nested structures efficiently", () => {
    const Chart = createMarkedClientComponent("/path/to/Chart.tsx");
    // Build a deep structure
    let element: React.ReactElement = <Chart />;
    for (let i = 0; i < 10; i++) {
      element = <div>{element}</div>;
    }
    expect(hasClientComponents(element)).toBe(true);
  });
});
