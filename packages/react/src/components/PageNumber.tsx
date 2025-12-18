export interface PageNumberProps {
  /** Format function for page number display */
  format?: (pageNumber: number) => string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * PageNumber - Displays the current page number
 *
 * Renders a placeholder span that Paged.js will populate with
 * the actual page number during pagination.
 *
 * @example
 * ```tsx
 * <Page footer={<PageNumber />}>
 *   Content here
 * </Page>
 *
 * // With format function
 * <Page footer={<PageNumber format={(n) => `Page ${n}`} />}>
 *   Content here
 * </Page>
 * ```
 */
export function PageNumber({ className }: PageNumberProps) {
  // Paged.js uses CSS counters to fill page numbers
  // The CSS is injected by the render pipeline
  return (
    <span
      data-pdfx-page-number
      className={className}
      style={{
        // CSS counter content will be set by Paged.js stylesheet
      }}
    />
  );
}
