/**
 * Error codes for pdfn operations
 */
export type PdfnErrorCode =
  | "configuration_error"
  | "validation_error"
  | "authentication_error"
  | "rate_limit_error"
  | "timeout_error"
  | "server_error"
  | "network_error"
  | "render_error";

/**
 * Typed error class for pdfn operations
 *
 * All pdfn errors include:
 * - A specific error code for programmatic handling
 * - A human-readable message
 * - An optional suggestion for how to fix the issue
 * - An optional HTTP status code (for server errors)
 */
export class PdfnError extends Error {
  constructor(
    public readonly code: PdfnErrorCode,
    message: string,
    public readonly suggestion?: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = "PdfnError";
    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Factory functions for common pdfn errors
 */
export const Errors = {
  /**
   * No server configuration provided
   */
  configurationRequired: () =>
    new PdfnError(
      "configuration_error",
      "pdfn server configuration required for PDF generation.",
      `Option 1: Local development
  Run: npx pdfn dev
  Initialize: pdfn()

Option 2: pdfn Cloud
  Get API key at: https://console.pdfn.dev
  Initialize: pdfn(process.env.PDFN_API_KEY)`
    ),

  /**
   * Invalid API key
   */
  invalidApiKey: () =>
    new PdfnError(
      "authentication_error",
      "Invalid API key.",
      "Check your PDFN_API_KEY environment variable or get a new key at https://console.pdfn.dev",
      401
    ),

  /**
   * Rate limit exceeded
   */
  rateLimitExceeded: (message: string) =>
    new PdfnError(
      "rate_limit_error",
      `Rate limit exceeded. ${message}`,
      "Upgrade your plan or slow down requests.",
      429
    ),

  /**
   * PDF generation timed out
   */
  timeout: () =>
    new PdfnError(
      "timeout_error",
      "PDF generation timed out.",
      "Try simplifying your template or splitting into smaller documents.",
      504
    ),

  /**
   * Network error connecting to server
   */
  networkError: (host: string, originalError: string) =>
    new PdfnError(
      "network_error",
      `Cannot connect to pdfn server at ${host}`,
      `${originalError}\n\nFor local development, run: npx pdfn dev`
    ),

  /**
   * React render error
   */
  renderError: (message: string) =>
    new PdfnError(
      "render_error",
      `Failed to render: ${message}`,
      "Check your React component for errors."
    ),

  /**
   * Server returned an error
   */
  serverError: (status: number, message: string) =>
    new PdfnError("server_error", message, undefined, status),

  /**
   * Validation error (400)
   */
  validationError: (message: string) =>
    new PdfnError(
      "validation_error",
      message,
      "Check your HTML template for issues.",
      400
    ),
};
