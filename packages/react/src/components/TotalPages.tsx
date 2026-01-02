export interface TotalPagesProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * TotalPages - Displays the total number of pages
 *
 * Renders a placeholder span that Paged.js will populate with
 * the total page count after pagination is complete.
 *
 * @example
 * ```tsx
 * <Page footer={
 *   <span>
 *     <PageNumber /> of <TotalPages />
 *   </span>
 * }>
 *   Content here
 * </Page>
 * ```
 */
export function TotalPages({ className }: TotalPagesProps) {
  // Paged.js uses CSS counters to fill total page count
  // The CSS is injected by the render pipeline
  return (
    <span
      data-pdfn-total-pages
      className={className}
      style={{
        // CSS counter content will be set by Paged.js stylesheet
      }}
    />
  );
}
