import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    clean: true,
    sourcemap: true,
    banner: {
      js: "#!/usr/bin/env node",
    },
    external: ["puppeteer", "vite"],
  },
  {
    entry: ["src/server/index.ts"],
    outDir: "dist/server",
    format: ["esm"],
    dts: true,
    sourcemap: true,
    external: ["puppeteer", "vite"],
  },
]);
