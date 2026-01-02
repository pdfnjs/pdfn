import type { ReactNode } from "react";

export interface TableHeaderProps {
  /** Table header content (tr with th elements) */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TableHeader - Table header that repeats on each page
 *
 * Use this component instead of <thead> to ensure the header
 * row repeats when the table spans multiple pages in PDFs.
 *
 * @example
 * ```tsx
 * <table>
 *   <TableHeader>
 *     <tr>
 *       <th>Item</th>
 *       <th>Price</th>
 *       <th>Qty</th>
 *     </tr>
 *   </TableHeader>
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
export function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <thead
      data-pdfn-table-header
      className={className}
      style={{
        display: "table-header-group",
      }}
    >
      {children}
    </thead>
  );
}
