import type { ReactNode } from "react";

export interface TrProps
  extends Omit<React.HTMLAttributes<HTMLTableRowElement>, "style"> {
  /** Table row content (td or th elements) */
  children: ReactNode;
  /** Prevent row from splitting across pages */
  keep?: boolean;
  /** Additional inline styles (merged with keep styles) */
  style?: React.CSSProperties;
}

/**
 * Tr - Table row element with optional keep-together behavior
 *
 * Use the `keep` prop to prevent the row from being split
 * across pages in PDFs.
 *
 * @example
 * ```tsx
 * <table>
 *   <Thead repeat>
 *     <Tr><th>Item</th><th>Price</th></Tr>
 *   </Thead>
 *   <tbody>
 *     {items.map(item => (
 *       <Tr key={item.id} keep>
 *         <td>{item.name}</td>
 *         <td>{item.price}</td>
 *       </Tr>
 *     ))}
 *   </tbody>
 * </table>
 * ```
 */
export function Tr({ children, keep, style, className, ...props }: TrProps) {
  return (
    <tr
      data-pdfn-tr
      data-keep={keep || undefined}
      className={className}
      style={
        keep
          ? {
              breakInside: "avoid",
              pageBreakInside: "avoid",
              ...style,
            }
          : style
      }
      {...props}
    >
      {children}
    </tr>
  );
}
