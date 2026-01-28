import { Document, Page, PageNumber, TotalPages } from "@pdfn/react";
import { Tailwind } from "@pdfn/tailwind";

/**
 * Professional Invoice template using Tailwind CSS
 *
 * Demonstrates:
 * - Tailwind CSS styling
 * - Page footer with PageNumber and TotalPages
 * - Calculated totals with tax
 */

const items = [
  { name: "Enterprise License", description: "Annual subscription — unlimited PDFs", qty: 1, price: 4999 },
  { name: "API Integration Setup", description: "Custom endpoint configuration", qty: 1, price: 1500 },
  { name: "Custom Template", description: "Branded invoice template", qty: 2, price: 800 },
  { name: "Priority Support", description: "24/7 support with 1-hour SLA", qty: 12, price: 99 },
];

const taxRate = 0.0875;

export default function Invoice({ number = "INV-2026-001" }: { number?: string }) {
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const formatCurrency = (amount: number) =>
    "$" + amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Document title={`Invoice ${number}`}>
      <Tailwind>
        <Page
          size="A4"
          margin="1in"
          footer={
            <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-200 pt-3">
              <div>
                PDFN • billing@pdfn.dev • +1 (415) 555-0132
              </div>
              <div>
                Page <PageNumber /> of <TotalPages />
              </div>
            </div>
          }
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <img src="https://pdfn.dev/logo-dark.svg" alt="Company Logo" className="h-10 mb-2" />
              <div className="text-xs text-gray-500">548 Market St, Suite 835, San Francisco, CA 94104</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 tracking-tight">INVOICE</div>
              <div className="text-lg font-semibold text-gray-600 mt-1">{number}</div>
            </div>
          </div>

          {/* Invoice Details & Bill To */}
          <div className="flex justify-between mb-8">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Bill To</div>
              <div className="text-sm font-semibold text-gray-900">Acme Corporation</div>
              <div className="text-sm text-gray-600 mt-0.5">456 Enterprise Blvd, Suite 100</div>
              <div className="text-sm text-gray-600">Austin, TX 78701</div>
            </div>
            <div className="text-right">
              <table className="ml-auto text-sm">
                <tbody>
                  <tr>
                    <td className="text-gray-500 pr-4 py-0.5">Invoice Date:</td>
                    <td className="text-gray-900 py-0.5">January 15, 2026</td>
                  </tr>
                  <tr>
                    <td className="text-gray-500 pr-4 py-0.5">Due Date:</td>
                    <td className="text-gray-900 py-0.5">February 14, 2026</td>
                  </tr>
                  <tr>
                    <td className="text-gray-500 pr-4 py-1.5 font-semibold">Amount Due:</td>
                    <td className="text-gray-900 py-1.5 font-bold text-lg">{formatCurrency(total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-6 border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase">Description</th>
                <th className="text-center py-3 px-4 text-xs font-semibold uppercase w-16">Qty</th>
                <th className="text-right py-3 px-4 text-xs font-semibold uppercase w-24">Rate</th>
                <th className="text-right py-3 px-4 text-xs font-semibold uppercase w-28">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="py-3 px-4 border-b border-gray-100">
                    <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                    )}
                  </td>
                  <td className="text-center py-3 px-4 text-gray-700 text-sm border-b border-gray-100">
                    {item.qty}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-700 text-sm border-b border-gray-100">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="text-right py-3 px-4 font-medium text-gray-900 text-sm border-b border-gray-100">
                    {formatCurrency(item.qty * item.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <table className="w-64 text-sm">
              <tbody>
                <tr>
                  <td className="py-2 text-gray-600">Subtotal</td>
                  <td className="py-2 text-right text-gray-900">{formatCurrency(subtotal)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Tax ({(taxRate * 100).toFixed(2)}%)</td>
                  <td className="py-2 text-right text-gray-900">{formatCurrency(tax)}</td>
                </tr>
                <tr className="border-t-2 border-gray-800">
                  <td className="pt-3 pb-2 font-bold text-gray-900 text-base">Total Due</td>
                  <td className="pt-3 pb-2 text-right font-bold text-gray-900 text-lg">
                    {formatCurrency(total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Notes */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-xs font-semibold text-gray-700 uppercase mb-1">Notes</div>
            <div className="text-sm text-gray-600">
              Thank you for choosing PDFN! Payment is due within 30 days.
            </div>
          </div>
        </Page>
      </Tailwind>
    </Document>
  );
}
