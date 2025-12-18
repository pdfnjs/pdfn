import { type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { assembleHtml, type HtmlOptions } from "./html";
import { processTailwind, type TailwindOptions } from "./tailwind";
import type { RenderOptions } from "../types";

export interface RenderResult {
  /** The complete HTML string */
  html: string;
  /** Timing metrics */
  metrics: {
    react: number;
    tailwind: number;
    total: number;
  };
}

/**
 * Render a React component to a self-contained HTML string
 *
 * This function takes a React element (typically a Document component)
 * and renders it to a complete HTML document suitable for PDF generation.
 *
 * @example
 * ```tsx
 * import { render, Document, Page } from '@pdfx-dev/react';
 *
 * const html = await render(
 *   <Document title="Invoice">
 *     <Page>
 *       <h1>Invoice #001</h1>
 *     </Page>
 *   </Document>
 * );
 * ```
 *
 * @param element - React element to render (should be a Document component)
 * @param options - Render options
 * @returns Promise resolving to the complete HTML string
 */
export async function render(
  element: ReactElement,
  options: RenderOptions = {}
): Promise<string> {
  const startTime = performance.now();

  // 1. Render React to static HTML
  const reactStart = performance.now();
  const content = renderToStaticMarkup(element);
  const reactTime = performance.now() - reactStart;

  // 2. Extract metadata from Document component props
  const metadata = extractMetadata(element);

  // 3. Process Tailwind CSS
  const tailwindStart = performance.now();
  const tailwindOptions: TailwindOptions = {};
  if (typeof options.tailwind === "string") {
    tailwindOptions.config = options.tailwind;
  } else if (typeof options.tailwind === "object") {
    tailwindOptions.configObject = options.tailwind;
  }
  const tailwindCss = await processTailwind(content, tailwindOptions);
  const tailwindTime = performance.now() - tailwindStart;

  // 4. Assemble final HTML
  const htmlOptions: HtmlOptions = {
    metadata,
    css: tailwindCss,
    includePagedJs: true,
    debug: options.debug,
  };

  const html = assembleHtml(content, htmlOptions);

  const totalTime = performance.now() - startTime;

  // Log metrics in development
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[@pdfx-dev/react] Render: ${totalTime.toFixed(0)}ms ` +
        `(React: ${reactTime.toFixed(0)}ms, Tailwind: ${tailwindTime.toFixed(0)}ms)`
    );
  }

  return html;
}

/**
 * Extract metadata from Document component props
 */
function extractMetadata(element: ReactElement): HtmlOptions["metadata"] {
  // Check if element is a Document component
  if (element.props) {
    const { title, author, subject, keywords, language } = element.props as {
      title?: string;
      author?: string;
      subject?: string;
      keywords?: string[];
      language?: string;
    };
    return { title, author, subject, keywords, language };
  }
  return {};
}

export { type RenderOptions };
