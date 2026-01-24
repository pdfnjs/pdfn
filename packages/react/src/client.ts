import type { ReactElement } from "react";
import type { GenerateOptions, RenderOptions } from "./types/options";
import type {
  GenerateResponse,
  RenderResponse,
  GenerateData,
} from "./types/responses";
import { PdfnError, Errors } from "./errors";
import { render as renderInternal } from "./render/render";
import type { PDFStandard } from "./types";

const DEFAULT_LOCAL_HOST = "http://localhost:3456";
const PDFN_CLOUD_URL = "https://api.pdfn.dev";
const GENERATE_ENDPOINT = "/v1/pdfs";

/**
 * Configuration options for the pdfn client
 */
export interface PdfnConfig {
  /** API key for authentication (sent to any endpoint) */
  apiKey?: string;
  /** Custom server URL (defaults to pdfn Cloud if apiKey is set, localhost if not) */
  baseUrl?: string;
  /** Request timeout in ms (default: 30000) */
  timeout?: number;
}

/**
 * HTML input configuration for generate()
 */
export interface HtmlConfig {
  /** HTML string to convert to PDF */
  html: string;
  /** PDF document metadata */
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creator?: string;
  };
  /** PDF/A or PDF/UA standard */
  standard?: PDFStandard;
  /** Filename for Content-Disposition header */
  filename?: string;
  /** Idempotency key for deduplication */
  idempotencyKey?: string;
}

/**
 * The pdfn client for PDF generation
 */
export interface PdfnClient {
  /**
   * Generate PDF from a React component
   *
   * @example
   * ```typescript
   * const { data, error } = await client.generate(<Invoice data={...} />);
   * if (!error) {
   *   fs.writeFileSync('invoice.pdf', data.buffer);
   * }
   * ```
   */
  generate(
    element: ReactElement,
    options?: GenerateOptions
  ): Promise<GenerateResponse>;

  /**
   * Generate PDF from an HTML string
   *
   * @example
   * ```typescript
   * const { data, error } = await client.generate({
   *   html: '<h1>Hello World</h1>',
   *   metadata: { title: 'My PDF' },
   * });
   * ```
   */
  generate(config: HtmlConfig): Promise<GenerateResponse>;

  /**
   * Render React component to HTML (no server required)
   *
   * Use this for preview or when you have your own Puppeteer setup.
   *
   * @example
   * ```typescript
   * const { data, error } = await client.render(<Invoice />);
   * if (!error) {
   *   console.log(data.html);
   * }
   * ```
   */
  render(element: ReactElement, options?: RenderOptions): Promise<RenderResponse>;
}

/**
 * Resolved configuration after parsing input
 */
interface ResolvedConfig {
  apiKey?: string;
  baseUrl: string;
  timeout: number;
}

/**
 * Server API response format
 */
interface ServerResponse {
  object: "generation";
  id: string;
  standard?: PDFStandard;
  size_bytes: number;
  duration_ms: number;
  created_at: string;
  pdf_base64: string;
}

/**
 * Create a pdfn client for PDF generation
 *
 * The client automatically reads the `PDFN_API_KEY` environment variable.
 * If set, it connects to pdfn Cloud. If not, it falls back to localhost:3456.
 *
 * @example Auto-detect (reads PDFN_API_KEY env var, falls back to localhost)
 * ```typescript
 * const client = pdfn();
 * ```
 *
 * @example Explicit API key
 * ```typescript
 * const client = pdfn('pdfn_live_...');
 * ```
 *
 * @example Custom server (no auth)
 * ```typescript
 * const client = pdfn({ baseUrl: 'https://my-pdfn-server.com' });
 * ```
 *
 * @example Custom server with auth
 * ```typescript
 * const client = pdfn({
 *   baseUrl: 'https://my-pdfn-server.com',
 *   apiKey: process.env.PDFN_API_KEY,
 * });
 * ```
 */
export function pdfn(): PdfnClient;
export function pdfn(apiKey: string): PdfnClient;
export function pdfn(config: PdfnConfig): PdfnClient;
export function pdfn(configOrKey?: string | PdfnConfig): PdfnClient {
  // Parse config
  let config: PdfnConfig;

  if (typeof configOrKey === "string") {
    // Shorthand: pdfn('api_key') → pdfn Cloud
    config = { apiKey: configOrKey };
  } else if (configOrKey) {
    config = configOrKey;
  } else {
    // No args - auto-read from PDFN_API_KEY env var, fallback to local dev
    const envKey =
      typeof process !== "undefined" ? process.env?.PDFN_API_KEY : undefined;
    config = envKey ? { apiKey: envKey } : {};
  }

  // Resolve baseUrl:
  // 1. If baseUrl is explicitly set, use it
  // 2. If apiKey is set (but no baseUrl), use pdfn Cloud
  // 3. Otherwise, use localhost for local dev
  const baseUrl =
    config.baseUrl ||
    (config.apiKey ? PDFN_CLOUD_URL : DEFAULT_LOCAL_HOST);

  const resolvedConfig: ResolvedConfig = {
    apiKey: config.apiKey,
    baseUrl,
    timeout: config.timeout ?? 30000,
  };

  return createClient(resolvedConfig);
}

/**
 * Type guard to check if input is an HtmlConfig
 */
function isHtmlConfig(input: ReactElement | HtmlConfig): input is HtmlConfig {
  return (
    typeof input === "object" &&
    input !== null &&
    "html" in input &&
    typeof (input as HtmlConfig).html === "string"
  );
}

/**
 * Create the client implementation
 */
function createClient(config: ResolvedConfig): PdfnClient {
  return {
    async generate(
      elementOrConfig: ReactElement | HtmlConfig,
      options: GenerateOptions = {}
    ): Promise<GenerateResponse> {
      const startTime = performance.now();

      try {
        let html: string;

        // Handle HTML string input
        if (isHtmlConfig(elementOrConfig)) {
          html = elementOrConfig.html;
          // Merge metadata from HtmlConfig into options
          if (elementOrConfig.metadata) {
            options.metadata = { ...options.metadata, ...elementOrConfig.metadata };
          }
          if (elementOrConfig.standard) {
            options.standard = elementOrConfig.standard;
          }
          if (elementOrConfig.filename) {
            options.filename = elementOrConfig.filename;
          }
          if (elementOrConfig.idempotencyKey) {
            options.idempotencyKey = elementOrConfig.idempotencyKey;
          }
        } else {
          // Render React element to HTML
          const renderResult = await renderInternal(elementOrConfig, {
            debug: options.debug,
          });
          html = renderResult;
        }

        const url = `${config.baseUrl}${GENERATE_ENDPOINT}`;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Accept: "application/json",
        };

        // Send API key via Authorization header
        if (config.apiKey) {
          headers["Authorization"] = `Bearer ${config.apiKey}`;
        }

        // Add idempotency key if provided
        if (options.idempotencyKey) {
          headers["Idempotency-Key"] = options.idempotencyKey;
        }

        // Build request body
        const body: {
          html: string;
          standard?: PDFStandard;
          filename?: string;
          metadata?: GenerateOptions["metadata"];
        } = { html };

        if (options.standard) {
          body.standard = options.standard;
        }
        if (options.filename) {
          body.filename = options.filename;
        }
        if (options.metadata) {
          body.metadata = options.metadata;
        }

        const timeout = options.timeout ?? config.timeout;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        let response: Response;
        try {
          response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
            signal: controller.signal,
          });
        } catch (error) {
          clearTimeout(timeoutId);
          const message = error instanceof Error ? error.message : "Unknown error";

          if (error instanceof Error && error.name === "AbortError") {
            return { data: null, error: Errors.timeout() };
          }

          return {
            data: null,
            error: Errors.networkError(config.baseUrl, message),
          };
        }
        clearTimeout(timeoutId);

        if (!response.ok) {
          const isCloudServer = config.baseUrl === PDFN_CLOUD_URL;
          return {
            data: null,
            error: await parseErrorResponse(response, !isCloudServer),
          };
        }

        // Parse JSON response
        const serverResponse = (await response.json()) as ServerResponse;
        const totalTime = performance.now() - startTime;

        // Decode base64 PDF
        const buffer = Buffer.from(serverResponse.pdf_base64, "base64");

        const data: GenerateData = {
          buffer,
          id: serverResponse.id,
          metrics: {
            durationMs: serverResponse.duration_ms || Math.round(totalTime),
            sizeBytes: serverResponse.size_bytes || buffer.length,
          },
          standard: serverResponse.standard,
          createdAt: serverResponse.created_at,
        };

        return { data, error: null };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
          data: null,
          error: Errors.renderError(message),
        };
      }
    },

    async render(
      element: ReactElement,
      options: RenderOptions = {}
    ): Promise<RenderResponse> {
      const startTime = performance.now();

      try {
        const html = await renderInternal(element, {
          debug: options.debug,
        });
        const totalTime = performance.now() - startTime;

        return {
          data: {
            html,
            metrics: {
              totalTime: Math.round(totalTime),
            },
          },
          error: null,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
          data: null,
          error: Errors.renderError(message),
        };
      }
    },
  };
}

/**
 * Parse error response from server
 */
async function parseErrorResponse(
  response: Response,
  isCustomServer: boolean
): Promise<PdfnError> {
  let errorMessage: string;
  try {
    const errorBody = await response.json();
    errorMessage = errorBody.message || errorBody.error || response.statusText;
  } catch {
    errorMessage = response.statusText;
  }

  const serverName = isCustomServer ? "pdfn server" : "pdfn Cloud";

  switch (response.status) {
    case 400:
      return Errors.validationError(`${serverName}: ${errorMessage}`);
    case 401:
      return Errors.invalidApiKey();
    case 429:
      return Errors.rateLimitExceeded(errorMessage);
    case 504:
      return Errors.timeout();
    default:
      return Errors.serverError(
        response.status,
        `${serverName} error (${response.status}): ${errorMessage}`
      );
  }
}
