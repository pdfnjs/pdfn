// @pdfn/react - The React framework for PDFs

// Server-only guard - fails at build time in Next.js "use client" files
import "server-only";

// Runtime guard - catches non-Next.js environments
if (typeof window !== "undefined") {
  throw new Error(
    "@pdfn/react is server-only. Do not import it in client components or browser code."
  );
}

// Components
export { Document } from "./components/Document";
export { Page } from "./components/Page";
export { PageBreak } from "./components/PageBreak";
export { AvoidBreak } from "./components/AvoidBreak";
export { PageNumber } from "./components/PageNumber";
export { TotalPages } from "./components/TotalPages";
export { TableHeader } from "./components/TableHeader";

// Functions
export { render } from "./render/render";

// Types
export type * from "./types";
export type { AvoidBreakProps } from "./components/AvoidBreak";
export type { PageNumberProps } from "./components/PageNumber";
export type { TotalPagesProps } from "./components/TotalPages";
export type { TableHeaderProps } from "./components/TableHeader";
