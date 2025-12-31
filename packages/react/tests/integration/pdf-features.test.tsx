/**
 * @vitest-environment node
 *
 * Integration tests for PDF features: headers, footers, page numbers, watermarks.
 * These tests generate actual PDFs and verify content/structure.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import puppeteer, { Browser } from "puppeteer";
import React from "react";
// Import from specific files to avoid server-only guard in index.ts
import { render } from "../../src/render/render";
import { Document } from "../../src/components/Document";
import { Page } from "../../src/components/Page";
import { PageBreak } from "../../src/components/PageBreak";
import { PageNumber } from "../../src/components/PageNumber";
import { TotalPages } from "../../src/components/TotalPages";
import { AvoidBreak } from "../../src/components/AvoidBreak";
import { RepeatableTableHeader } from "../../src/components/RepeatableTableHeader";
import { getPdfInfo } from "../helpers/pdf-utils";

describe("PDF Features Integration", () => {
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
        () => (window as unknown as { PDFX?: { ready?: boolean } }).PDFX?.ready === true,
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

  /**
   * Generate HTML and check content before PDF (useful for debugging)
   */
  async function generateHtmlAndPdf(element: React.ReactElement): Promise<{ html: string; pdf: Buffer }> {
    const html = await render(element);
    const page = await browser.newPage();

    try {
      await page.setContent(html, { waitUntil: "networkidle0" });
      await page.waitForFunction(
        () => (window as unknown as { PDFX?: { ready?: boolean } }).PDFX?.ready === true,
        { timeout: 30000 }
      );

      const pdf = await page.pdf({
        preferCSSPageSize: true,
        printBackground: true,
      });

      return { html, pdf: Buffer.from(pdf) };
    } finally {
      await page.close();
    }
  }

  describe("Headers and Footers", () => {
    it("includes header content in rendered HTML", async () => {
      const { html } = await generateHtmlAndPdf(
        <Document>
          <Page
            size="A4"
            header={<div data-testid="header">Company Header</div>}
          >
            <div>Page content</div>
          </Page>
        </Document>
      );

      expect(html).toContain("data-pdfx-header");
      expect(html).toContain("Company Header");
    });

    it("includes footer content in rendered HTML", async () => {
      const { html } = await generateHtmlAndPdf(
        <Document>
          <Page
            size="A4"
            footer={<div data-testid="footer">Page Footer</div>}
          >
            <div>Page content</div>
          </Page>
        </Document>
      );

      expect(html).toContain("data-pdfx-footer");
      expect(html).toContain("Page Footer");
    });

    it("generates PDF with header and footer", async () => {
      const pdf = await generatePdf(
        <Document>
          <Page
            size="A4"
            header={<div>Header Content</div>}
            footer={<div>Footer Content</div>}
          >
            <div>Main page content goes here</div>
          </Page>
        </Document>
      );

      const info = await getPdfInfo(pdf);
      expect(info.pageCount).toBe(1);
      // PDF was generated successfully with header/footer
      expect(pdf.length).toBeGreaterThan(1000);
    });

    it("header/footer work with multi-page content", async () => {
      const pdf = await generatePdf(
        <Document>
          <Page
            size="A4"
            header={<div>Document Header</div>}
            footer={<div>Document Footer</div>}
          >
            <div>Page 1 content</div>
            <PageBreak />
            <div>Page 2 content</div>
            <PageBreak />
            <div>Page 3 content</div>
          </Page>
        </Document>
      );

      const info = await getPdfInfo(pdf);
      expect(info.pageCount).toBe(3);
    });
  });

  describe("PageNumber and TotalPages", () => {
    it("renders PageNumber component in HTML", async () => {
      const { html } = await generateHtmlAndPdf(
        <Document>
          <Page size="A4" footer={<PageNumber />}>
            <div>Content</div>
          </Page>
        </Document>
      );

      expect(html).toContain("data-pdfx-page-number");
      // CSS counter should be applied via styles
      expect(html).toContain("counter(page)");
    });

    it("renders TotalPages component in HTML", async () => {
      const { html } = await generateHtmlAndPdf(
        <Document>
          <Page size="A4" footer={<TotalPages />}>
            <div>Content</div>
          </Page>
        </Document>
      );

      expect(html).toContain("data-pdfx-total-pages");
      expect(html).toContain("counter(pages)");
    });

    it("generates PDF with page numbers", async () => {
      const pdf = await generatePdf(
        <Document>
          <Page
            size="A4"
            footer={
              <div style={{ textAlign: "center" }}>
                Page <PageNumber /> of <TotalPages />
              </div>
            }
          >
            <div>Content on page 1</div>
            <PageBreak />
            <div>Content on page 2</div>
          </Page>
        </Document>
      );

      const info = await getPdfInfo(pdf);
      expect(info.pageCount).toBe(2);
    });

    it("PageNumber with className is rendered", async () => {
      const { html } = await generateHtmlAndPdf(
        <Document>
          <Page
            size="A4"
            footer={<PageNumber className="page-num-style" />}
          >
            <div>Content</div>
          </Page>
        </Document>
      );

      expect(html).toContain("page-num-style");
    });
  });

  describe("Watermarks", () => {
    it("renders string watermark in HTML", async () => {
      const { html } = await generateHtmlAndPdf(
        <Document>
          <Page size="A4" watermark="DRAFT">
            <div>Document content</div>
          </Page>
        </Document>
      );

      // Watermark text stored as data attribute
      expect(html).toContain('data-pdfx-watermark-text="DRAFT"');
      // CSS for watermark generated in style block
      expect(html).toContain(".pagedjs_sheet::before");
      expect(html).toContain('content: "DRAFT"');
    });

    it("renders watermark with custom config", async () => {
      const { html } = await generateHtmlAndPdf(
        <Document>
          <Page
            size="A4"
            watermark={{
              text: "CONFIDENTIAL",
              opacity: 0.2,
              rotation: -30,
            }}
          >
            <div>Secret document</div>
          </Page>
        </Document>
      );

      // Watermark config stored as data attributes
      expect(html).toContain('data-pdfx-watermark-text="CONFIDENTIAL"');
      expect(html).toContain('data-pdfx-watermark-opacity="0.2"');
      expect(html).toContain('data-pdfx-watermark-rotation="-30"');
      // CSS generated with custom rotation
      expect(html).toContain("rotate(-30deg)");
    });

    it("renders watermark text in CSS", async () => {
      const { html } = await generateHtmlAndPdf(
        <Document>
          <Page
            size="A4"
            watermark={{
              text: "SAMPLE",
            }}
          >
            <div>Content</div>
          </Page>
        </Document>
      );

      // Watermark appears in generated CSS
      expect(html).toContain('content: "SAMPLE"');
    });

    it("generates PDF with watermark", async () => {
      const pdf = await generatePdf(
        <Document>
          <Page size="A4" watermark="DRAFT">
            <div>Document with watermark</div>
          </Page>
        </Document>
      );

      const info = await getPdfInfo(pdf);
      expect(info.pageCount).toBe(1);
      expect(pdf.length).toBeGreaterThan(1000);
    });
  });

  describe("AvoidBreak component", () => {
    it("renders AvoidBreak with proper attributes", async () => {
      const { html } = await generateHtmlAndPdf(
        <Document>
          <Page size="A4">
            <AvoidBreak>
              <div>This content should stay together</div>
              <div>And not be split across pages</div>
            </AvoidBreak>
          </Page>
        </Document>
      );

      expect(html).toContain("data-pdfx-avoid-break");
      expect(html).toContain("break-inside");
    });

    it("generates PDF with AvoidBreak content", async () => {
      const pdf = await generatePdf(
        <Document>
          <Page size="A4">
            <div>Some initial content</div>
            <AvoidBreak>
              <div style={{ border: "1px solid black", padding: "20px" }}>
                <h2>Keep Together Block</h2>
                <p>This paragraph and heading should stay together.</p>
                <p>They should not be split across pages.</p>
              </div>
            </AvoidBreak>
          </Page>
        </Document>
      );

      const info = await getPdfInfo(pdf);
      expect(info.pageCount).toBeGreaterThanOrEqual(1);
    });

    it("AvoidBreak with className", async () => {
      const { html } = await generateHtmlAndPdf(
        <Document>
          <Page size="A4">
            <AvoidBreak className="keep-together">
              <div>Content</div>
            </AvoidBreak>
          </Page>
        </Document>
      );

      expect(html).toContain("keep-together");
    });
  });

  describe("RepeatableTableHeader", () => {
    it("renders RepeatableTableHeader with proper attributes", async () => {
      const { html } = await generateHtmlAndPdf(
        <Document>
          <Page size="A4">
            <table>
              <RepeatableTableHeader>
                <tr>
                  <th>Column 1</th>
                  <th>Column 2</th>
                </tr>
              </RepeatableTableHeader>
              <tbody>
                <tr>
                  <td>Data 1</td>
                  <td>Data 2</td>
                </tr>
              </tbody>
            </table>
          </Page>
        </Document>
      );

      expect(html).toContain("data-pdfx-repeatable-header");
      expect(html).toContain("Column 1");
      expect(html).toContain("Column 2");
    });

    it("generates PDF with table header", async () => {
      // Create a table with many rows to test header repetition
      const rows = Array.from({ length: 50 }, (_, i) => (
        <tr key={i}>
          <td>Row {i + 1}</td>
          <td>Value {i + 1}</td>
          <td>Description {i + 1}</td>
        </tr>
      ));

      const pdf = await generatePdf(
        <Document>
          <Page size="A4">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <RepeatableTableHeader>
                <tr style={{ backgroundColor: "#f0f0f0" }}>
                  <th style={{ border: "1px solid black", padding: "8px" }}>ID</th>
                  <th style={{ border: "1px solid black", padding: "8px" }}>Value</th>
                  <th style={{ border: "1px solid black", padding: "8px" }}>Description</th>
                </tr>
              </RepeatableTableHeader>
              <tbody>{rows}</tbody>
            </table>
          </Page>
        </Document>
      );

      const info = await getPdfInfo(pdf);
      // With 50 rows, should span multiple pages
      expect(info.pageCount).toBeGreaterThan(1);
    });
  });

  describe("Combined features", () => {
    it("generates complex PDF with all features", async () => {
      const pdf = await generatePdf(
        <Document title="Complex Document" author="PDFX Test">
          <Page
            size="A4"
            header={<div style={{ borderBottom: "1px solid #ccc", padding: "10px" }}>Company Name</div>}
            footer={
              <div style={{ borderTop: "1px solid #ccc", padding: "10px", display: "flex", justifyContent: "space-between" }}>
                <span>Confidential</span>
                <span>Page <PageNumber /> of <TotalPages /></span>
              </div>
            }
            watermark={{ text: "DRAFT", opacity: 0.1 }}
          >
            <h1>Document Title</h1>

            <AvoidBreak>
              <h2>Section 1</h2>
              <p>This section should stay together.</p>
            </AvoidBreak>

            <PageBreak />

            <h2>Data Table</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <RepeatableTableHeader>
                <tr>
                  <th style={{ border: "1px solid black", padding: "5px" }}>Item</th>
                  <th style={{ border: "1px solid black", padding: "5px" }}>Value</th>
                </tr>
              </RepeatableTableHeader>
              <tbody>
                {Array.from({ length: 30 }, (_, i) => (
                  <tr key={i}>
                    <td style={{ border: "1px solid black", padding: "5px" }}>Item {i + 1}</td>
                    <td style={{ border: "1px solid black", padding: "5px" }}>${(i + 1) * 100}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Page>
        </Document>
      );

      const info = await getPdfInfo(pdf);
      // Should have multiple pages
      expect(info.pageCount).toBeGreaterThan(1);
      // PDF should be substantial
      expect(pdf.length).toBeGreaterThan(5000);
    });
  });
});
