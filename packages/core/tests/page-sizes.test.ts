import { describe, it, expect } from "vitest";
import {
  PAGE_SIZES,
  getPageDimensions,
  pageDimensionsToCss,
  getPageSizeCss,
} from "../src/constants/page-sizes.js";

describe("PAGE_SIZES constant", () => {
  it("contains all standard US sizes", () => {
    expect(PAGE_SIZES.Letter).toEqual({ width: 612, height: 792 });
    expect(PAGE_SIZES.Legal).toEqual({ width: 612, height: 1008 });
    expect(PAGE_SIZES.Tabloid).toEqual({ width: 792, height: 1224 });
  });

  it("contains all ISO A series sizes", () => {
    expect(PAGE_SIZES.A3).toEqual({ width: 841.89, height: 1190.55 });
    expect(PAGE_SIZES.A4).toEqual({ width: 595.28, height: 841.89 });
    expect(PAGE_SIZES.A5).toEqual({ width: 419.53, height: 595.28 });
  });

  it("contains all ISO B series sizes", () => {
    expect(PAGE_SIZES.B4).toEqual({ width: 708.66, height: 1000.63 });
    expect(PAGE_SIZES.B5).toEqual({ width: 498.9, height: 708.66 });
  });
});

describe("getPageDimensions", () => {
  it("returns correct dimensions for A4 portrait (default)", () => {
    const dimensions = getPageDimensions("A4");
    expect(dimensions).toEqual({ width: 595.28, height: 841.89 });
  });

  it("returns correct dimensions for A4 landscape", () => {
    const dimensions = getPageDimensions("A4", "landscape");
    expect(dimensions).toEqual({ width: 841.89, height: 595.28 });
  });

  it("returns correct dimensions for Letter portrait", () => {
    const dimensions = getPageDimensions("Letter");
    expect(dimensions).toEqual({ width: 612, height: 792 });
  });

  it("returns correct dimensions for Letter landscape", () => {
    const dimensions = getPageDimensions("Letter", "landscape");
    expect(dimensions).toEqual({ width: 792, height: 612 });
  });

  it("returns correct dimensions for Legal", () => {
    const dimensions = getPageDimensions("Legal", "portrait");
    expect(dimensions).toEqual({ width: 612, height: 1008 });
  });

  it("returns correct dimensions for Tabloid", () => {
    const dimensions = getPageDimensions("Tabloid", "portrait");
    expect(dimensions).toEqual({ width: 792, height: 1224 });
  });

  it("returns correct dimensions for A3", () => {
    const dimensions = getPageDimensions("A3", "portrait");
    expect(dimensions).toEqual({ width: 841.89, height: 1190.55 });
  });

  it("returns correct dimensions for A5", () => {
    const dimensions = getPageDimensions("A5", "portrait");
    expect(dimensions).toEqual({ width: 419.53, height: 595.28 });
  });

  it("returns correct dimensions for B4", () => {
    const dimensions = getPageDimensions("B4", "portrait");
    expect(dimensions).toEqual({ width: 708.66, height: 1000.63 });
  });

  it("returns correct dimensions for B5", () => {
    const dimensions = getPageDimensions("B5", "portrait");
    expect(dimensions).toEqual({ width: 498.9, height: 708.66 });
  });

  it("defaults to A4 for unknown size", () => {
    const dimensions = getPageDimensions("UnknownSize");
    expect(dimensions).toEqual({ width: 595.28, height: 841.89 });
  });

  it("handles landscape orientation for unknown size", () => {
    const dimensions = getPageDimensions("UnknownSize", "landscape");
    expect(dimensions).toEqual({ width: 841.89, height: 595.28 });
  });
});

describe("pageDimensionsToCss", () => {
  it("converts dimensions to CSS pt string", () => {
    const css = pageDimensionsToCss({ width: 595.28, height: 841.89 });
    expect(css).toBe("595.28pt 841.89pt");
  });

  it("handles whole number dimensions", () => {
    const css = pageDimensionsToCss({ width: 612, height: 792 });
    expect(css).toBe("612pt 792pt");
  });

  it("preserves decimal precision", () => {
    const css = pageDimensionsToCss({ width: 100.123, height: 200.456 });
    expect(css).toBe("100.123pt 200.456pt");
  });
});

describe("getPageSizeCss", () => {
  it("returns CSS for A4 portrait", () => {
    const css = getPageSizeCss("A4");
    expect(css).toBe("595.28pt 841.89pt");
  });

  it("returns CSS for A4 landscape", () => {
    const css = getPageSizeCss("A4", "landscape");
    expect(css).toBe("841.89pt 595.28pt");
  });

  it("returns CSS for Letter portrait", () => {
    const css = getPageSizeCss("Letter");
    expect(css).toBe("612pt 792pt");
  });

  it("returns CSS for Letter landscape", () => {
    const css = getPageSizeCss("Letter", "landscape");
    expect(css).toBe("792pt 612pt");
  });

  it("returns A4 CSS for unknown size", () => {
    const css = getPageSizeCss("CustomSize");
    expect(css).toBe("595.28pt 841.89pt");
  });
});
