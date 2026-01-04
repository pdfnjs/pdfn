/**
 * Simple debug logging utility
 *
 * Enable with DEBUG=pdfn:react or DEBUG=pdfn:* or DEBUG=pdfn
 *
 * This is a lightweight alternative to the `debug` npm package.
 * Supports namespace filtering similar to the debug package convention.
 */

// Debug logging - enable with DEBUG=pdfn:react or DEBUG=pdfn:* or DEBUG=pdfn
const debugEnv = process.env.DEBUG ?? "";
const isEnabled =
  debugEnv.includes("pdfn:react") ||
  debugEnv.includes("pdfn:*") ||
  debugEnv === "pdfn" ||
  debugEnv.includes("pdfn,") ||
  debugEnv.endsWith(",pdfn");

/**
 * Debug logger - only logs when DEBUG=pdfn:react (or pdfn:* or pdfn) is set
 */
export const debug = isEnabled
  ? (message: string, ...args: unknown[]) => {
      console.log(`[pdfn:react] ${message}`, ...args);
    }
  : () => {};

/**
 * Check if debug logging is enabled
 */
export const isDebugEnabled = () => isEnabled;
