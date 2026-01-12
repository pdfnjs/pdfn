import { defineConfig } from "tsup";
import { copyFileSync } from "node:fs";

export default defineConfig({
  entry: ["src/index.ts", "src/plugin.ts", "src/render-template.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  external: ["next", "tailwindcss", "fast-glob"],
  onSuccess: async () => {
    // Copy the CommonJS loader to dist
    copyFileSync("src/transform-loader.cjs", "dist/transform-loader.cjs");
  },
});
