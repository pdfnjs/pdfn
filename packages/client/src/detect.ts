import React, { Children, isValidElement, type ReactElement } from "react";
import type { ClientComponentInfo, MarkedComponent, MarkedTemplate, PdfnReactElement } from "./types.js";

/**
 * Check if a React element type is marked as a client component
 */
function isMarkedClientComponent(type: unknown): type is MarkedComponent {
  if (!type || typeof type !== "function") return false;
  const marked = type as MarkedComponent;
  return marked.__pdfn_client === true && typeof marked.__pdfn_source === "string";
}

/**
 * Check if a React element type is marked as a template
 */
function isMarkedTemplate(type: unknown): type is MarkedTemplate {
  if (!type || typeof type !== "function") return false;
  const marked = type as MarkedTemplate;
  return typeof marked.__pdfn_template_source === "string";
}

/**
 * Recursively scan a React element tree for client components.
 *
 * Client components are marked at build time by the pdfn Vite plugin,
 * which adds __pdfn_client and __pdfn_source properties to components
 * that have the "use client" directive.
 *
 * Also checks if the root element is a marked template (has __pdfn_template_source).
 *
 * @param element - The root React element to scan
 * @returns Information about found client components and template source
 *
 * @example
 * ```tsx
 * const { hasClient, templateSource } = findClientComponents(<Report />);
 * if (hasClient && templateSource) {
 *   // Bundle the template for client-side rendering
 * }
 * ```
 */
export function findClientComponents(element: ReactElement): ClientComponentInfo {
  const sources: string[] = [];
  const seen = new Set<string>();
  let templateSource: string | undefined;

  // Check if root element is a marked template
  if (isValidElement(element)) {
    const pdfnElement = element as PdfnReactElement;
    if (isMarkedTemplate(pdfnElement.type)) {
      templateSource = pdfnElement.type.__pdfn_template_source;
    }
  }

  function traverse(el: ReactElement | null | undefined): void {
    if (!el || !isValidElement(el)) return;

    const pdfnElement = el as PdfnReactElement;

    // Check if this component is marked as client
    if (isMarkedClientComponent(pdfnElement.type)) {
      const source = pdfnElement.type.__pdfn_source!;
      // Avoid duplicates
      if (!seen.has(source)) {
        seen.add(source);
        sources.push(source);
      }
    }

    // Recursively check children
    const props = pdfnElement.props as { children?: React.ReactNode };
    const children = props?.children;
    if (children) {
      Children.toArray(children).forEach((child) => {
        if (isValidElement(child)) {
          traverse(child as ReactElement);
        }
      });
    }
  }

  traverse(element);

  return {
    hasClient: sources.length > 0,
    sources,
    templateSource,
  };
}

/**
 * Quick check if an element tree has any client components.
 * More efficient than findClientComponents when you only need a boolean.
 */
export function hasClientComponents(element: ReactElement): boolean {
  function check(el: ReactElement | null | undefined): boolean {
    if (!el || !isValidElement(el)) return false;

    const pdfnElement = el as PdfnReactElement;

    // Check if this component is marked
    if (isMarkedClientComponent(pdfnElement.type)) {
      return true;
    }

    // Recursively check children
    const props = pdfnElement.props as { children?: React.ReactNode };
    const children = props?.children;
    if (children) {
      return Children.toArray(children).some((child) => {
        if (isValidElement(child)) {
          return check(child as ReactElement);
        }
        return false;
      });
    }

    return false;
  }

  return check(element);
}
