export interface PageNumberProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * PageNumber - Displays the current page number
 *
 * Renders a placeholder span that Paged.js will populate with
 * the actual page number during pagination using CSS counters.
 *
 * @example Basic usage
 * ```tsx
 * <Page footer={<PageNumber />}>
 *   Content here
 * </Page>
 * ```
 *
 * @example With surrounding text
 * ```tsx
 * <Page footer={<span>Page <PageNumber /></span>}>
 *   Content here
 * </Page>
 * ```
 *
 * @example Page X of Y format
 * ```tsx
 * <Page footer={<span>Page <PageNumber /> of <TotalPages /></span>}>
 *   Content here
 * </Page>
 * ```
 */
export function PageNumber({ className }: PageNumberProps) {
  // Paged.js uses CSS counters to fill page numbers
  // The CSS is injected by the render pipeline
  return (
    <span
      data-pdfn-page-number
      className={className}
      style={{
        // CSS counter content will be set by Paged.js stylesheet
      }}
    />
  );
}
