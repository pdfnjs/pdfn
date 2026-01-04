import { defineConfig } from "tsup";

export default defineConfig([
  // Main library
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    clean: true,
    sourcemap: true,
    external: ["react", "react-dom"],
    treeshake: true,
  },
  // Debug utilities (separate export)
  {
    entry: ["src/debug/index.ts"],
    outDir: "dist/debug",
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    treeshake: true,
  },
]);
