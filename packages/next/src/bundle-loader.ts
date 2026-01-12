/**
 * Runtime bundle loading for pre-compiled templates
 *
 * This module contains only the runtime code for loading pre-compiled bundles.
 * The build-time bundling code (using esbuild) is in plugin.ts and should only
 * be imported during next.config.ts loading, not at runtime.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Module path for pre-compiled template bundles
 */
export const BUNDLES_DIR = ".pdfn/bundles";

/**
 * Manifest file for bundled templates
 */
export const BUNDLES_MANIFEST = ".pdfn/bundles/manifest.json";

/**
 * Template bundle manifest entry
 */
export interface BundleManifestEntry {
  id: string;
  sourcePath: string;
  bundlePath: string;
  bundledAt: string;
}

/**
 * Template bundle manifest
 */
export interface BundleManifest {
  version: string;
  templates: Record<string, BundleManifestEntry>;
}

/**
 * Load the bundle manifest
 */
export function loadBundleManifest(cwd: string): BundleManifest | null {
  const manifestPath = join(cwd, "node_modules", BUNDLES_MANIFEST);

  if (!existsSync(manifestPath)) {
    return null;
  }

  try {
    const content = readFileSync(manifestPath, "utf8");
    return JSON.parse(content) as BundleManifest;
  } catch {
    return null;
  }
}

/**
 * Get a pre-compiled bundle for a template
 */
export function getPrecompiledBundle(templateId: string, cwd: string): string | null {
  const manifest = loadBundleManifest(cwd);

  if (!manifest || !manifest.templates[templateId]) {
    return null;
  }

  const entry = manifest.templates[templateId];

  if (!existsSync(entry.bundlePath)) {
    return null;
  }

  return readFileSync(entry.bundlePath, "utf8");
}
