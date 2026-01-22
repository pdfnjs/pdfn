import { describe, it, expect } from "vitest";
import {
  extractClassesFromContent,
  TAILWIND_MARKER,
  TAILWIND_CSS_ATTR,
  TAILWIND_PRECOMPILED_ATTR,
  hasTailwindMarker,
  extractTailwindCssPath,
  extractPrecompiledCss,
  removeTailwindMarker,
} from "../src/utils/tailwind.js";

describe("extractClassesFromContent", () => {
  describe("className attribute extraction", () => {
    it("extracts classes from double-quoted className", () => {
      const content = `<div className="bg-blue-500 text-white p-4">Hello</div>`;
      const classes = extractClassesFromContent(content);
      expect(classes).toContain("bg-blue-500");
      expect(classes).toContain("text-white");
      expect(classes).toContain("p-4");
    });

    it("extracts classes from single-quoted className", () => {
      const content = `<div className='flex items-center'>Hello</div>`;
      const classes = extractClassesFromContent(content);
      expect(classes).toContain("flex");
      expect(classes).toContain("items-center");
    });

    it("extracts classes from class attribute (HTML)", () => {
      const content = `<div class="container mx-auto">Hello</div>`;
      const classes = extractClassesFromContent(content);
      expect(classes).toContain("container");
      expect(classes).toContain("mx-auto");
    });

    it("handles multiple elements", () => {
      const content = `
        <div className="flex">
          <span className="text-lg font-bold">Title</span>
          <p className="text-sm text-gray-500">Description</p>
        </div>
      `;
      const classes = extractClassesFromContent(content);
      expect(classes).toContain("flex");
      expect(classes).toContain("text-lg");
      expect(classes).toContain("font-bold");
      expect(classes).toContain("text-sm");
      expect(classes).toContain("text-gray-500");
    });

    it("handles Tailwind modifiers", () => {
      const content = `<div className="hover:bg-blue-600 md:text-lg dark:bg-slate-800">Hello</div>`;
      const classes = extractClassesFromContent(content);
      expect(classes).toContain("hover:bg-blue-600");
      expect(classes).toContain("md:text-lg");
      expect(classes).toContain("dark:bg-slate-800");
    });

    it("handles arbitrary values", () => {
      const content = `<div className="w-[200px] text-[#ff0000] grid-cols-[1fr_2fr]">Hello</div>`;
      const classes = extractClassesFromContent(content);
      expect(classes).toContain("w-[200px]");
      expect(classes).toContain("text-[#ff0000]");
      expect(classes).toContain("grid-cols-[1fr_2fr]");
    });
  });

  describe("template literal extraction", () => {
    it("extracts static classes from template literal", () => {
      const content = `<div className={\`bg-blue-500 text-white\`}>Hello</div>`;
      const classes = extractClassesFromContent(content);
      expect(classes).toContain("bg-blue-500");
      expect(classes).toContain("text-white");
    });

    it("extracts static parts, skipping dynamic expressions", () => {
      const content = `<div className={\`flex \${isActive ? 'bg-blue' : 'bg-gray'} p-4\`}>Hello</div>`;
      const classes = extractClassesFromContent(content);
      expect(classes).toContain("flex");
      expect(classes).toContain("p-4");
      // Dynamic expression content should not be extracted as-is
    });
  });

  describe("clsx/cn function extraction", () => {
    it("extracts classes from cn() calls", () => {
      const content = `<div className={cn("flex items-center", "gap-4")}>Hello</div>`;
      const classes = extractClassesFromContent(content);
      expect(classes).toContain("flex");
      expect(classes).toContain("items-center");
      expect(classes).toContain("gap-4");
    });

    it("extracts classes from clsx() calls", () => {
      const content = `<div className={clsx("p-4", "rounded-lg")}>Hello</div>`;
      const classes = extractClassesFromContent(content);
      expect(classes).toContain("p-4");
      expect(classes).toContain("rounded-lg");
    });

    it("extracts classes from cx() calls", () => {
      const content = `<div className={cx("border", "shadow-md")}>Hello</div>`;
      const classes = extractClassesFromContent(content);
      expect(classes).toContain("border");
      expect(classes).toContain("shadow-md");
    });

    it("extracts static classes from conditional cn() calls", () => {
      const content = `<div className={cn("base-class", isActive && "active-class", disabled && "disabled-class")}>Hello</div>`;
      const classes = extractClassesFromContent(content);
      expect(classes).toContain("base-class");
      expect(classes).toContain("active-class");
      expect(classes).toContain("disabled-class");
    });
  });

  describe("edge cases", () => {
    it("returns empty array for content without classes", () => {
      const content = `<div>Hello</div>`;
      const classes = extractClassesFromContent(content);
      expect(classes).toEqual([]);
    });

    it("returns empty array for empty content", () => {
      const classes = extractClassesFromContent("");
      expect(classes).toEqual([]);
    });

    it("removes duplicate classes", () => {
      const content = `
        <div className="flex flex p-4 p-4">
          <span className="flex">Nested</span>
        </div>
      `;
      const classes = extractClassesFromContent(content);
      const flexCount = classes.filter((c) => c === "flex").length;
      const p4Count = classes.filter((c) => c === "p-4").length;
      expect(flexCount).toBe(1);
      expect(p4Count).toBe(1);
    });

    it("handles empty className", () => {
      const content = `<div className="">Hello</div>`;
      const classes = extractClassesFromContent(content);
      // Should handle gracefully without errors
      expect(Array.isArray(classes)).toBe(true);
    });
  });
});

describe("TAILWIND constants", () => {
  // These constants define the data attributes used for inter-package communication
  // Testing exact values ensures consistency across @pdfn/core, @pdfn/tailwind, etc.
  it("TAILWIND_MARKER matches expected data attribute", () => {
    expect(TAILWIND_MARKER).toBe("data-pdfn-tailwind");
  });

  it("TAILWIND_CSS_ATTR matches expected data attribute", () => {
    expect(TAILWIND_CSS_ATTR).toBe("data-pdfn-tailwind-css");
  });

  it("TAILWIND_PRECOMPILED_ATTR matches expected data attribute", () => {
    expect(TAILWIND_PRECOMPILED_ATTR).toBe("data-pdfn-tailwind-precompiled");
  });
});

describe("hasTailwindMarker", () => {
  it("returns true when marker present", () => {
    const html = `<div data-pdfn-tailwind="true"></div>`;
    expect(hasTailwindMarker(html)).toBe(true);
  });

  it("returns false when marker absent", () => {
    const html = `<div class="container"></div>`;
    expect(hasTailwindMarker(html)).toBe(false);
  });

  it("handles marker with CSS path", () => {
    const html = `<div data-pdfn-tailwind="true" data-pdfn-tailwind-css="./styles.css"></div>`;
    expect(hasTailwindMarker(html)).toBe(true);
  });

  it("handles empty string", () => {
    expect(hasTailwindMarker("")).toBe(false);
  });
});

describe("extractTailwindCssPath", () => {
  it("extracts CSS path from marker", () => {
    const html = `<div data-pdfn-tailwind="true" data-pdfn-tailwind-css="./styles.css"></div>`;
    expect(extractTailwindCssPath(html)).toBe("./styles.css");
  });

  it("extracts absolute path", () => {
    const html = `<div data-pdfn-tailwind-css="/path/to/styles.css"></div>`;
    expect(extractTailwindCssPath(html)).toBe("/path/to/styles.css");
  });

  it("returns undefined when no CSS path", () => {
    const html = `<div data-pdfn-tailwind="true"></div>`;
    expect(extractTailwindCssPath(html)).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(extractTailwindCssPath("")).toBeUndefined();
  });

  it("handles path with special characters", () => {
    const html = `<div data-pdfn-tailwind-css="./my-styles/app.styles.css"></div>`;
    expect(extractTailwindCssPath(html)).toBe("./my-styles/app.styles.css");
  });
});

describe("extractPrecompiledCss", () => {
  it("extracts and decodes base64 CSS", () => {
    const css = "body { color: red; }";
    const encoded = Buffer.from(css).toString("base64");
    const html = `<div data-pdfn-tailwind-precompiled="${encoded}"></div>`;
    expect(extractPrecompiledCss(html)).toBe(css);
  });

  it("returns undefined when no precompiled CSS", () => {
    const html = `<div data-pdfn-tailwind="true"></div>`;
    expect(extractPrecompiledCss(html)).toBeUndefined();
  });

  it("handles base64 that decodes to string (even if looks invalid)", () => {
    // Note: Most base64-like strings will decode to something
    // The function only returns undefined if decoding actually throws
    const html = `<div data-pdfn-tailwind-precompiled="YWJj"></div>`;
    // "YWJj" decodes to "abc"
    expect(extractPrecompiledCss(html)).toBe("abc");
  });

  it("returns undefined for empty string", () => {
    expect(extractPrecompiledCss("")).toBeUndefined();
  });

  it("handles complex CSS", () => {
    const css = `
      .container { max-width: 100%; }
      @media (min-width: 768px) {
        .container { max-width: 768px; }
      }
    `;
    const encoded = Buffer.from(css).toString("base64");
    const html = `<div data-pdfn-tailwind-precompiled="${encoded}"></div>`;
    expect(extractPrecompiledCss(html)).toBe(css);
  });
});

describe("removeTailwindMarker", () => {
  it("removes simple marker div", () => {
    const html = `<div>Content</div><div data-pdfn-tailwind="true"></div>`;
    const result = removeTailwindMarker(html);
    expect(result).toBe("<div>Content</div>");
  });

  it("removes marker div with CSS path", () => {
    const html = `<div data-pdfn-tailwind="true" data-pdfn-tailwind-css="./styles.css"></div><div>Content</div>`;
    const result = removeTailwindMarker(html);
    expect(result).toBe("<div>Content</div>");
  });

  it("removes marker div with precompiled CSS", () => {
    const html = `<div data-pdfn-tailwind="true" data-pdfn-tailwind-precompiled="abc123"></div><p>Text</p>`;
    const result = removeTailwindMarker(html);
    expect(result).toBe("<p>Text</p>");
  });

  it("removes multiple marker divs", () => {
    const html = `<div data-pdfn-tailwind="true"></div><span>A</span><div data-pdfn-tailwind="true"></div>`;
    const result = removeTailwindMarker(html);
    expect(result).toBe("<span>A</span>");
  });

  it("preserves other content", () => {
    const html = `
      <div class="container">
        <div data-pdfn-tailwind="true"></div>
        <h1>Title</h1>
      </div>
    `;
    const result = removeTailwindMarker(html);
    expect(result).toContain('<div class="container">');
    expect(result).toContain("<h1>Title</h1>");
    expect(result).not.toContain("data-pdfn-tailwind");
  });

  it("handles HTML without marker", () => {
    const html = `<div>No marker here</div>`;
    const result = removeTailwindMarker(html);
    expect(result).toBe(html);
  });

  it("handles empty string", () => {
    expect(removeTailwindMarker("")).toBe("");
  });
});
