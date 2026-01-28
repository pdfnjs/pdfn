import type { ReactNode } from "react";

export interface TheadProps
  extends Omit<React.HTMLAttributes<HTMLTableSectionElement>, "style"> {
  /** Table header content (tr with th elements) */
  children: ReactNode;
  /** Repeat header on each page when table spans multiple pages (default: true) */
  repeat?: boolean;
}

/**
 * Thead - Table header that repeats across pages
 *
 * Headers repeat by default when the table spans multiple pages.
 * Pass `repeat={false}` to disable.
 *
 * @example
 * ```tsx
 * <table>
 *   <Thead>
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
export function Thead({ children, repeat = true, className, ...props }: TheadProps) {
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
