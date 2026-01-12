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
 * Virtual module ID for bundles (resolved by webpack/turbopack alias)
 */
const BUNDLES_MODULE_ID = "__pdfn_bundles__";

/**
 * Template bundle manifest entry
 */
export interface BundleManifestEntry {
  id: string;
  sourcePath: string;
  bundlePath: string;
  bundledAt: string;
  /** Inlined bundle code (for serverless deployment) */
  code?: string;
}

/**
 * Template bundle manifest
 */
export interface BundleManifest {
  version: string;
  templates: Record<string, BundleManifestEntry>;
}

// Cached manifest from module import
let cachedManifest: BundleManifest | null = null;
let manifestLoadAttempted = false;

/**
 * Load the bundle manifest from the virtual module (works on serverless)
 */
async function loadBundleManifestFromModule(): Promise<BundleManifest | null> {
  if (manifestLoadAttempted) {
    return cachedManifest;
  }
  manifestLoadAttempted = true;

  try {
    // Dynamic import from virtual module - this gets resolved by webpack/turbopack alias
    // and the module is traced/bundled for serverless deployment
    const module = await import(/* webpackIgnore: true */ BUNDLES_MODULE_ID);
    cachedManifest = module.manifest || module.default;
    return cachedManifest;
  } catch {
    // Module not available - fall back to filesystem
    return null;
  }
}

/**
 * Load the bundle manifest from filesystem (works locally)
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
 * Get a pre-compiled bundle for a template (async version for serverless)
 */
export async function getPrecompiledBundleAsync(templateId: string, cwd: string): Promise<string | null> {
  // First try loading from virtual module (works on serverless)
  const moduleManifest = await loadBundleManifestFromModule();
  if (moduleManifest && moduleManifest.templates[templateId]) {
    const entry = moduleManifest.templates[templateId];
    if (entry.code) {
      return entry.code;
    }
  }

  // Fall back to filesystem (works locally)
  return getPrecompiledBundle(templateId, cwd);
}

/**
 * Get a pre-compiled bundle for a template (sync version)
 */
export function getPrecompiledBundle(templateId: string, cwd: string): string | null {
  // If we already loaded from module, use cached manifest
  if (cachedManifest && cachedManifest.templates[templateId]) {
    const entry = cachedManifest.templates[templateId];
    if (entry.code) {
      return entry.code;
    }
  }

  // Try filesystem
  const manifest = loadBundleManifest(cwd);

  if (!manifest || !manifest.templates[templateId]) {
    return null;
  }

  const entry = manifest.templates[templateId];

  // First try inlined code (works on serverless)
  if (entry.code) {
    return entry.code;
  }

  // Fall back to reading from file (works locally)
  if (existsSync(entry.bundlePath)) {
    return readFileSync(entry.bundlePath, "utf8");
  }

  return null;
}
