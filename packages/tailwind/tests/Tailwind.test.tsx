import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Tailwind, TAILWIND_MARKER, TAILWIND_CSS_ATTR } from "../src/Tailwind.js";

describe("Tailwind component", () => {
  describe("basic rendering", () => {
    it("renders children", () => {
      const html = renderToStaticMarkup(
        <Tailwind>
          <div className="text-blue-500">Hello</div>
        </Tailwind>
      );
      expect(html).toContain("text-blue-500");
      expect(html).toContain("Hello");
    });

    it("renders marker element", () => {
      const html = renderToStaticMarkup(
        <Tailwind>
          <div>Content</div>
        </Tailwind>
      );
      expect(html).toContain(TAILWIND_MARKER);
      expect(html).toContain('data-pdfn-tailwind="true"');
    });

    it("marker has display: none style", () => {
      const html = renderToStaticMarkup(
        <Tailwind>
          <div>Content</div>
        </Tailwind>
      );
      expect(html).toContain("display:none");
    });

    it("renders multiple children", () => {
      const html = renderToStaticMarkup(
        <Tailwind>
          <div className="flex">Flex</div>
          <div className="grid">Grid</div>
          <span className="text-sm">Span</span>
        </Tailwind>
      );
      expect(html).toContain("flex");
      expect(html).toContain("grid");
      expect(html).toContain("text-sm");
    });
  });

  describe("CSS path handling", () => {
    it("adds CSS path attribute when provided", () => {
      const html = renderToStaticMarkup(
        <Tailwind css="./styles.css">
          <div>Content</div>
        </Tailwind>
      );
      expect(html).toContain(TAILWIND_CSS_ATTR);
      expect(html).toContain("./styles.css");
    });

    it("handles relative path", () => {
      const html = renderToStaticMarkup(
        <Tailwind css="./pdfn-templates/styles.css">
          <div>Content</div>
        </Tailwind>
      );
      expect(html).toContain("./pdfn-templates/styles.css");
    });

    it("handles absolute path", () => {
      const html = renderToStaticMarkup(
        <Tailwind css="/app/styles.css">
          <div>Content</div>
        </Tailwind>
      );
      expect(html).toContain("/app/styles.css");
    });
  });

  describe("pre-compiled CSS handling", () => {
    it("detects CSS content (contains braces)", () => {
      const css = ".text-red-500 { color: red; }";
      const html = renderToStaticMarkup(
        <Tailwind css={css}>
          <div>Content</div>
        </Tailwind>
      );
      // Should be stored as base64
      expect(html).toContain("data-pdfn-tailwind-precompiled");
      // Should NOT contain the raw CSS path attribute
      expect(html).not.toContain(`${TAILWIND_CSS_ATTR}="`);
    });

    it("encodes pre-compiled CSS as base64", () => {
      const css = ".custom { color: blue; }";
      const html = renderToStaticMarkup(
        <Tailwind css={css}>
          <div>Content</div>
        </Tailwind>
      );
      // Base64 encoding of the CSS
      const expectedBase64 = Buffer.from(css).toString("base64");
      expect(html).toContain(expectedBase64);
    });

    it("handles complex CSS content", () => {
      const css = `
        .container { max-width: 100%; }
        @media (min-width: 768px) {
          .container { max-width: 768px; }
        }
      `;
      const html = renderToStaticMarkup(
        <Tailwind css={css}>
          <div>Content</div>
        </Tailwind>
      );
      expect(html).toContain("data-pdfn-tailwind-precompiled");
    });
  });

  describe("no css prop", () => {
    it("renders without CSS attributes when no css prop", () => {
      const html = renderToStaticMarkup(
        <Tailwind>
          <div>Content</div>
        </Tailwind>
      );
      expect(html).toContain(TAILWIND_MARKER);
      expect(html).not.toContain(TAILWIND_CSS_ATTR);
      expect(html).not.toContain("data-pdfn-tailwind-precompiled");
    });
  });
});

describe("TAILWIND constants", () => {
  // These constants must match @pdfn/core for cross-package compatibility
  it("TAILWIND_MARKER matches @pdfn/core", () => {
    expect(TAILWIND_MARKER).toBe("data-pdfn-tailwind");
  });

  it("TAILWIND_CSS_ATTR matches @pdfn/core", () => {
    expect(TAILWIND_CSS_ATTR).toBe("data-pdfn-tailwind-css");
  });
});
