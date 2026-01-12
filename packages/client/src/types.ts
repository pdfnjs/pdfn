import type { ReactElement } from "react";

// Re-export PageConfig from @pdfn/core
export type { PageConfig } from "@pdfn/core";

/**
 * A React component function that has been marked by the pdfn client marker plugin.
 * The marker is added at build time to components with "use client" directive.
 */
export interface MarkedComponent {
  __pdfn_client?: boolean;
  __pdfn_source?: string;
}

/**
 * A React component function that has been marked as a template.
 * The marker is added at build time to template files in pdfn-templates/.
 */
export interface MarkedTemplate {
  __pdfn_template_source?: string;
}

/**
 * Extended React element type that may have marked component types
 */
export interface PdfnReactElement extends ReactElement {
  type: ReactElement["type"] & MarkedComponent & MarkedTemplate;
}

/**
 * Result of scanning a React element tree for client components
 */
export interface ClientComponentInfo {
  /** Whether any client components were found */
  hasClient: boolean;
  /** File paths of client components (from __pdfn_source) */
  sources: string[];
  /** Template source path if the root element is a marked template */
  templateSource?: string;
}

/**
 * Options for rendering with client components
 */
export interface RenderForClientOptions {
  /** Template source file path (preferred - bundles entire template) */
  templateSource?: string;
  /** File paths of client components to bundle (fallback) */
  clientSources?: string[];
  /** Props to pass to the root component */
  props?: Record<string, unknown>;
  /** Document title for the HTML */
  title?: string;
  /** Additional CSS to include */
  css?: string;
  /** Base directory for resolving imports */
  baseDir?: string;
  /** SSR content for extracting page configuration */
  ssrContent?: string;
}

/**
 * Options for bundling client components
 */
export interface BundleOptions {
  /** Template source file path (preferred - has default export) */
  templateSource?: string;
  /** File paths of client components to bundle (fallback - has named exports) */
  clientSources?: string[];
  /** Props to serialize into the bundle */
  props?: Record<string, unknown>;
  /** Base directory for resolving imports */
  baseDir?: string;
}
