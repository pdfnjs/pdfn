import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generate } from "../../src/generate";
import { Document } from "../../src/components/Document";
import { Page } from "../../src/components/Page";

describe("generate", () => {
  const originalEnv = process.env.PDFX_HOST;

  beforeEach(() => {
    // Clear env before each test
    delete process.env.PDFX_HOST;
    // Suppress console warnings
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore env
    if (originalEnv) {
      process.env.PDFX_HOST = originalEnv;
    } else {
      delete process.env.PDFX_HOST;
    }
    vi.restoreAllMocks();
  });

  it("throws helpful error if PDFX_HOST is not set", async () => {
    await expect(
      generate(
        <Document>
          <Page>Content</Page>
        </Document>
      )
    ).rejects.toThrow("PDFX_HOST is required");
  });

  it("error message includes setup instructions", async () => {
    try {
      await generate(
        <Document>
          <Page>Content</Page>
        </Document>
      );
    } catch (error) {
      expect((error as Error).message).toContain("npx @pdfx-dev/cli dev");
      expect((error as Error).message).toContain("Docker");
      expect((error as Error).message).toContain("render()");
    }
  });

  it("uses options.host over PDFX_HOST env", async () => {
    process.env.PDFX_HOST = "http://env-host:3456";

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    });
    global.fetch = mockFetch;

    await generate(
      <Document>
        <Page>Content</Page>
      </Document>,
      { host: "http://options-host:3456" }
    );

    expect(mockFetch).toHaveBeenCalledWith(
      "http://options-host:3456/generate",
      expect.any(Object)
    );
  });

  it("uses PDFX_HOST env when host option not provided", async () => {
    process.env.PDFX_HOST = "http://env-host:3456";

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    });
    global.fetch = mockFetch;

    await generate(
      <Document>
        <Page>Content</Page>
      </Document>
    );

    expect(mockFetch).toHaveBeenCalledWith(
      "http://env-host:3456/generate",
      expect.any(Object)
    );
  });

  it("POSTs HTML to /generate endpoint", async () => {
    process.env.PDFX_HOST = "http://localhost:3456";

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    });
    global.fetch = mockFetch;

    await generate(
      <Document>
        <Page>Content</Page>
      </Document>
    );

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3456/generate",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.html).toContain("<!DOCTYPE html>");
    expect(body.html).toContain("Content");
  });

  it("returns Buffer from server response", async () => {
    process.env.PDFX_HOST = "http://localhost:3456";

    // Create a mock PDF response
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // %PDF
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(pdfBytes.buffer),
    });
    global.fetch = mockFetch;

    const result = await generate(
      <Document>
        <Page>Content</Page>
      </Document>
    );

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result[0]).toBe(0x25); // %
    expect(result[1]).toBe(0x50); // P
    expect(result[2]).toBe(0x44); // D
    expect(result[3]).toBe(0x46); // F
  });

  it("throws on server error response", async () => {
    process.env.PDFX_HOST = "http://localhost:3456";

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: () => Promise.resolve("Server crashed"),
    });
    global.fetch = mockFetch;

    await expect(
      generate(
        <Document>
          <Page>Content</Page>
        </Document>
      )
    ).rejects.toThrow("PDFX server error: 500 Internal Server Error");
  });
});
