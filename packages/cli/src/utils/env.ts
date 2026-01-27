import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";

/**
 * Load environment variables.
 * Always loads: .env → .env.local
 * With mode: also loads .env.[mode] → .env.[mode].local
 *
 * @param mode - Optional environment mode (e.g., "production")
 */
export function loadEnv(mode?: string): void {
  const cwd = process.cwd();

  // Always load base env files
  const envFiles: string[] = [".env", ".env.local"];

  // Optionally load mode-specific files
  if (mode) {
    envFiles.push(`.env.${mode}`, `.env.${mode}.local`);
  }

  // Deduplicate (e.g. --mode local would produce .env.local twice)
  const unique = [...new Set(envFiles)];

  for (const file of unique) {
    const filePath = resolve(cwd, file);
    if (existsSync(filePath)) {
      // quiet: true suppresses dotenv's verbose output in v17+
      config({ path: filePath, override: true, quiet: true });
    }
  }
}
