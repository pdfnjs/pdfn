import { describe, it, expect } from "vitest";
import { getComponentName } from "../src/bundle.js";

describe("getComponentName", () => {
  describe("simple file names", () => {
    it("extracts component name from simple filename", () => {
      expect(getComponentName("/path/to/Chart.tsx")).toBe("Chart");
    });

    it("handles .ts extension", () => {
      expect(getComponentName("/path/to/Component.ts")).toBe("Component");
    });

    it("handles .js extension", () => {
      expect(getComponentName("/path/to/Widget.js")).toBe("Widget");
    });

    it("handles .jsx extension", () => {
      expect(getComponentName("/path/to/Button.jsx")).toBe("Button");
    });

    it("handles relative paths", () => {
      expect(getComponentName("./components/Header.tsx")).toBe("Header");
    });

    it("handles just filename", () => {
      expect(getComponentName("Footer.tsx")).toBe("Footer");
    });
  });

  describe("kebab-case conversion", () => {
    it("converts kebab-case to PascalCase", () => {
      expect(getComponentName("/path/to/my-component.tsx")).toBe("MyComponent");
    });

    it("handles multiple hyphens", () => {
      expect(getComponentName("/path/to/my-awesome-chart.tsx")).toBe("MyAwesomeChart");
    });

    it("handles single character parts", () => {
      expect(getComponentName("/path/to/a-b-c.tsx")).toBe("ABC");
    });
  });

  describe("snake_case conversion", () => {
    it("converts snake_case to PascalCase", () => {
      expect(getComponentName("/path/to/my_component.tsx")).toBe("MyComponent");
    });

    it("handles multiple underscores", () => {
      expect(getComponentName("/path/to/my_awesome_chart.tsx")).toBe("MyAwesomeChart");
    });
  });

  describe("mixed case handling", () => {
    it("preserves existing PascalCase", () => {
      expect(getComponentName("/path/to/MyChart.tsx")).toBe("MyChart");
    });

    it("handles mixed separators", () => {
      // kebab and snake combined - splits on both
      expect(getComponentName("/path/to/my-cool_widget.tsx")).toBe("MyCoolWidget");
    });
  });

  describe("edge cases", () => {
    it("handles dot-file without basename", () => {
      // basename('.tsx', '.tsx') returns '.tsx' (dot files are preserved)
      expect(getComponentName(".tsx")).toBe(".tsx");
    });

    it("handles file starting with lowercase", () => {
      expect(getComponentName("/path/to/chart.tsx")).toBe("Chart");
    });

    it("handles numbers in filename", () => {
      expect(getComponentName("/path/to/chart2.tsx")).toBe("Chart2");
    });

    it("handles numbered components", () => {
      expect(getComponentName("/path/to/chart-v2.tsx")).toBe("ChartV2");
    });
  });
});
