import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";

/**
 * Load environment variables following Vite's pattern.
 * Priority (later overrides earlier):
 * .env → .env.local → .env.[mode] → .env.[mode].local
 *
 * @param mode - Environment mode (e.g., "development", "production")
 */
export function loadEnv(mode: string): void {
  const cwd = process.cwd();

  // Files in order of priority (first loaded = lowest priority)
  const envFiles = [
    ".env",
    ".env.local",
    `.env.${mode}`,
    `.env.${mode}.local`,
  ];

  for (const file of envFiles) {
    const filePath = resolve(cwd, file);
    if (existsSync(filePath)) {
      // quiet: true suppresses dotenv's verbose output in v17+
      config({ path: filePath, override: true, quiet: true });
    }
  }
}
