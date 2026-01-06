import type { ReactNode, ThHTMLAttributes } from "react";

export interface TheadProps
  extends Omit<React.HTMLAttributes<HTMLTableSectionElement>, "style"> {
  /** Table header content (tr with th elements) */
  children: ReactNode;
  /** Repeat header on each page when table spans multiple pages */
  repeat?: boolean;
}

/**
 * Thead - Table header element with optional repeat across pages
 *
 * Use the `repeat` prop to ensure the header row repeats when
 * the table spans multiple pages in PDFs.
 *
 * @example
 * ```tsx
 * <table>
 *   <Thead repeat>
 *     <tr>
 *       <th>Item</th>
 *       <th>Price</th>
 *       <th>Qty</th>
 *     </tr>
 *   </Thead>
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
export function Thead({ children, repeat, className, ...props }: TheadProps) {
  return (
    <thead
      data-pdfn-thead
      data-repeat={repeat || undefined}
      className={className}
      style={
        repeat
          ? {
              display: "table-header-group",
            }
          : undefined
      }
      {...props}
    >
      {children}
    </thead>
  );
}
