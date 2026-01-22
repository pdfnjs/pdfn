import { describe, it, expect } from "vitest";
import { pdfn } from "../src/index.js";
import type { Plugin } from "vite";

describe("pdfn plugin factory", () => {
  describe("basic functionality", () => {
    it("returns an array of plugins", () => {
      const plugins = pdfn();
      expect(Array.isArray(plugins)).toBe(true);
    });

    it("returns 3 plugins by default", () => {
      const plugins = pdfn();
      expect(plugins.length).toBe(3);
    });

    it("plugins have correct names", () => {
      const plugins = pdfn();
      const names = plugins.map((p) => p.name);
      expect(names).toContain("pdfn-tailwind");
      expect(names).toContain("pdfn-client-marker");
      expect(names).toContain("pdfn-template-marker");
    });

    it("all returned items are valid Vite plugins", () => {
      const plugins = pdfn();
      for (const plugin of plugins) {
        expect(plugin).toHaveProperty("name");
        expect(typeof plugin.name).toBe("string");
      }
    });
  });

  describe("options handling", () => {
    it("accepts empty options", () => {
      const plugins = pdfn({});
      expect(plugins.length).toBe(3);
    });

    it("accepts debug option", () => {
      const plugins = pdfn({ debug: true });
      expect(plugins.length).toBe(3);
    });

    it("disables tailwind plugin when tailwind: false", () => {
      const plugins = pdfn({ tailwind: false });
      expect(plugins.length).toBe(2);
      const names = plugins.map((p) => p.name);
      expect(names).not.toContain("pdfn-tailwind");
      expect(names).toContain("pdfn-client-marker");
      expect(names).toContain("pdfn-template-marker");
    });

    it("includes tailwind plugin when tailwind: true", () => {
      const plugins = pdfn({ tailwind: true });
      const names = plugins.map((p) => p.name);
      expect(names).toContain("pdfn-tailwind");
    });

    it("includes tailwind plugin by default (tailwind not specified)", () => {
      const plugins = pdfn();
      const names = plugins.map((p) => p.name);
      expect(names).toContain("pdfn-tailwind");
    });
  });

  describe("plugin structure", () => {
    it("pdfn-tailwind plugin has resolveId hook", () => {
      const plugins = pdfn();
      const tailwindPlugin = plugins.find((p) => p.name === "pdfn-tailwind");
      expect(tailwindPlugin).toBeDefined();
      expect(tailwindPlugin).toHaveProperty("resolveId");
    });

    it("pdfn-tailwind plugin has load hook", () => {
      const plugins = pdfn();
      const tailwindPlugin = plugins.find((p) => p.name === "pdfn-tailwind");
      expect(tailwindPlugin).toHaveProperty("load");
    });

    it("pdfn-tailwind plugin has transform hook", () => {
      const plugins = pdfn();
      const tailwindPlugin = plugins.find((p) => p.name === "pdfn-tailwind");
      expect(tailwindPlugin).toHaveProperty("transform");
    });

    it("pdfn-client-marker plugin has transform hook", () => {
      const plugins = pdfn();
      const clientPlugin = plugins.find((p) => p.name === "pdfn-client-marker");
      expect(clientPlugin).toBeDefined();
      expect(clientPlugin).toHaveProperty("transform");
    });

    it("pdfn-template-marker plugin has transform hook", () => {
      const plugins = pdfn();
      const templatePlugin = plugins.find((p) => p.name === "pdfn-template-marker");
      expect(templatePlugin).toBeDefined();
      expect(templatePlugin).toHaveProperty("transform");
    });
  });
});

describe("pdfn-tailwind plugin", () => {
  function getTailwindPlugin(): Plugin {
    const plugins = pdfn();
    return plugins.find((p) => p.name === "pdfn-tailwind")!;
  }

  describe("resolveId", () => {
    it("resolves virtual module ID", () => {
      const plugin = getTailwindPlugin();
      const resolveId = plugin.resolveId as Function;
      const result = resolveId("virtual:pdfn-tailwind-css");
      expect(result).toBe("\0virtual:pdfn-tailwind-css");
    });

    it("returns undefined for non-virtual IDs", () => {
      const plugin = getTailwindPlugin();
      const resolveId = plugin.resolveId as Function;
      const result = resolveId("./some-file.ts");
      expect(result).toBeUndefined();
    });

    it("returns undefined for null", () => {
      const plugin = getTailwindPlugin();
      const resolveId = plugin.resolveId as Function;
      const result = resolveId("some-other-module");
      expect(result).toBeUndefined();
    });
  });

  describe("transform", () => {
    it("returns null for node_modules files", () => {
      const plugin = getTailwindPlugin();
      const transform = plugin.transform as Function;
      const code = `import { Tailwind } from '@pdfn/tailwind';\n<Tailwind>`;
      const result = transform(code, "/node_modules/@pdfn/tailwind/index.js");
      expect(result).toBeNull();
    });

    it("returns null for files without @pdfn/tailwind", () => {
      const plugin = getTailwindPlugin();
      const transform = plugin.transform as Function;
      const code = `import React from 'react';\nexport default function App() {}`;
      const result = transform(code, "/src/App.tsx");
      expect(result).toBeNull();
    });

    it("returns null for files without <Tailwind", () => {
      const plugin = getTailwindPlugin();
      const transform = plugin.transform as Function;
      const code = `import { Tailwind } from '@pdfn/tailwind';\nexport const T = Tailwind;`;
      const result = transform(code, "/src/App.tsx");
      expect(result).toBeNull();
    });

    it("returns null if virtual module already imported", () => {
      const plugin = getTailwindPlugin();
      const transform = plugin.transform as Function;
      const code = `import { css } from "virtual:pdfn-tailwind-css";\nimport { Tailwind } from '@pdfn/tailwind';\n<Tailwind>`;
      const result = transform(code, "/src/App.tsx");
      expect(result).toBeNull();
    });

    it("transforms <Tailwind> to inject CSS prop", () => {
      const plugin = getTailwindPlugin();
      const transform = plugin.transform as Function;
      const code = `import { Tailwind } from '@pdfn/tailwind';
export default function App() {
  return <Tailwind><div>Hello</div></Tailwind>;
}`;
      const result = transform(code, "/src/App.tsx");
      expect(result).not.toBeNull();
      expect(result.code).toContain('import { css as __pdfnPrecompiledCss__ } from "virtual:pdfn-tailwind-css"');
      expect(result.code).toContain("<Tailwind css={__pdfnPrecompiledCss__}>");
    });

    it("transforms <Tailwind > (with whitespace) to inject CSS prop", () => {
      const plugin = getTailwindPlugin();
      const transform = plugin.transform as Function;
      const code = `import { Tailwind } from '@pdfn/tailwind';
export default function App() {
  return <Tailwind ><div>Hello</div></Tailwind>;
}`;
      const result = transform(code, "/src/App.tsx");
      expect(result).not.toBeNull();
      expect(result.code).toContain("css={__pdfnPrecompiledCss__}");
    });
  });
});

describe("pdfn-client-marker plugin", () => {
  function getClientPlugin(): Plugin {
    const plugins = pdfn();
    return plugins.find((p) => p.name === "pdfn-client-marker")!;
  }

  describe("transform", () => {
    it("returns null for node_modules files", () => {
      const plugin = getClientPlugin();
      const transform = plugin.transform as Function;
      const code = `"use client";\nexport function Chart() {}`;
      const result = transform(code, "/node_modules/some-lib/index.js");
      expect(result).toBeNull();
    });

    it("returns null for non-JS/TS files", () => {
      const plugin = getClientPlugin();
      const transform = plugin.transform as Function;
      const code = `.button { color: red; }`;
      const result = transform(code, "/src/styles.css");
      expect(result).toBeNull();
    });

    it("returns null for files without use client directive", () => {
      const plugin = getClientPlugin();
      const transform = plugin.transform as Function;
      const code = `export function Component() { return <div>Hello</div>; }`;
      const result = transform(code, "/src/Component.tsx");
      expect(result).toBeNull();
    });

    it("marks exports in use client files", () => {
      const plugin = getClientPlugin();
      const transform = plugin.transform as Function;
      const code = `"use client";
export function Chart() {
  return <div>Chart</div>;
}`;
      const result = transform(code, "/src/components/Chart.tsx");
      expect(result).not.toBeNull();
      expect(result.code).toContain("Chart.__pdfn_client = true");
      expect(result.code).toContain("Chart.__pdfn_source =");
    });

    it("marks multiple exports", () => {
      const plugin = getClientPlugin();
      const transform = plugin.transform as Function;
      const code = `"use client";
export function Chart1() {}
export function Chart2() {}
export const Chart3 = () => {};`;
      const result = transform(code, "/src/components/Charts.tsx");
      expect(result).not.toBeNull();
      expect(result.code).toContain("Chart1.__pdfn_client = true");
      expect(result.code).toContain("Chart2.__pdfn_client = true");
      expect(result.code).toContain("Chart3.__pdfn_client = true");
    });

    it("handles single-quoted use client directive", () => {
      const plugin = getClientPlugin();
      const transform = plugin.transform as Function;
      const code = `'use client';
export function Widget() {}`;
      const result = transform(code, "/src/Widget.tsx");
      expect(result).not.toBeNull();
      expect(result.code).toContain("Widget.__pdfn_client = true");
    });

    it("returns null when no exports found", () => {
      const plugin = getClientPlugin();
      const transform = plugin.transform as Function;
      const code = `"use client";
// Just a comment, no exports`;
      const result = transform(code, "/src/Empty.tsx");
      expect(result).toBeNull();
    });
  });
});

describe("pdfn-template-marker plugin", () => {
  function getTemplatePlugin(): Plugin {
    const plugins = pdfn();
    return plugins.find((p) => p.name === "pdfn-template-marker")!;
  }

  describe("transform", () => {
    it("returns null for node_modules files", () => {
      const plugin = getTemplatePlugin();
      const transform = plugin.transform as Function;
      const code = `export default function Template() {}`;
      const result = transform(code, "/node_modules/some-lib/template.tsx");
      expect(result).toBeNull();
    });

    it("returns null for non-tsx files", () => {
      const plugin = getTemplatePlugin();
      const transform = plugin.transform as Function;
      const code = `export default function Template() {}`;
      const result = transform(code, "/src/template.ts");
      expect(result).toBeNull();
    });

    it("returns null for files not in pdfn-templates directory", () => {
      const plugin = getTemplatePlugin();
      const transform = plugin.transform as Function;
      const code = `export default function Template() {}`;
      const result = transform(code, "/src/components/Template.tsx");
      expect(result).toBeNull();
    });

    it("returns null for files in subdirectories of pdfn-templates", () => {
      const plugin = getTemplatePlugin();
      const transform = plugin.transform as Function;
      const code = `export default function Component() {}`;
      const result = transform(code, "/app/pdfn-templates/components/Button.tsx");
      expect(result).toBeNull();
    });

    it("returns null for files without default export", () => {
      const plugin = getTemplatePlugin();
      const transform = plugin.transform as Function;
      const code = `export function Invoice() { return <div>Invoice</div>; }`;
      const result = transform(code, "/app/pdfn-templates/invoice.tsx");
      expect(result).toBeNull();
    });

    it("marks template files with named default export", () => {
      const plugin = getTemplatePlugin();
      const transform = plugin.transform as Function;
      const code = `export default function Invoice() { return <div>Invoice</div>; }`;
      const result = transform(code, "/app/pdfn-templates/invoice.tsx");
      expect(result).not.toBeNull();
      expect(result.code).toContain("Invoice.__pdfn_template_source =");
      expect(result.code).toContain("/app/pdfn-templates/invoice.tsx");
    });

    it("marks template files with named default class export", () => {
      const plugin = getTemplatePlugin();
      const transform = plugin.transform as Function;
      const code = `export default class Report extends React.Component { render() { return <div>Report</div>; } }`;
      const result = transform(code, "/app/pdfn-templates/report.tsx");
      expect(result).not.toBeNull();
      expect(result.code).toContain("Report.__pdfn_template_source =");
    });

    it("handles Windows-style paths", () => {
      const plugin = getTemplatePlugin();
      const transform = plugin.transform as Function;
      const code = `export default function Contract() { return <div>Contract</div>; }`;
      // Note: Vite normalizes paths to forward slashes even on Windows
      const result = transform(code, "C:/projects/app/pdfn-templates/contract.tsx");
      expect(result).not.toBeNull();
      expect(result.code).toContain("Contract.__pdfn_template_source =");
    });
  });
});

