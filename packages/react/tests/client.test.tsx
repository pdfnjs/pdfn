import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { pdfn } from "../src/client";
import { Document } from "../src/components/Document";
import { Page } from "../src/components/Page";

// Mock the internal render function
vi.mock("../src/render/render", () => ({
  render: vi.fn().mockResolvedValue("<html><body>rendered</body></html>"),
}));

import { render as renderInternal } from "../src/render/render";

const mockedRender = vi.mocked(renderInternal);

// Helper to create a mock fetch response for generate()
function mockFetchSuccess(overrides: Record<string, unknown> = {}) {
  const pdfContent = Buffer.from("fake-pdf-content");
  const response: Record<string, unknown> = {
    object: "generation",
    id: "gen_test123",
    size_bytes: pdfContent.length,
    duration_ms: 42,
    created_at: "2025-01-01T00:00:00Z",
    pdf_base64: pdfContent.toString("base64"),
    ...overrides,
  };

  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(response),
  } as unknown as Response);
}

function mockFetchError(status: number, body: Record<string, unknown> = {}) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    statusText: "Error",
    json: () => Promise.resolve(body),
  } as unknown as Response);
}

describe("pdfn client", () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = process.env.PDFN_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.PDFN_API_KEY;
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalEnv !== undefined) {
      process.env.PDFN_API_KEY = originalEnv;
    } else {
      delete process.env.PDFN_API_KEY;
    }
    vi.restoreAllMocks();
  });

  describe("pdfn() factory", () => {
    it("creates a client with no arguments (localhost)", () => {
      const client = pdfn();
      expect(client).toBeDefined();
      expect(client.generate).toBeTypeOf("function");
      expect(client.render).toBeTypeOf("function");
    });

    it("creates a client with API key string", () => {
      const client = pdfn("pdfn_live_test123");
      expect(client).toBeDefined();
    });

    it("creates a client with config object", () => {
      const client = pdfn({
        apiKey: "pdfn_live_test123",
        baseUrl: "https://custom.server.com",
        timeout: 60000,
      });
      expect(client).toBeDefined();
    });

    it("reads PDFN_API_KEY from env when no args", () => {
      process.env.PDFN_API_KEY = "pdfn_live_from_env";
      globalThis.fetch = mockFetchSuccess();

      const client = pdfn();
      client.generate({ html: "<h1>test</h1>" });

      // Should use cloud URL when API key is set
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "https://api.pdfn.dev/v1/pdfs",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer pdfn_live_from_env",
          }),
        })
      );
    });
  });

  describe("client.render()", () => {
    it("renders a React element and returns HTML", async () => {
      const client = pdfn();
      const element = (
        <Document title="Test">
          <Page>
            <h1>Hello</h1>
          </Page>
        </Document>
      );

      const result = await client.render({ react: element });

      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
      expect(result.data!.html).toBe("<html><body>rendered</body></html>");
      expect(result.data!.metrics.totalTime).toBeTypeOf("number");
    });

    it("calls internal render with the react element", async () => {
      const client = pdfn();
      const element = (
        <Document title="Test">
          <Page>
            <h1>Hello</h1>
          </Page>
        </Document>
      );

      await client.render({ react: element });

      expect(mockedRender).toHaveBeenCalledWith(element, { debug: undefined });
    });

    it("passes debug options to internal render", async () => {
      const client = pdfn();
      const element = (
        <Document title="Test">
          <Page>
            <h1>Hello</h1>
          </Page>
        </Document>
      );

      await client.render({ react: element, debug: true });

      expect(mockedRender).toHaveBeenCalledWith(element, { debug: true });
    });

    it("passes debug object options to internal render", async () => {
      const client = pdfn();
      const debug = { grid: true, margins: true, headers: false, breaks: false };

      await client.render({
        react: (
          <Document>
            <Page>
              <p>test</p>
            </Page>
          </Document>
        ),
        debug,
      });

      expect(mockedRender).toHaveBeenCalledWith(expect.anything(), { debug });
    });

    it("returns render_error when internal render throws", async () => {
      mockedRender.mockRejectedValueOnce(new Error("Component broke"));

      const client = pdfn();
      const result = await client.render({
        react: (
          <Document>
            <Page>
              <p>test</p>
            </Page>
          </Document>
        ),
      });

      expect(result.data).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error!.code).toBe("render_error");
      expect(result.error!.message).toContain("Component broke");
    });
  });

  describe("client.generate() with HTML input", () => {
    it("sends HTML directly to the server", async () => {
      globalThis.fetch = mockFetchSuccess();
      const client = pdfn();

      const result = await client.generate({ html: "<h1>Hello</h1>" });

      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
      expect(result.data!.buffer).toBeInstanceOf(Buffer);
      expect(result.data!.id).toBe("gen_test123");

      const fetchCall = vi.mocked(globalThis.fetch).mock.calls[0];
      const body = JSON.parse(fetchCall[1]!.body as string);
      expect(body.html).toBe("<h1>Hello</h1>");
    });

    it("does not call internal render for HTML input", async () => {
      globalThis.fetch = mockFetchSuccess();
      const client = pdfn();

      await client.generate({ html: "<h1>Hello</h1>" });

      expect(mockedRender).not.toHaveBeenCalled();
    });

    it("sends metadata in request body", async () => {
      globalThis.fetch = mockFetchSuccess();
      const client = pdfn();

      await client.generate({
        html: "<h1>Test</h1>",
        metadata: { title: "My PDF", author: "Test Author" },
      });

      const fetchCall = vi.mocked(globalThis.fetch).mock.calls[0];
      const body = JSON.parse(fetchCall[1]!.body as string);
      expect(body.metadata).toEqual({ title: "My PDF", author: "Test Author" });
    });

    it("sends standard in request body", async () => {
      globalThis.fetch = mockFetchSuccess();
      const client = pdfn();

      await client.generate({
        html: "<h1>Test</h1>",
        standard: "PDF/A-2b",
      });

      const fetchCall = vi.mocked(globalThis.fetch).mock.calls[0];
      const body = JSON.parse(fetchCall[1]!.body as string);
      expect(body.standard).toBe("PDF/A-2b");
    });

    it("sends filename in request body", async () => {
      globalThis.fetch = mockFetchSuccess();
      const client = pdfn();

      await client.generate({
        html: "<h1>Test</h1>",
        filename: "invoice.pdf",
      });

      const fetchCall = vi.mocked(globalThis.fetch).mock.calls[0];
      const body = JSON.parse(fetchCall[1]!.body as string);
      expect(body.filename).toBe("invoice.pdf");
    });

    it("sends idempotency key as header", async () => {
      globalThis.fetch = mockFetchSuccess();
      const client = pdfn();

      await client.generate({
        html: "<h1>Test</h1>",
        idempotencyKey: "idem-123",
      });

      const fetchCall = vi.mocked(globalThis.fetch).mock.calls[0];
      expect((fetchCall[1]!.headers as Record<string, string>)["Idempotency-Key"]).toBe("idem-123");
    });
  });

  describe("client.generate() with React input", () => {
    it("renders React element then sends HTML to server", async () => {
      globalThis.fetch = mockFetchSuccess();
      const client = pdfn();
      const element = (
        <Document title="Test">
          <Page>
            <h1>Hello</h1>
          </Page>
        </Document>
      );

      const result = await client.generate({ react: element });

      expect(mockedRender).toHaveBeenCalledWith(element, { debug: undefined });
      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
      expect(result.data!.buffer).toBeInstanceOf(Buffer);
    });

    it("passes debug option when rendering React element", async () => {
      globalThis.fetch = mockFetchSuccess();
      const client = pdfn();

      await client.generate({
        react: (
          <Document>
            <Page>
              <p>test</p>
            </Page>
          </Document>
        ),
        debug: true,
      });

      expect(mockedRender).toHaveBeenCalledWith(expect.anything(), { debug: true });
    });

    it("sends rendered HTML to server", async () => {
      mockedRender.mockResolvedValueOnce("<html><body>custom-rendered</body></html>");
      globalThis.fetch = mockFetchSuccess();
      const client = pdfn();

      await client.generate({
        react: (
          <Document>
            <Page>
              <p>test</p>
            </Page>
          </Document>
        ),
      });

      const fetchCall = vi.mocked(globalThis.fetch).mock.calls[0];
      const body = JSON.parse(fetchCall[1]!.body as string);
      expect(body.html).toBe("<html><body>custom-rendered</body></html>");
    });

    it("passes options alongside react element", async () => {
      globalThis.fetch = mockFetchSuccess();
      const client = pdfn();

      await client.generate({
        react: (
          <Document>
            <Page>
              <p>test</p>
            </Page>
          </Document>
        ),
        standard: "PDF/A-2b",
        filename: "report.pdf",
        metadata: { title: "Report" },
      });

      const fetchCall = vi.mocked(globalThis.fetch).mock.calls[0];
      const body = JSON.parse(fetchCall[1]!.body as string);
      expect(body.standard).toBe("PDF/A-2b");
      expect(body.filename).toBe("report.pdf");
      expect(body.metadata).toEqual({ title: "Report" });
    });

    it("returns render_error when React render fails", async () => {
      mockedRender.mockRejectedValueOnce(new Error("Render failed"));
      const client = pdfn();

      const result = await client.generate({
        react: (
          <Document>
            <Page>
              <p>test</p>
            </Page>
          </Document>
        ),
      });

      expect(result.data).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error!.code).toBe("render_error");
    });
  });

  describe("client.generate() response handling", () => {
    it("returns decoded PDF buffer from base64", async () => {
      const pdfContent = Buffer.from("actual-pdf-bytes");
      globalThis.fetch = mockFetchSuccess({
        pdf_base64: pdfContent.toString("base64"),
        size_bytes: pdfContent.length,
      });
      const client = pdfn();

      const result = await client.generate({ html: "<h1>Test</h1>" });

      expect(result.data!.buffer.toString()).toBe("actual-pdf-bytes");
    });

    it("returns metrics from server response", async () => {
      globalThis.fetch = mockFetchSuccess({
        duration_ms: 150,
        size_bytes: 2048,
      });
      const client = pdfn();

      const result = await client.generate({ html: "<h1>Test</h1>" });

      expect(result.data!.metrics.durationMs).toBe(150);
      expect(result.data!.metrics.sizeBytes).toBe(2048);
    });

    it("returns standard and createdAt from server", async () => {
      globalThis.fetch = mockFetchSuccess({
        standard: "PDF/A-2b",
        created_at: "2025-06-15T10:00:00Z",
      });
      const client = pdfn();

      const result = await client.generate({ html: "<h1>Test</h1>" });

      expect(result.data!.standard).toBe("PDF/A-2b");
      expect(result.data!.createdAt).toBe("2025-06-15T10:00:00Z");
    });
  });

  describe("client.generate() error handling", () => {
    it("returns authentication_error for 401", async () => {
      globalThis.fetch = mockFetchError(401, { message: "Invalid key" });
      const client = pdfn("pdfn_live_bad_key");

      const result = await client.generate({ html: "<h1>Test</h1>" });

      expect(result.data).toBeNull();
      expect(result.error!.code).toBe("authentication_error");
    });

    it("returns rate_limit_error for 429", async () => {
      globalThis.fetch = mockFetchError(429, { message: "Too many requests" });
      const client = pdfn("pdfn_live_test");

      const result = await client.generate({ html: "<h1>Test</h1>" });

      expect(result.data).toBeNull();
      expect(result.error!.code).toBe("rate_limit_error");
    });

    it("returns validation_error for 400", async () => {
      globalThis.fetch = mockFetchError(400, { message: "Invalid HTML" });
      const client = pdfn();

      const result = await client.generate({ html: "<h1>Test</h1>" });

      expect(result.data).toBeNull();
      expect(result.error!.code).toBe("validation_error");
    });

    it("returns timeout_error for 504", async () => {
      globalThis.fetch = mockFetchError(504, {});
      const client = pdfn();

      const result = await client.generate({ html: "<h1>Test</h1>" });

      expect(result.data).toBeNull();
      expect(result.error!.code).toBe("timeout_error");
    });

    it("returns server_error for other status codes", async () => {
      globalThis.fetch = mockFetchError(503, { message: "Service Unavailable" });
      const client = pdfn();

      const result = await client.generate({ html: "<h1>Test</h1>" });

      expect(result.data).toBeNull();
      expect(result.error!.code).toBe("server_error");
    });

    it("returns network_error when fetch throws", async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));
      const client = pdfn();

      const result = await client.generate({ html: "<h1>Test</h1>" });

      expect(result.data).toBeNull();
      expect(result.error!.code).toBe("network_error");
      expect(result.error!.message).toContain("localhost:3456");
    });

    it("returns timeout_error when request is aborted", async () => {
      const abortError = new Error("The operation was aborted");
      abortError.name = "AbortError";
      globalThis.fetch = vi.fn().mockRejectedValue(abortError);
      const client = pdfn();

      const result = await client.generate({ html: "<h1>Test</h1>" });

      expect(result.data).toBeNull();
      expect(result.error!.code).toBe("timeout_error");
    });
  });

  describe("client URL routing", () => {
    it("uses localhost when no API key", async () => {
      globalThis.fetch = mockFetchSuccess();
      const client = pdfn();

      await client.generate({ html: "<h1>Test</h1>" });

      const fetchCall = vi.mocked(globalThis.fetch).mock.calls[0];
      expect(fetchCall[0]).toBe("http://localhost:3456/v1/pdfs");
    });

    it("uses pdfn Cloud when API key is provided", async () => {
      globalThis.fetch = mockFetchSuccess();
      const client = pdfn("pdfn_live_key123");

      await client.generate({ html: "<h1>Test</h1>" });

      const fetchCall = vi.mocked(globalThis.fetch).mock.calls[0];
      expect(fetchCall[0]).toBe("https://api.pdfn.dev/v1/pdfs");
    });

    it("uses custom baseUrl when provided", async () => {
      globalThis.fetch = mockFetchSuccess();
      const client = pdfn({ baseUrl: "https://my-server.com" });

      await client.generate({ html: "<h1>Test</h1>" });

      const fetchCall = vi.mocked(globalThis.fetch).mock.calls[0];
      expect(fetchCall[0]).toBe("https://my-server.com/v1/pdfs");
    });

    it("uses custom baseUrl with API key", async () => {
      globalThis.fetch = mockFetchSuccess();
      const client = pdfn({
        baseUrl: "https://my-server.com",
        apiKey: "my_key",
      });

      await client.generate({ html: "<h1>Test</h1>" });

      const fetchCall = vi.mocked(globalThis.fetch).mock.calls[0];
      expect(fetchCall[0]).toBe("https://my-server.com/v1/pdfs");
      expect(
        (fetchCall[1]!.headers as Record<string, string>)["Authorization"]
      ).toBe("Bearer my_key");
    });
  });

  describe("client.generate() timeout", () => {
    it("uses client default timeout (30s)", async () => {
      globalThis.fetch = mockFetchSuccess();
      const client = pdfn();

      await client.generate({ html: "<h1>Test</h1>" });

      // fetch was called with an AbortSignal
      const fetchCall = vi.mocked(globalThis.fetch).mock.calls[0];
      expect(fetchCall[1]!.signal).toBeInstanceOf(AbortSignal);
    });

    it("uses per-request timeout when provided", async () => {
      globalThis.fetch = mockFetchSuccess();
      const client = pdfn();

      await client.generate({ html: "<h1>Test</h1>", timeout: 5000 });

      const fetchCall = vi.mocked(globalThis.fetch).mock.calls[0];
      expect(fetchCall[1]!.signal).toBeInstanceOf(AbortSignal);
    });
  });
});
