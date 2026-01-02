/**
 * PageBreak - Forces a page break
 *
 * Inserts a break-after: page rule to force content after this
 * component to start on a new page.
 *
 * @example
 * ```tsx
 * <Page>
 *   <h1>First Page</h1>
 *   <PageBreak />
 *   <h1>Second Page</h1>
 * </Page>
 * ```
 */
export function PageBreak() {
  return (
    <div
      data-pdfn-page-break
      style={{
        breakAfter: "page",
        pageBreakAfter: "always", // Legacy support
        height: 0,
      }}
      aria-hidden="true"
    />
  );
}
