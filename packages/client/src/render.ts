import type { ReactElement } from "react";
import { bundleForClient } from "./bundle.js";
import { generateClientHtml } from "./html.js";
import type { RenderForClientOptions } from "./types.js";
import { extractPageConfig } from "@pdfn/core";

/**
 * Render a React template that contains client components.
 *
 * This function:
 * 1. Bundles the template (or client components) with esbuild
 * 2. Generates an HTML shell that loads React in the browser
 * 3. Returns HTML that will render correctly in Puppeteer
 *
 * Unlike renderToStaticMarkup, this approach allows hooks to execute
 * because React runs in a real browser environment (Puppeteer).
 *
 * @param element - The React element to render (used for props extraction)
 * @param options - Render options including template or client sources
 * @returns Promise resolving to HTML string
 *
 * @example
 * ```ts
 * import { renderForClient } from '@pdfn/client';
 *
 * // Preferred: use templateSource for templates with default export
 * const html = await renderForClient(<Report data={data} />, {
 *   templateSource: '/path/to/report.tsx',
 *   title: 'Sales Report'
 * });
 *
 * // Fallback: use clientSources (less reliable)
 * const html = await renderForClient(<Report data={data} />, {
 *   clientSources: ['/path/to/Charts.tsx'],
 *   title: 'Sales Report'
 * });
 * ```
 */
export async function renderForClient(
  element: ReactElement,
  options: RenderForClientOptions
): Promise<string> {
  const { templateSource, clientSources = [], props, title, css, baseDir, ssrContent } = options;

  // Need at least one source
  if (!templateSource && clientSources.length === 0) {
    throw new Error(
      "[pdfn/client] No sources provided. " +
        "Ensure your template is marked with the pdfn Vite plugin."
    );
  }

  // Extract props from the element if not provided
  const renderProps = props ?? (element.props as Record<string, unknown>) ?? {};

  // Log what we're bundling
  if (templateSource) {
    console.log(`[pdfn/client] Bundling template: ${templateSource}`);
  } else {
    console.log(`[pdfn/client] Bundling ${clientSources.length} client component(s)...`);
  }

  // Bundle components
  const bundleCode = await bundleForClient({
    templateSource,
    clientSources,
    props: renderProps,
    baseDir,
  });

  // Extract page configuration from SSR content if available
  const pageConfig = ssrContent ? extractPageConfig(ssrContent) : undefined;
  if (pageConfig) {
    console.log(`[pdfn/client] Page config: ${pageConfig.width} x ${pageConfig.height}, margin: ${pageConfig.margin || "default"}`);
  }

  // Generate HTML shell
  const html = generateClientHtml({
    bundleCode,
    title,
    css,
    pageConfig,
  });

  console.log("[pdfn/client] Client render HTML generated");

  return html;
}
