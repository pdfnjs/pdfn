import React from "react";
import { Document, Page, Thead, PageNumber, TotalPages } from "@pdfn/react";

/**
 * Professional Invoice template using inline styles
 *
 * Demonstrates:
 * - Thead with repeat for multi-page tables
 * - PageNumber and TotalPages in footer
 * - Configurable tax rate
 */

interface InvoiceProps {
  number?: string;
  date?: string;
  dueDate?: string;
  customer?: {
    name: string;
    address: string;
    city: string;
  };
  items?: Array<{
    name: string;
    description?: string;
    qty: number;
    price: number;
  }>;
  taxRate?: number;
  notes?: string;
  company?: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
}

export default function Invoice({
  number = "INV-2025-001",
  date = "January 15, 2025",
  dueDate = "February 14, 2025",
  customer = {
    name: "Acme Corporation",
    address: "456 Enterprise Blvd, Suite 100",
    city: "Austin, TX 78701",
  },
  items = [
    { name: "Web Development", description: "Frontend development with React", qty: 40, price: 150 },
    { name: "API Integration", description: "REST API setup and configuration", qty: 20, price: 175 },
    { name: "UI/UX Design", description: "User interface design", qty: 15, price: 125 },
  ],
  taxRate = 0.1,
  notes = "Payment is due within 30 days. Thank you for your business!",
  company = {
    name: "Your Company",
    address: "123 Business St, San Francisco, CA 94102",
    email: "hello@yourcompany.com",
    phone: "+1 (555) 123-4567",
  },
}: InvoiceProps) {
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const formatCurrency = (amount: number) =>
    "$" + amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Document title={`Invoice ${number}`}>
      <Page
        size="A4"
        margin="1in"
        footer={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px", color: "#6b7280", borderTop: "1px solid #e5e7eb", paddingTop: "12px" }}>
            <div>
              {company.name} • {company.email} • {company.phone}
            </div>
            <div>
              Page <PageNumber /> of <TotalPages />
            </div>
          </div>
        }
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
          <div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#111827" }}>{company.name}</div>
            <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "4px" }}>{company.address}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "30px", fontWeight: "bold", color: "#111827", letterSpacing: "-0.025em" }}>INVOICE</div>
            <div style={{ fontSize: "18px", fontWeight: "600", color: "#4b5563", marginTop: "4px" }}>{number}</div>
          </div>
        </div>

        {/* Invoice Details & Bill To */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", marginBottom: "8px" }}>Bill To</div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>{customer.name}</div>
            <div style={{ fontSize: "14px", color: "#4b5563", marginTop: "2px" }}>{customer.address}</div>
            <div style={{ fontSize: "14px", color: "#4b5563" }}>{customer.city}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <table style={{ marginLeft: "auto", fontSize: "14px" }}>
              <tbody>
                <tr>
                  <td style={{ color: "#6b7280", paddingRight: "16px", paddingTop: "2px", paddingBottom: "2px" }}>Invoice Date:</td>
                  <td style={{ color: "#111827", paddingTop: "2px", paddingBottom: "2px" }}>{date}</td>
                </tr>
                <tr>
                  <td style={{ color: "#6b7280", paddingRight: "16px", paddingTop: "2px", paddingBottom: "2px" }}>Due Date:</td>
                  <td style={{ color: "#111827", paddingTop: "2px", paddingBottom: "2px" }}>{dueDate}</td>
                </tr>
                <tr>
                  <td style={{ color: "#6b7280", paddingRight: "16px", paddingTop: "6px", paddingBottom: "6px", fontWeight: "600" }}>Amount Due:</td>
                  <td style={{ color: "#111827", paddingTop: "6px", paddingBottom: "6px", fontWeight: "bold", fontSize: "18px" }}>{formatCurrency(total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: "100%", marginBottom: "24px", borderCollapse: "collapse" }}>
          <Thead repeat>
            <tr style={{ backgroundColor: "#1f2937", color: "white" }}>
              <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "10px", fontWeight: "600", textTransform: "uppercase" }}>Description</th>
              <th style={{ textAlign: "center", padding: "12px 16px", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", width: "64px" }}>Qty</th>
              <th style={{ textAlign: "right", padding: "12px 16px", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", width: "96px" }}>Rate</th>
              <th style={{ textAlign: "right", padding: "12px 16px", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", width: "112px" }}>Amount</th>
            </tr>
          </Thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "white" : "#f9fafb" }}>
                <td style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
                  <div style={{ fontWeight: "500", color: "#111827", fontSize: "14px" }}>{item.name}</div>
                  {item.description && (
                    <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "2px" }}>{item.description}</div>
                  )}
                </td>
                <td style={{ textAlign: "center", padding: "12px 16px", color: "#374151", fontSize: "14px", borderBottom: "1px solid #f3f4f6" }}>
                  {item.qty}
                </td>
                <td style={{ textAlign: "right", padding: "12px 16px", color: "#374151", fontSize: "14px", borderBottom: "1px solid #f3f4f6" }}>
                  {formatCurrency(item.price)}
                </td>
                <td style={{ textAlign: "right", padding: "12px 16px", fontWeight: "500", color: "#111827", fontSize: "14px", borderBottom: "1px solid #f3f4f6" }}>
                  {formatCurrency(item.qty * item.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "32px" }}>
          <table style={{ width: "256px", fontSize: "14px" }}>
            <tbody>
              <tr>
                <td style={{ padding: "8px 0", color: "#4b5563" }}>Subtotal</td>
                <td style={{ padding: "8px 0", textAlign: "right", color: "#111827" }}>{formatCurrency(subtotal)}</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", color: "#4b5563" }}>Tax ({(taxRate * 100).toFixed(0)}%)</td>
                <td style={{ padding: "8px 0", textAlign: "right", color: "#111827" }}>{formatCurrency(tax)}</td>
              </tr>
              <tr style={{ borderTop: "2px solid #1f2937" }}>
                <td style={{ paddingTop: "12px", paddingBottom: "8px", fontWeight: "bold", color: "#111827", fontSize: "16px" }}>Total Due</td>
                <td style={{ paddingTop: "12px", paddingBottom: "8px", textAlign: "right", fontWeight: "bold", color: "#111827", fontSize: "18px" }}>
                  {formatCurrency(total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Notes */}
        {notes && (
          <div style={{ backgroundColor: "#f9fafb", padding: "16px", borderRadius: "8px" }}>
            <div style={{ fontSize: "10px", fontWeight: "600", color: "#374151", textTransform: "uppercase", marginBottom: "4px" }}>Notes</div>
            <div style={{ fontSize: "14px", color: "#4b5563" }}>{notes}</div>
          </div>
        )}
      </Page>
    </Document>
  );
}
