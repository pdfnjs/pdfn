import { defineConfig } from "tsup";

export default defineConfig({
  // CLI binary
  entry: ["src/cli.ts"],
  format: ["esm"],
  dts: false,
  clean: true,
  sourcemap: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
  external: ["puppeteer", "vite"],
});
