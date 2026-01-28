import type { ReactNode } from "react";

export interface NoBreakProps {
  /** Content that should stay together on the same page */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * NoBreak - Keeps content together on the same page
 *
 * Wraps content with break-inside: avoid to prevent page breaks
 * within the wrapped content. If the content exceeds a single page,
 * a warning will be emitted.
 *
 * @example
 * ```tsx
 * <NoBreak>
 *   <h2>Section Title</h2>
 *   <p>This content will stay together with the title.</p>
 * </NoBreak>
 * ```
 */
export function NoBreak({ children, className }: NoBreakProps) {
  return (
    <div
      data-pdfn-avoid-break
      className={className}
      style={{
        breakInside: "avoid",
        pageBreakInside: "avoid", // Legacy support
      }}
    >
      {children}
    </div>
  );
}
