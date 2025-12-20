/**
 * Simple debug logging utility
 *
 * Enable with: DEBUG=pdfx node script.js
 *
 * This is a lightweight alternative to the `debug` npm package.
 * If more advanced features are needed (namespaces, colors, filtering),
 * consider switching to the `debug` package.
 */

const isEnabled = process.env.DEBUG?.includes("pdfx") ?? false;

/**
 * Debug logger - only logs when DEBUG=pdfx is set
 */
export const debug = isEnabled
  ? (message: string, ...args: unknown[]) => {
      const timestamp = new Date().toISOString().split("T")[1].slice(0, -1);
      console.log(`[pdfx ${timestamp}]`, message, ...args);
    }
  : () => {};

/**
 * Check if debug logging is enabled
 */
export const isDebugEnabled = () => isEnabled;
