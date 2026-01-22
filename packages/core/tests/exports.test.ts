import { describe, it, expect } from "vitest";
import {
  parseExportsFromCode,
  hasDefaultExport,
  getDefaultExportName,
  hasUseClientDirective,
} from "../src/utils/exports.js";

describe("parseExportsFromCode", () => {
  it("parses function exports", () => {
    const code = `
      export function MyComponent() {}
      export function AnotherComponent() {}
    `;
    const exports = parseExportsFromCode(code);
    expect(exports).toContain("MyComponent");
    expect(exports).toContain("AnotherComponent");
  });

  it("parses const exports", () => {
    const code = `
      export const MyConst = 42;
      export const MyFunc = () => {};
    `;
    const exports = parseExportsFromCode(code);
    expect(exports).toContain("MyConst");
    expect(exports).toContain("MyFunc");
  });

  it("parses let exports", () => {
    const code = `export let myVar = "hello";`;
    const exports = parseExportsFromCode(code);
    expect(exports).toContain("myVar");
  });

  it("parses var exports", () => {
    const code = `export var oldStyleVar = 123;`;
    const exports = parseExportsFromCode(code);
    expect(exports).toContain("oldStyleVar");
  });

  it("parses class exports", () => {
    const code = `export class MyClass {}`;
    const exports = parseExportsFromCode(code);
    expect(exports).toContain("MyClass");
  });

  it("parses named exports", () => {
    const code = `
      const foo = 1;
      const bar = 2;
      export { foo, bar };
    `;
    const exports = parseExportsFromCode(code);
    expect(exports).toContain("foo");
    expect(exports).toContain("bar");
  });

  it("parses aliased exports (uses exported name)", () => {
    const code = `
      const internalName = 1;
      export { internalName as publicName };
    `;
    const exports = parseExportsFromCode(code);
    expect(exports).toContain("publicName");
    expect(exports).not.toContain("internalName");
  });

  it("parses multiple aliased exports", () => {
    const code = `
      const a = 1;
      const b = 2;
      export { a as alpha, b as beta };
    `;
    const exports = parseExportsFromCode(code);
    expect(exports).toContain("alpha");
    expect(exports).toContain("beta");
    expect(exports).not.toContain("a");
    expect(exports).not.toContain("b");
  });

  it("handles mixed exports", () => {
    const code = `
      export function funcExport() {}
      export const constExport = 1;
      export class ClassExport {}
      const named1 = 1;
      const named2 = 2;
      export { named1, named2 };
    `;
    const exports = parseExportsFromCode(code);
    expect(exports).toContain("funcExport");
    expect(exports).toContain("constExport");
    expect(exports).toContain("ClassExport");
    expect(exports).toContain("named1");
    expect(exports).toContain("named2");
  });

  it("removes duplicate exports", () => {
    const code = `
      export function MyComponent() {}
      export { MyComponent };
    `;
    const exports = parseExportsFromCode(code);
    expect(exports.filter((e) => e === "MyComponent").length).toBe(1);
  });

  it("ignores default exports", () => {
    const code = `
      export default function DefaultComponent() {}
      export function NamedComponent() {}
    `;
    const exports = parseExportsFromCode(code);
    expect(exports).toContain("NamedComponent");
    expect(exports).not.toContain("DefaultComponent");
    expect(exports).not.toContain("default");
  });

  it("returns empty array for code without exports", () => {
    const code = `
      function privateFunc() {}
      const privateConst = 1;
    `;
    const exports = parseExportsFromCode(code);
    expect(exports).toEqual([]);
  });

  it("handles TypeScript type exports (partial support)", () => {
    const code = `
      export type MyType = string;
      export interface MyInterface {}
      export const realExport = 1;
    `;
    const exports = parseExportsFromCode(code);
    // Type exports may or may not be matched depending on regex
    // The important thing is real exports are captured
    expect(exports).toContain("realExport");
  });

  it("does not match async function exports (current limitation)", () => {
    // The current regex `/export\s+function\s+/` doesn't match `export async function`
    // This is a known limitation - async functions between export and function break the pattern
    const code = `export async function fetchData() {}`;
    const exports = parseExportsFromCode(code);
    expect(exports).toEqual([]);
  });

  it("handles arrow function const exports", () => {
    const code = `export const MyArrowFunc = () => <div>Hello</div>;`;
    const exports = parseExportsFromCode(code);
    expect(exports).toContain("MyArrowFunc");
  });
});

describe("hasDefaultExport", () => {
  it("returns true for default function export", () => {
    const code = `export default function MyComponent() {}`;
    expect(hasDefaultExport(code)).toBe(true);
  });

  it("returns true for anonymous default function export", () => {
    const code = `export default function() {}`;
    expect(hasDefaultExport(code)).toBe(true);
  });

  it("returns true for default class export", () => {
    const code = `export default class MyClass {}`;
    expect(hasDefaultExport(code)).toBe(true);
  });

  it("returns true for default expression export", () => {
    const code = `export default MyComponent;`;
    expect(hasDefaultExport(code)).toBe(true);
  });

  it("returns true for default object export", () => {
    const code = `export default { foo: 1, bar: 2 };`;
    expect(hasDefaultExport(code)).toBe(true);
  });

  it("returns false for only named exports", () => {
    const code = `
      export function Named() {}
      export const foo = 1;
    `;
    expect(hasDefaultExport(code)).toBe(false);
  });

  it("returns false for no exports", () => {
    const code = `function privateFunc() {}`;
    expect(hasDefaultExport(code)).toBe(false);
  });

  it("returns true when mixed with named exports", () => {
    const code = `
      export const foo = 1;
      export default function Main() {}
    `;
    expect(hasDefaultExport(code)).toBe(true);
  });
});

describe("getDefaultExportName", () => {
  it("returns name for default function export", () => {
    const code = `export default function MyComponent() {}`;
    expect(getDefaultExportName(code)).toBe("MyComponent");
  });

  it("returns name for default class export", () => {
    const code = `export default class MyClass {}`;
    expect(getDefaultExportName(code)).toBe("MyClass");
  });

  it("returns null for anonymous default function", () => {
    const code = `export default function() {}`;
    expect(getDefaultExportName(code)).toBeNull();
  });

  it("returns null for default expression export", () => {
    const code = `export default MyComponent;`;
    expect(getDefaultExportName(code)).toBeNull();
  });

  it("returns null for default arrow function", () => {
    const code = `export default () => {};`;
    expect(getDefaultExportName(code)).toBeNull();
  });

  it("returns null for default object export", () => {
    const code = `export default { foo: 1 };`;
    expect(getDefaultExportName(code)).toBeNull();
  });

  it("returns null when no default export exists", () => {
    const code = `export function Named() {}`;
    expect(getDefaultExportName(code)).toBeNull();
  });

  it("handles multiline function", () => {
    const code = `
      export default function Invoice() {
        return <div>Invoice</div>;
      }
    `;
    expect(getDefaultExportName(code)).toBe("Invoice");
  });

  it("returns null for async default function (current limitation)", () => {
    // Async default functions are not matched by current regex
    const code = `export default async function fetchData() {}`;
    const name = getDefaultExportName(code);
    // This documents the current limitation
    expect(name).toBeNull();
  });
});

describe("hasUseClientDirective", () => {
  it("returns true for double-quoted directive at start", () => {
    const code = `"use client";
export function Component() {}`;
    expect(hasUseClientDirective(code)).toBe(true);
  });

  it("returns true for single-quoted directive at start", () => {
    const code = `'use client';
export function Component() {}`;
    expect(hasUseClientDirective(code)).toBe(true);
  });

  it("returns true with leading whitespace", () => {
    const code = `  "use client";
export function Component() {}`;
    expect(hasUseClientDirective(code)).toBe(true);
  });

  it("returns true with leading newlines", () => {
    const code = `

"use client";
export function Component() {}`;
    expect(hasUseClientDirective(code)).toBe(true);
  });

  it("returns false when directive is not at start", () => {
    const code = `
import React from 'react';
"use client";
export function Component() {}`;
    expect(hasUseClientDirective(code)).toBe(false);
  });

  it("returns false when no directive", () => {
    const code = `export function Component() {}`;
    expect(hasUseClientDirective(code)).toBe(false);
  });

  it("returns false for use server directive", () => {
    const code = `"use server";
export function Component() {}`;
    expect(hasUseClientDirective(code)).toBe(false);
  });

  it("returns false for use strict directive", () => {
    const code = `"use strict";
export function Component() {}`;
    expect(hasUseClientDirective(code)).toBe(false);
  });

  it("handles directive with semicolon", () => {
    const code = `"use client";
export function Component() {}`;
    expect(hasUseClientDirective(code)).toBe(true);
  });

  it("handles directive without semicolon", () => {
    const code = `"use client"
export function Component() {}`;
    expect(hasUseClientDirective(code)).toBe(true);
  });
});
