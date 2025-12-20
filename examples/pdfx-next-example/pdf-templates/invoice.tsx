import { Document, Page } from "@pdfx-dev/react";
import type { InvoiceData } from "./types";

/**
 * Professional Invoice template using inline CSS styles
 */
export default function Invoice({ data }: { data: InvoiceData }) {
  const subtotal = data.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <Document title={`Invoice ${data.number}`}>
      <Page
        size="A4"
        margin="1in"
        footer={
          <div style={{
            fontSize: "9px",
            color: "#6b7280",
            textAlign: "center",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "12px"
          }}>
            <div>{data.company.name} • {data.company.address}</div>
            <div style={{ marginTop: "2px" }}>{data.company.email} • {data.company.phone}</div>
          </div>
        }
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
          {/* Company Info */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            {data.company.logo && (
              <img
                src={data.company.logo}
                alt={data.company.name}
                style={{ width: "44px", height: "44px" }}
              />
            )}
            <div>
              <div style={{ fontSize: "20px", fontWeight: "700", color: "#111827" }}>
                {data.company.name}
              </div>
              <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
                {data.company.address}
              </div>
            </div>
          </div>

          {/* Invoice Title */}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#111827" }}>
              INVOICE
            </div>
          </div>
        </div>

        {/* Invoice Details & Bill To */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
          {/* Bill To */}
          <div>
            <div style={{ fontSize: "10px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", marginBottom: "6px" }}>
              Bill To
            </div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
              {data.customer}
            </div>
          </div>

          {/* Invoice Info */}
          <div style={{ textAlign: "right" }}>
            <table style={{ marginLeft: "auto", fontSize: "12px" }}>
              <tbody>
                <tr>
                  <td style={{ color: "#6b7280", paddingRight: "16px", paddingBottom: "4px" }}>Invoice No:</td>
                  <td style={{ fontWeight: "600", color: "#111827", paddingBottom: "4px" }}>{data.number}</td>
                </tr>
                <tr>
                  <td style={{ color: "#6b7280", paddingRight: "16px", paddingBottom: "4px" }}>Date:</td>
                  <td style={{ color: "#111827", paddingBottom: "4px" }}>{data.date}</td>
                </tr>
                <tr>
                  <td style={{ color: "#6b7280", paddingRight: "16px" }}>Due Date:</td>
                  <td style={{ color: "#111827" }}>{data.dueDate}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb" }}>
              <th style={{ textAlign: "left", padding: "10px 12px", fontSize: "10px", fontWeight: "600", color: "#374151", textTransform: "uppercase", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" }}>
                Description
              </th>
              <th style={{ textAlign: "center", padding: "10px 12px", fontSize: "10px", fontWeight: "600", color: "#374151", textTransform: "uppercase", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", width: "60px" }}>
                Qty
              </th>
              <th style={{ textAlign: "right", padding: "10px 12px", fontSize: "10px", fontWeight: "600", color: "#374151", textTransform: "uppercase", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", width: "100px" }}>
                Rate
              </th>
              <th style={{ textAlign: "right", padding: "10px 12px", fontSize: "10px", fontWeight: "600", color: "#374151", textTransform: "uppercase", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", width: "100px" }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i}>
                <td style={{ padding: "12px", borderBottom: "1px solid #f3f4f6" }}>
                  <div style={{ fontWeight: "500", color: "#111827", fontSize: "13px" }}>{item.name}</div>
                  {item.description && (
                    <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
                      {item.description}
                    </div>
                  )}
                </td>
                <td style={{ textAlign: "center", padding: "12px", color: "#374151", fontSize: "13px", borderBottom: "1px solid #f3f4f6" }}>
                  {item.qty}
                </td>
                <td style={{ textAlign: "right", padding: "12px", color: "#374151", fontSize: "13px", borderBottom: "1px solid #f3f4f6" }}>
                  ${item.price.toFixed(2)}
                </td>
                <td style={{ textAlign: "right", padding: "12px", fontWeight: "500", color: "#111827", fontSize: "13px", borderBottom: "1px solid #f3f4f6" }}>
                  ${(item.qty * item.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "32px" }}>
          <table style={{ width: "240px", fontSize: "13px" }}>
            <tbody>
              <tr>
                <td style={{ padding: "6px 0", color: "#6b7280" }}>Subtotal</td>
                <td style={{ padding: "6px 0", textAlign: "right", color: "#374151" }}>${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#6b7280" }}>Tax (10%)</td>
                <td style={{ padding: "6px 0", textAlign: "right", color: "#374151" }}>${tax.toFixed(2)}</td>
              </tr>
              <tr style={{ borderTop: "2px solid #111827" }}>
                <td style={{ padding: "10px 0 0 0", fontWeight: "700", color: "#111827", fontSize: "15px" }}>Total Due</td>
                <td style={{ padding: "10px 0 0 0", textAlign: "right", fontWeight: "700", color: "#111827", fontSize: "15px" }}>${total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment Info */}
        <div style={{ backgroundColor: "#f9fafb", padding: "16px", borderRadius: "6px", marginBottom: "24px" }}>
          <div style={{ fontSize: "10px", fontWeight: "600", color: "#374151", textTransform: "uppercase", marginBottom: "8px" }}>
            Payment Information
          </div>
          <div style={{ fontSize: "12px", color: "#374151" }}>
            <div>Please make payment within 30 days of invoice date.</div>
            <div style={{ marginTop: "4px" }}>Bank: National Bank • Account: 1234-5678-9012 • Routing: 987654321</div>
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "10px", fontWeight: "600", color: "#374151", textTransform: "uppercase", marginBottom: "6px" }}>
              Notes
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              {data.notes}
            </div>
          </div>
        )}
      </Page>
    </Document>
  );
}
