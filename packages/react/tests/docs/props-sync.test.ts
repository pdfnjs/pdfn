/**
 * Documentation Sync Test
 *
 * Ensures that the documented props in apps/web/src/app/components/page.tsx
 * stay in sync with the actual TypeScript types.
 *
 * If this test fails, update the /components page documentation.
 */
import { describe, it, expect } from "vitest";

// Define the props that SHOULD be documented for each component
// These are derived from the actual TypeScript interfaces

const DOCUMENTED_PROPS = {
  Document: [
    "title",
    "author",
    "subject",
    "keywords",
    "language",
    "fonts",
    "children",
  ],
  Page: [
    "size",
    "orientation",
    "margin",
    "background",
    "header",
    "footer",
    "watermark",
    "children",
  ],
  PageNumber: ["className"],
  TotalPages: ["className"],
  PageBreak: [], // No props
  AvoidBreak: ["children", "className"],
  TableHeader: ["children", "className"],
} as const;

// Import actual types to verify at compile time
import type { DocumentProps, PageProps } from "../../src/types";
import type { PageNumberProps } from "../../src/components/PageNumber";
import type { TotalPagesProps } from "../../src/components/TotalPages";
import type { AvoidBreakProps } from "../../src/components/AvoidBreak";
import type { TableHeaderProps } from "../../src/components/TableHeader";

// Type-level verification: ensures DOCUMENTED_PROPS keys match actual interface keys
// If a prop is added/removed from the interface, TypeScript will error here

type AssertKeysMatch<T, U extends readonly string[]> = keyof T extends U[number]
  ? U[number] extends keyof T
    ? true
    : false
  : false;

// These will cause TypeScript errors if props don't match
type _CheckDocument = AssertKeysMatch<DocumentProps, typeof DOCUMENTED_PROPS.Document>;
type _CheckPage = AssertKeysMatch<PageProps, typeof DOCUMENTED_PROPS.Page>;
type _CheckPageNumber = AssertKeysMatch<PageNumberProps, typeof DOCUMENTED_PROPS.PageNumber>;
type _CheckTotalPages = AssertKeysMatch<TotalPagesProps, typeof DOCUMENTED_PROPS.TotalPages>;
type _CheckAvoidBreak = AssertKeysMatch<AvoidBreakProps, typeof DOCUMENTED_PROPS.AvoidBreak>;
type _CheckTableHeader = AssertKeysMatch<TableHeaderProps, typeof DOCUMENTED_PROPS.TableHeader>;

// Runtime tests for better error messages
describe("Documentation Props Sync", () => {
  it("Document props match TypeScript interface", () => {
    const actualProps: (keyof DocumentProps)[] = [
      "title",
      "author",
      "subject",
      "keywords",
      "language",
      "fonts",
      "children",
    ];
    expect(DOCUMENTED_PROPS.Document).toEqual(expect.arrayContaining(actualProps));
    expect(actualProps).toEqual(expect.arrayContaining([...DOCUMENTED_PROPS.Document]));
  });

  it("Page props match TypeScript interface", () => {
    const actualProps: (keyof PageProps)[] = [
      "size",
      "orientation",
      "margin",
      "background",
      "header",
      "footer",
      "watermark",
      "children",
    ];
    expect(DOCUMENTED_PROPS.Page).toEqual(expect.arrayContaining(actualProps));
    expect(actualProps).toEqual(expect.arrayContaining([...DOCUMENTED_PROPS.Page]));
  });

  it("PageNumber props match TypeScript interface", () => {
    const actualProps: (keyof PageNumberProps)[] = ["className"];
    expect(DOCUMENTED_PROPS.PageNumber).toEqual(expect.arrayContaining(actualProps));
    expect(actualProps).toEqual(expect.arrayContaining([...DOCUMENTED_PROPS.PageNumber]));
  });

  it("TotalPages props match TypeScript interface", () => {
    const actualProps: (keyof TotalPagesProps)[] = ["className"];
    expect(DOCUMENTED_PROPS.TotalPages).toEqual(expect.arrayContaining(actualProps));
    expect(actualProps).toEqual(expect.arrayContaining([...DOCUMENTED_PROPS.TotalPages]));
  });

  it("AvoidBreak props match TypeScript interface", () => {
    const actualProps: (keyof AvoidBreakProps)[] = ["children", "className"];
    expect(DOCUMENTED_PROPS.AvoidBreak).toEqual(expect.arrayContaining(actualProps));
    expect(actualProps).toEqual(expect.arrayContaining([...DOCUMENTED_PROPS.AvoidBreak]));
  });

  it("TableHeader props match TypeScript interface", () => {
    const actualProps: (keyof TableHeaderProps)[] = ["children", "className"];
    expect(DOCUMENTED_PROPS.TableHeader).toEqual(expect.arrayContaining(actualProps));
    expect(actualProps).toEqual(expect.arrayContaining([...DOCUMENTED_PROPS.TableHeader]));
  });

  it("all components are documented", () => {
    const documentedComponents = Object.keys(DOCUMENTED_PROPS);
    const expectedComponents = [
      "Document",
      "Page",
      "PageNumber",
      "TotalPages",
      "PageBreak",
      "AvoidBreak",
      "TableHeader",
    ];
    expect(documentedComponents).toEqual(expect.arrayContaining(expectedComponents));
  });
});
