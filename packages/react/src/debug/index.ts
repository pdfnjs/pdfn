/**
 * Debug utilities for PDFN (internal module)
 *
 * Re-exports from @pdfn/core for backwards compatibility.
 * The actual implementation is in @pdfn/core/debug.
 *
 * @internal Used by render() - not exported publicly
 */

// Re-export everything from @pdfn/core
export {
  injectDebugSupport,
  PDFN_DEBUG_CSS,
  ALL_DEBUG_OPTIONS,
  type DebugOptions,
} from "@pdfn/core";
