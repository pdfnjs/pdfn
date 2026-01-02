import { defineConfig } from "tsup";

export default defineConfig([
  // CLI binary
  {
    entry: ["src/cli.ts"],
    format: ["esm"],
    dts: false,
    sourcemap: true,
    banner: {
      js: "#!/usr/bin/env node",
    },
    external: ["puppeteer", "vite"],
  },
  // Library API (generate function)
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    clean: true,
    sourcemap: true,
    external: ["puppeteer", "vite", "@pdfn/react"],
  },
  // Server utilities (advanced use)
  {
    entry: ["src/server/index.ts"],
    outDir: "dist/server",
    format: ["esm"],
    dts: true,
    sourcemap: true,
    external: ["puppeteer", "vite"],
  },
]);
