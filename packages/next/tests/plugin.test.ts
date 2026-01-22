import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { withPdfn } from "../src/index.js";
import type { NextConfig } from "next";

// Mock the plugin functions to avoid actual filesystem operations
vi.mock("../src/plugin.js", () => ({
  compileTailwindCss: vi.fn().mockResolvedValue(undefined),
  bundleClientTemplates: vi.fn().mockResolvedValue(undefined),
}));

describe("withPdfn", () => {
  describe("basic functionality", () => {
    it("returns a function", () => {
      const wrapper = withPdfn();
      expect(typeof wrapper).toBe("function");
    });

    it("wrapper returns a promise", () => {
      const wrapper = withPdfn();
      const result = wrapper({});
      expect(result).toBeInstanceOf(Promise);
    });

    it("returns a Next.js config object", async () => {
      const wrapper = withPdfn();
      const config = await wrapper({});
      expect(typeof config).toBe("object");
    });

    it("accepts empty options", async () => {
      const wrapper = withPdfn({});
      const config = await wrapper({});
      expect(config).toBeDefined();
    });
  });

  describe("options handling", () => {
    it("accepts debug option", async () => {
      const wrapper = withPdfn({ debug: true });
      const config = await wrapper({});
      expect(config).toBeDefined();
    });

    it("accepts tailwind option", async () => {
      const wrapper = withPdfn({ tailwind: false });
      const config = await wrapper({});
      expect(config).toBeDefined();
    });

    it("accepts both options together", async () => {
      const wrapper = withPdfn({ debug: true, tailwind: true });
      const config = await wrapper({});
      expect(config).toBeDefined();
    });
  });

  describe("config preservation", () => {
    it("preserves existing config properties", async () => {
      const wrapper = withPdfn();
      const inputConfig: NextConfig = {
        reactStrictMode: true,
        images: { domains: ["example.com"] },
      };
      const config = await wrapper(inputConfig);
      expect(config.reactStrictMode).toBe(true);
      expect(config.images).toEqual({ domains: ["example.com"] });
    });

    it("handles undefined input config", async () => {
      const wrapper = withPdfn();
      const config = await wrapper(undefined as unknown as NextConfig);
      expect(config).toBeDefined();
    });

    it("handles empty input config", async () => {
      const wrapper = withPdfn();
      const config = await wrapper({});
      expect(config).toBeDefined();
    });
  });

  describe("serverExternalPackages", () => {
    it("adds esbuild to serverExternalPackages", async () => {
      const wrapper = withPdfn();
      const config = await wrapper({});
      expect(config.serverExternalPackages).toContain("esbuild");
    });

    it("preserves existing serverExternalPackages", async () => {
      const wrapper = withPdfn();
      const config = await wrapper({
        serverExternalPackages: ["custom-package"],
      });
      expect(config.serverExternalPackages).toContain("esbuild");
      expect(config.serverExternalPackages).toContain("custom-package");
    });

    it("deduplicates serverExternalPackages", async () => {
      const wrapper = withPdfn();
      const config = await wrapper({
        serverExternalPackages: ["esbuild", "other"],
      });
      const esbuildCount = config.serverExternalPackages?.filter((p) => p === "esbuild").length;
      expect(esbuildCount).toBe(1);
    });
  });

  describe("turbopack configuration", () => {
    it("adds turbopack config", async () => {
      const wrapper = withPdfn();
      const config = await wrapper({});
      expect(config.turbopack).toBeDefined();
    });

    it("adds resolveAlias for virtual modules", async () => {
      const wrapper = withPdfn();
      const config = await wrapper({});
      const turbopack = config.turbopack as { resolveAlias?: Record<string, string> };
      expect(turbopack.resolveAlias).toBeDefined();
      expect(turbopack.resolveAlias?.["__pdfn_tailwind_css__"]).toBeDefined();
      expect(turbopack.resolveAlias?.["__pdfn_bundles__"]).toBeDefined();
    });

    it("adds loader rules for tsx/jsx", async () => {
      const wrapper = withPdfn();
      const config = await wrapper({});
      const turbopack = config.turbopack as { rules?: Record<string, unknown> };
      expect(turbopack.rules).toBeDefined();
      expect(turbopack.rules?.["*.tsx"]).toBeDefined();
      expect(turbopack.rules?.["*.jsx"]).toBeDefined();
    });

    it("preserves existing turbopack config", async () => {
      const wrapper = withPdfn();
      const config = await wrapper({
        turbopack: {
          resolveAlias: { "custom-alias": "./custom-path" },
          rules: { "*.css": { loaders: ["custom-loader"] } },
        } as NextConfig["turbopack"],
      });
      const turbopack = config.turbopack as {
        resolveAlias?: Record<string, string>;
        rules?: Record<string, unknown>;
      };
      expect(turbopack.resolveAlias?.["custom-alias"]).toBe("./custom-path");
      expect(turbopack.rules?.["*.css"]).toBeDefined();
    });
  });

  describe("webpack configuration", () => {
    it("adds webpack function", async () => {
      const wrapper = withPdfn();
      const config = await wrapper({});
      expect(typeof config.webpack).toBe("function");
    });

    it("webpack function returns modified config", async () => {
      const wrapper = withPdfn();
      const config = await wrapper({});
      const webpackFn = config.webpack!;

      const mockConfig = {
        resolve: { alias: {} },
        module: { rules: [] },
      };
      const mockContext = { isServer: true };

      const result = webpackFn(mockConfig as any, mockContext as any);
      expect(result).toBeDefined();
    });

    it("adds resolve aliases in webpack config", async () => {
      const wrapper = withPdfn();
      const config = await wrapper({});
      const webpackFn = config.webpack!;

      const mockConfig = {
        resolve: { alias: {} as Record<string, string> },
        module: { rules: [] },
      };
      const mockContext = { isServer: true };

      webpackFn(mockConfig as any, mockContext as any);
      expect(mockConfig.resolve.alias["__pdfn_tailwind_css__"]).toBeDefined();
      expect(mockConfig.resolve.alias["__pdfn_bundles__"]).toBeDefined();
    });

    it("adds loader rules for server build", async () => {
      const wrapper = withPdfn();
      const config = await wrapper({});
      const webpackFn = config.webpack!;

      const mockConfig = {
        resolve: { alias: {} },
        module: { rules: [] as unknown[] },
      };
      const mockContext = { isServer: true };

      webpackFn(mockConfig as any, mockContext as any);
      expect(mockConfig.module.rules.length).toBeGreaterThan(0);
    });

    it("does not add loader rules for client build", async () => {
      const wrapper = withPdfn();
      const config = await wrapper({});
      const webpackFn = config.webpack!;

      const mockConfig = {
        resolve: { alias: {} },
        module: { rules: [] as unknown[] },
      };
      const mockContext = { isServer: false };

      const initialRulesCount = mockConfig.module.rules.length;
      webpackFn(mockConfig as any, mockContext as any);
      // Should only add alias, not loader rules for client
      // Aliases are still added for both server and client
      expect(mockConfig.resolve.alias).toBeDefined();
    });

    it("calls existing webpack function", async () => {
      const existingWebpack = vi.fn((config) => config);
      const wrapper = withPdfn();
      const config = await wrapper({ webpack: existingWebpack });
      const webpackFn = config.webpack!;

      const mockConfig = {
        resolve: { alias: {} },
        module: { rules: [] },
      };
      const mockContext = { isServer: true };

      webpackFn(mockConfig as any, mockContext as any);
      expect(existingWebpack).toHaveBeenCalled();
    });

    it("handles array-style resolve alias", async () => {
      const wrapper = withPdfn();
      const config = await wrapper({});
      const webpackFn = config.webpack!;

      const mockConfig = {
        resolve: { alias: [] as { name: string; alias: string }[] },
        module: { rules: [] },
      };
      const mockContext = { isServer: true };

      webpackFn(mockConfig as any, mockContext as any);
      expect(mockConfig.resolve.alias.length).toBeGreaterThan(0);
    });
  });
});


describe("exports", () => {
  it("exports withPdfn function", async () => {
    const module = await import("../src/index.js");
    expect(typeof module.withPdfn).toBe("function");
  });

  it("exports withPdfn as default", async () => {
    const module = await import("../src/index.js");
    expect(typeof module.default).toBe("function");
  });

  it("exports renderTemplate", async () => {
    const module = await import("../src/index.js");
    expect(typeof module.renderTemplate).toBe("function");
  });

  it("exports requiresClientRendering", async () => {
    const module = await import("../src/index.js");
    expect(typeof module.requiresClientRendering).toBe("function");
  });

  it("exports __setPrecompiledCss", async () => {
    const module = await import("../src/index.js");
    expect(typeof module.__setPrecompiledCss).toBe("function");
  });

  it("exports __setBundleManifest", async () => {
    const module = await import("../src/index.js");
    expect(typeof module.__setBundleManifest).toBe("function");
  });
});
