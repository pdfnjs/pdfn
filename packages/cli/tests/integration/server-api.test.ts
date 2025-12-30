/**
 * @vitest-environment node
 *
 * Server API integration tests.
 * These tests verify the server endpoints work correctly.
 *
 * NOTE: Full PDF generation tests are in packages/react/tests/integration/
 * where render() produces proper HTML with Paged.js initialization.
 * These tests focus on server endpoint behavior only.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer, type PDFXServer } from "../../src/server/index";

const TEST_PORT = 3458; // Use different port to avoid conflicts
const BASE_URL = `http://localhost:${TEST_PORT}`;

// Run tests sequentially
describe("Server API Integration", { sequential: true }, () => {
  let server: PDFXServer;

  beforeAll(async () => {
    server = createServer({
      port: TEST_PORT,
      maxConcurrent: 5,
      timeout: 30000,
    });
    await server.start();
  }, 60000); // Longer timeout for browser launch

  afterAll(async () => {
    await server.stop();
  }, 30000);

  describe("GET /health", () => {
    it("returns health status", async () => {
      const response = await fetch(`${BASE_URL}/health`);
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.status).toBe("ok");
      expect(data.browser).toBe("connected");
      expect(typeof data.activePages).toBe("number");
      expect(data.maxConcurrent).toBe(5);
    });

    it("returns JSON content type", async () => {
      const response = await fetch(`${BASE_URL}/health`);
      expect(response.headers.get("content-type")).toContain("application/json");
    });
  });

  describe("POST /generate - Input Validation", () => {
    it("returns 400 when HTML is missing", async () => {
      const response = await fetch(`${BASE_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("HTML content is required");
    });

    it("returns 400 when body is empty", async () => {
      const response = await fetch(`${BASE_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: "" }),
      });

      expect(response.status).toBe(400);
    });

    it("returns error when content-type is missing", async () => {
      const response = await fetch(`${BASE_URL}/generate`, {
        method: "POST",
        body: "not json",
      });

      // Should fail to parse - could be 400, 415, or 500 depending on parsing
      expect(response.ok).toBe(false);
    });
  });

  describe("POST /generate - HTML Output Mode", () => {
    it("returns HTML when format=html query param is set", async () => {
      const testHtml = `
        <!DOCTYPE html>
        <html>
        <body><h1>Test Document</h1></body>
        </html>
      `;

      const response = await fetch(`${BASE_URL}/generate?format=html`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: testHtml }),
      });

      expect(response.ok).toBe(true);
      expect(response.headers.get("content-type")).toContain("text/html");

      const html = await response.text();
      expect(html).toContain("Test Document");
    });
  });
});

describe("Server API - Without Starting Server", () => {
  it("createServer returns proper interface", () => {
    const server = createServer({ port: 9999 });

    expect(server.app).toBeDefined();
    expect(server.routes).toBeDefined();
    expect(typeof server.start).toBe("function");
    expect(typeof server.stop).toBe("function");
  });

  it("createServer accepts configuration options", () => {
    const server = createServer({
      port: 9998,
      maxConcurrent: 10,
      timeout: 60000,
    });

    expect(server.app).toBeDefined();
  });
});
