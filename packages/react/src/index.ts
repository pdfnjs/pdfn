// @pdfn/react - Print-safe HTML and pagination helpers for PDFs
//
// Note: render() uses react-dom/server which only works in Node.js.
// Importing in browser will fail with a clear error from react-dom/server.

// Client factory (main API)
export { pdfn } from "./client";
export type { PdfnConfig, PdfnClient } from "./client";

// Components
export { Document } from "./components/Document";
export { Page } from "./components/Page";
export { PageBreak } from "./components/PageBreak";
export { AvoidBreak } from "./components/AvoidBreak";
export { PageNumber } from "./components/PageNumber";
export { TotalPages } from "./components/TotalPages";
export { Thead } from "./components/Thead";
export { Tr } from "./components/Tr";

// Error types
export { PdfnError, Errors } from "./errors";
export type { PdfnErrorCode } from "./errors";

// Response types
export type {
  PdfnResponse,
  GenerateData,
  GenerateResponse,
  RenderData,
  RenderResponse,
} from "./types/responses";

// Option types
export type {
  GenerateOptions,
  RenderOptions,
  GenerateInput,
  RenderInput,
} from "./types/options";

// Types
export type {
  DocumentProps,
  PageProps,
  PageSize,
  MarginConfig,
  FontConfig,
  WatermarkConfig,
  PDFStandard,
  DebugOptions,
} from "./types";

// Component prop types
export type { AvoidBreakProps } from "./components/AvoidBreak";
export type { PageNumberProps } from "./components/PageNumber";
export type { TotalPagesProps } from "./components/TotalPages";
export type { TheadProps } from "./components/Thead";
export type { TrProps } from "./components/Tr";
