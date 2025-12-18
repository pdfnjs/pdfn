import type { ReactNode, ThHTMLAttributes } from "react";

export interface RepeatableTableHeaderProps {
  /** Table header content (th elements) */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * RepeatableTableHeader - Table header that repeats on each page
 *
 * Use this component as the thead of a table to ensure the header
 * row repeats when the table spans multiple pages.
 *
 * @example
 * ```tsx
 * <table>
 *   <RepeatableTableHeader>
 *     <tr>
 *       <th>Item</th>
 *       <th>Price</th>
 *       <th>Qty</th>
 *     </tr>
 *   </RepeatableTableHeader>
 *   <tbody>
 *     {items.map(item => (
 *       <tr key={item.id}>
 *         <td>{item.name}</td>
 *         <td>{item.price}</td>
 *         <td>{item.qty}</td>
 *       </tr>
 *     ))}
 *   </tbody>
 * </table>
 * ```
 */
export function RepeatableTableHeader({ children, className }: RepeatableTableHeaderProps) {
  return (
    <thead
      data-pdfx-repeatable-header
      className={className}
      style={{
        display: "table-header-group",
      }}
    >
      {children}
    </thead>
  );
}
