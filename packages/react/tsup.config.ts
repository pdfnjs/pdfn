import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    "react",
    "react-dom",
    "@pdfn/client",      // Optional dependency - dynamically imported
    "@pdfn/tailwind",    // Optional dependency
    "@pdfn/core",        // Workspace dependency
  ],
  treeshake: true,
});
