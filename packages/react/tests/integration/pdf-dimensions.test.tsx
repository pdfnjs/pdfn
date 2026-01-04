/**
 * @vitest-environment node
 *
 * Integration tests for PDF page dimensions and orientations.
 * These tests generate actual PDFs and verify their dimensions using pdf-lib.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import puppeteer, { Browser } from "puppeteer";
import React from "react";
// Import from specific files to avoid server-only guard in index.ts
import { render } from "../../src/render/render";
import { Document } from "../../src/components/Document";
import { Page } from "../../src/components/Page";
import { PageBreak } from "../../src/components/PageBreak";
import {
  getPdfInfo,
  getPdfMetadata,
  assertPageSize,
  assertPageDimensions,
  PAGE_DIMENSIONS,
  parseToPoints,
  mmToPoints,
  type PageSizeName,
} from "../helpers/pdf-utils";

describe("PDF Page Dimensions", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  /**
   * Generate a PDF from a React element
   */
  async function generatePdf(element: React.ReactElement): Promise<Buffer> {
    const html = await render(element);
    const page = await browser.newPage();

    try {
      await page.setContent(html, { waitUntil: "networkidle0" });

      // Wait for Paged.js to finish processing
      await page.waitForFunction(
        () => (window as unknown as { PDFN?: { ready?: boolean } }).PDFN?.ready === true,
        { timeout: 30000 }
      );

      const pdf = await page.pdf({
        preferCSSPageSize: true,
        printBackground: true,
      });

      return Buffer.from(pdf);
    } finally {
      await page.close();
    }
  }

  // Test all standard page sizes in both orientations
  describe.each([
    "A4",
    "A3",
    "A5",
    "Letter",
    "Legal",
    "Tabloid",
    "B4",
    "B5",
  ] as PageSizeName[])("%s page size", (size) => {
    it("portrait orientation", async () => {
      const pdf = await generatePdf(
        <Document title="Test">
          <Page size={size} orientation="portrait">
            <div>Test content for {size} portrait</div>
          </Page>
        </Document>
      );

      const info = await getPdfInfo(pdf);
      expect(info.pageCount).toBe(1);
      assertPageSize(info.pages[0]!, size, "portrait");
      expect(info.pages[0]!.isLandscape).toBe(false);
    });

    it("landscape orientation", async () => {
      const pdf = await generatePdf(
        <Document title="Test">
          <Page size={size} orientation="landscape">
            <div>Test content for {size} landscape</div>
          </Page>
        </Document>
      );

      const info = await getPdfInfo(pdf);
      expect(info.pageCount).toBe(1);
      assertPageSize(info.pages[0]!, size, "landscape");
      expect(info.pages[0]!.isLandscape).toBe(true);
    });
  });

  describe("Custom page sizes", () => {
    it("handles custom size in mm", async () => {
      const pdf = await generatePdf(
        <Document title="Test">
          <Page size={["100mm", "150mm"]}>
            <div>Custom size content</div>
          </Page>
        </Document>
      );

      const info = await getPdfInfo(pdf);
      expect(info.pageCount).toBe(1);

      // Parse expected values using same logic as Page.tsx
      // Use 1pt tolerance for mm (Puppeteer/CSS rounding)
      const expectedWidth = parseToPoints("100mm");
      const expectedHeight = parseToPoints("150mm");
      assertPageDimensions(info.pages[0]!, expectedWidth, expectedHeight, 1);
    });

    it("handles custom size in inches", async () => {
      const pdf = await generatePdf(
        <Document title="Test">
          <Page size={["5in", "7in"]}>
            <div>Custom inch size content</div>
          </Page>
        </Document>
      );

      const info = await getPdfInfo(pdf);
      expect(info.pageCount).toBe(1);

      // 5in = 360 points (exact), 7in = 504 points (exact)
      assertPageDimensions(info.pages[0]!, 360, 504, 0.01); // Near-zero tolerance for inches
    });

    it("handles custom size in points", async () => {
      const pdf = await generatePdf(
        <Document title="Test">
          <Page size={["400pt", "600pt"]}>
            <div>Custom point size content</div>
          </Page>
        </Document>
      );

      const info = await getPdfInfo(pdf);
      expect(info.pageCount).toBe(1);

      // Points go through CSS/Puppeteer, allow small tolerance
      assertPageDimensions(info.pages[0]!, 400, 600, 0.5);
    });
  });

  describe("Multi-page documents", () => {
    // Note: Multiple <Page> components are rendered as sequential content.
    // Paged.js handles pagination based on content overflow, not React components.
    // To force separate pages, use <PageBreak /> between content.

    it("renders multiple Page components as sequential content", async () => {
      const pdf = await generatePdf(
        <Document title="Test">
          <Page size="A4">
            <div>Page 1</div>
          </Page>
          <Page size="A4">
            <div>Page 2</div>
          </Page>
          <Page size="A4">
            <div>Page 3</div>
          </Page>
        </Document>
      );

      const info = await getPdfInfo(pdf);
      // Multiple Page components render as sequential content on one page
      // unless content overflows or PageBreak is used
      expect(info.pageCount).toBeGreaterThanOrEqual(1);
      // First page should have A4 dimensions (from first Page component)
      assertPageSize(info.pages[0]!, "A4", "portrait");
    });

    it("uses first Page component size for the document", async () => {
      const pdf = await generatePdf(
        <Document title="Test">
          <Page size="A4" orientation="portrait">
            <div>Content in A4</div>
          </Page>
        </Document>
      );

      const info = await getPdfInfo(pdf);
      expect(info.pageCount).toBe(1);
      assertPageSize(info.pages[0]!, "A4", "portrait");
    });
  });

  describe("PageBreak component", () => {
    it("creates new page when PageBreak is used", async () => {
      const pdf = await generatePdf(
        <Document title="Test">
          <Page size="A4">
            <div>Content before break</div>
            <PageBreak />
            <div>Content after break</div>
          </Page>
        </Document>
      );

      const info = await getPdfInfo(pdf);
      expect(info.pageCount).toBe(2);

      // Both pages should be A4
      assertPageSize(info.pages[0]!, "A4", "portrait");
      assertPageSize(info.pages[1]!, "A4", "portrait");
    });

    it("handles multiple PageBreaks", async () => {
      const pdf = await generatePdf(
        <Document title="Test">
          <Page size="Letter">
            <div>Page 1</div>
            <PageBreak />
            <div>Page 2</div>
            <PageBreak />
            <div>Page 3</div>
          </Page>
        </Document>
      );

      const info = await getPdfInfo(pdf);
      expect(info.pageCount).toBe(3);
    });
  });

  describe("Content overflow", () => {
    it("handles content that spans multiple pages", async () => {
      const lines = Array.from({ length: 100 }, (_, i) => (
        <p key={i} style={{ marginBottom: "20px" }}>
          Line {i + 1} - This is some content that will cause the page to
          overflow
        </p>
      ));

      const pdf = await generatePdf(
        <Document title="Test">
          <Page size="A4">{lines}</Page>
        </Document>
      );

      const info = await getPdfInfo(pdf);
      expect(info.pageCount).toBeGreaterThan(1);

      // All overflow pages should maintain the same size
      for (const page of info.pages) {
        assertPageSize(page, "A4", "portrait");
      }
    });
  });

  describe("PDF Metadata", () => {
    // Note: Puppeteer's page.pdf() picks up the HTML <title> tag
    // but does not automatically embed author/subject from HTML meta tags.
    // Full PDF metadata support would require passing options to page.pdf().

    it("embeds document title from HTML title tag", async () => {
      const pdf = await generatePdf(
        <Document title="Test Invoice">
          <Page size="A4">
            <div>Content</div>
          </Page>
        </Document>
      );

      const metadata = await getPdfMetadata(pdf);
      expect(metadata.title).toBe("Test Invoice");
    });

    it("embeds custom title in PDF metadata", async () => {
      const pdf = await generatePdf(
        <Document title="Custom Title">
          <Page size="A4">
            <div>Content with custom title</div>
          </Page>
        </Document>
      );

      const metadata = await getPdfMetadata(pdf);
      expect(metadata.title).toBe("Custom Title");
    });

    // TODO: Author and subject metadata require server-side PDF options
    // These will be implemented when the generate() function supports full metadata
    it.todo("embeds document author (requires server support)");
    it.todo("embeds document subject (requires server support)");
  });

  describe("Page size constants", () => {
    it("PAGE_DIMENSIONS has all expected sizes", () => {
      expect(PAGE_DIMENSIONS).toHaveProperty("A4");
      expect(PAGE_DIMENSIONS).toHaveProperty("A3");
      expect(PAGE_DIMENSIONS).toHaveProperty("A5");
      expect(PAGE_DIMENSIONS).toHaveProperty("Letter");
      expect(PAGE_DIMENSIONS).toHaveProperty("Legal");
      expect(PAGE_DIMENSIONS).toHaveProperty("Tabloid");
      expect(PAGE_DIMENSIONS).toHaveProperty("B4");
      expect(PAGE_DIMENSIONS).toHaveProperty("B5");
    });

    it("A4 dimensions are correct", () => {
      // A4 is 210mm x 297mm
      const expectedWidth = mmToPoints(210);
      const expectedHeight = mmToPoints(297);

      expect(PAGE_DIMENSIONS.A4.width).toBeCloseTo(expectedWidth, 1);
      expect(PAGE_DIMENSIONS.A4.height).toBeCloseTo(expectedHeight, 1);
    });

    it("Letter dimensions are correct", () => {
      // Letter is 8.5in x 11in
      expect(PAGE_DIMENSIONS.Letter.width).toBe(612); // 8.5 * 72
      expect(PAGE_DIMENSIONS.Letter.height).toBe(792); // 11 * 72
    });
  });
});
