// @pdfn/react - Print-safe HTML and pagination helpers for PDFs
//
// Note: render() uses react-dom/server which only works in Node.js.
// Importing in browser will fail with a clear error from react-dom/server.

// Components
export { Document } from "./components/Document";
export { Page } from "./components/Page";
export { PageBreak } from "./components/PageBreak";
export { AvoidBreak } from "./components/AvoidBreak";
export { PageNumber } from "./components/PageNumber";
export { TotalPages } from "./components/TotalPages";
export { Thead } from "./components/Thead";
export { Tr } from "./components/Tr";

// Functions
export { render } from "./render/render";
export { generate, generateFromHtml } from "./generate";

// Types
export type * from "./types";
export type { AvoidBreakProps } from "./components/AvoidBreak";
export type { PageNumberProps } from "./components/PageNumber";
export type { TotalPagesProps } from "./components/TotalPages";
export type { TheadProps } from "./components/Thead";
export type { TrProps } from "./components/Tr";
export type { GenerateOptions, GenerateFromHtmlOptions } from "./generate";
