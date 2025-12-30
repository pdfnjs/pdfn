import { Document, Page } from "@pdfx-dev/react";
import { Tailwind } from "@pdfx-dev/tailwind";
import type { InvoiceData } from "./types";

/**
 * Professional Invoice template using Tailwind CSS classes
 */
export default function InvoiceTailwind({ data }: { data: InvoiceData }) {
  const subtotal = data.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <Document title={`Invoice ${data.number}`}>
      <Tailwind>
        <Page
          size="A4"
          margin="1in"
          footer={
            <div className="text-xs text-gray-500 text-center border-t border-gray-200 pt-3">
              <div>{data.company.name} • {data.company.address}</div>
              <div className="mt-0.5">{data.company.email} • {data.company.phone}</div>
            </div>
          }
        >
          {/* Header */}
          <div className="flex justify-between mb-8">
            {/* Company Info */}
            <div>
              <div className="text-3xl font-bold tracking-tight">
                <span className="text-gray-600">pdf</span>
                <span className="text-cyan-500">x</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {data.company.address}
              </div>
            </div>

            {/* Invoice Title */}
            <div className="text-right">
              <div className="text-2xl font-semibold text-gray-400 uppercase tracking-wider">
                Invoice
              </div>
            </div>
          </div>

          {/* Invoice Details & Bill To */}
          <div className="flex justify-between mb-8">
            {/* Bill To */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1.5">
                Bill To
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {data.customer}
              </div>
            </div>

            {/* Invoice Info */}
            <div className="text-right">
              <table className="ml-auto text-xs">
                <tbody>
                  <tr>
                    <td className="text-gray-500 pr-4 pb-1">Invoice No:</td>
                    <td className="font-semibold text-gray-900 pb-1">{data.number}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-500 pr-4 pb-1">Date:</td>
                    <td className="text-gray-900 pb-1">{data.date}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-500 pr-4">Due Date:</td>
                    <td className="text-gray-900">{data.dueDate}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-6 border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-700 uppercase border-t border-b border-gray-200">
                  Description
                </th>
                <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-700 uppercase border-t border-b border-gray-200 w-16">
                  Qty
                </th>
                <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-700 uppercase border-t border-b border-gray-200 w-24">
                  Rate
                </th>
                <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-700 uppercase border-t border-b border-gray-200 w-24">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => (
                <tr key={i}>
                  <td className="py-3 px-3 border-b border-gray-100">
                    <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td className="text-center py-3 px-3 text-gray-700 text-sm border-b border-gray-100">
                    {item.qty}
                  </td>
                  <td className="text-right py-3 px-3 text-gray-700 text-sm border-b border-gray-100">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="text-right py-3 px-3 font-medium text-gray-900 text-sm border-b border-gray-100">
                    ${(item.qty * item.price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <table className="w-60 text-sm">
              <tbody>
                <tr>
                  <td className="py-1.5 text-gray-500">Subtotal</td>
                  <td className="py-1.5 text-right text-gray-700">${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-gray-500">Tax (10%)</td>
                  <td className="py-1.5 text-right text-gray-700">${tax.toFixed(2)}</td>
                </tr>
                <tr className="border-t-2 border-gray-900">
                  <td className="pt-2.5 font-bold text-gray-900 text-base">Total Due</td>
                  <td className="pt-2.5 text-right font-bold text-gray-900 text-base">${total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Info */}
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <div className="text-xs font-semibold text-gray-700 uppercase mb-2">
              Payment Information
            </div>
            <div className="text-xs text-gray-700">
              <div>Please make payment within 30 days of invoice date.</div>
              <div className="mt-1">Bank: National Bank • Account: 1234-5678-9012 • Routing: 987654321</div>
            </div>
          </div>

          {/* Notes */}
          {data.notes && (
            <div className="mb-6">
              <div className="text-xs font-semibold text-gray-700 uppercase mb-1.5">
                Notes
              </div>
              <div className="text-xs text-gray-500">
                {data.notes}
              </div>
            </div>
          )}
        </Page>
      </Tailwind>
    </Document>
  );
}
