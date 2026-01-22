import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    testTimeout: 30000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
    },
    // Use projects for different environments
    projects: [
      {
        extends: true,
        test: {
          name: "react-tests",
          environment: "jsdom",
          include: ["tests/**/*.test.tsx"],
        },
      },
      {
        extends: true,
        test: {
          name: "node-tests",
          environment: "node",
          include: ["tests/**/*.test.ts"],
        },
      },
    ],
  },
});
