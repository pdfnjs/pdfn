import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createServer } from "../../src/server/index";
import { BrowserManager } from "../../src/server/browser";

describe("Server", () => {
  describe("createServer", () => {
    it("returns server object with required properties", () => {
      const server = createServer();

      expect(server).toHaveProperty("app");
      expect(server).toHaveProperty("start");
      expect(server).toHaveProperty("stop");
    });

    it("app is an express application", () => {
      const server = createServer();
      // Express apps have these properties
      expect(typeof server.app.use).toBe("function");
      expect(typeof server.app.get).toBe("function");
      expect(typeof server.app.post).toBe("function");
      expect(typeof server.app.listen).toBe("function");
    });

    it("start is a function", () => {
      const server = createServer();
      expect(typeof server.start).toBe("function");
    });

    it("stop is a function", () => {
      const server = createServer();
      expect(typeof server.stop).toBe("function");
    });

    it("accepts custom port option", () => {
      const server = createServer({ port: 4000 });
      expect(server).toBeDefined();
    });

    it("accepts custom timeout option", () => {
      const server = createServer({ timeout: 60000 });
      expect(server).toBeDefined();
    });

    it("accepts custom maxConcurrent option", () => {
      const server = createServer({ maxConcurrent: 10 });
      expect(server).toBeDefined();
    });
  });
});

describe("BrowserManager", () => {
  describe("constructor", () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
      // Clear env before each test
      delete process.env.PDFN_MAX_CONCURRENT;
      delete process.env.PDFN_TIMEOUT;
    });

    afterEach(() => {
      // Restore env
      process.env = { ...originalEnv };
    });

    it("uses default values when no options or env provided", () => {
      const manager = new BrowserManager();
      expect(manager.getMaxConcurrent()).toBe(5);
      expect(manager.getTimeout()).toBe(30000);
    });

    it("uses options over defaults", () => {
      const manager = new BrowserManager({
        maxConcurrent: 10,
        timeout: 60000,
      });
      expect(manager.getMaxConcurrent()).toBe(10);
      expect(manager.getTimeout()).toBe(60000);
    });

    it("uses env variables when options not provided", () => {
      process.env.PDFN_MAX_CONCURRENT = "15";
      process.env.PDFN_TIMEOUT = "45000";

      const manager = new BrowserManager();
      expect(manager.getMaxConcurrent()).toBe(15);
      expect(manager.getTimeout()).toBe(45000);
    });

    it("options take priority over env variables", () => {
      process.env.PDFN_MAX_CONCURRENT = "15";
      process.env.PDFN_TIMEOUT = "45000";

      const manager = new BrowserManager({
        maxConcurrent: 20,
        timeout: 60000,
      });
      expect(manager.getMaxConcurrent()).toBe(20);
      expect(manager.getTimeout()).toBe(60000);
    });
  });

  describe("state", () => {
    it("starts with 0 active pages", () => {
      const manager = new BrowserManager();
      expect(manager.getActivePages()).toBe(0);
    });

    it("starts disconnected", () => {
      const manager = new BrowserManager();
      expect(manager.isConnected()).toBe(false);
    });
  });

  describe("withPage", () => {
    it("throws when max concurrent reached", async () => {
      const manager = new BrowserManager({ maxConcurrent: 0 });

      await expect(
        manager.withPage(async () => "result")
      ).rejects.toThrow("Server busy - max concurrent requests reached");
    });
  });
});
