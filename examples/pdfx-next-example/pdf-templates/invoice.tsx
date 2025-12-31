import { Document, Page, TableHeader, PageNumber, TotalPages } from "@pdfx-dev/react";
import { Tailwind } from "@pdfx-dev/tailwind";
import type { InvoiceData } from "./types";

/**
 * Professional Invoice template using Tailwind CSS classes
 *
 * Demonstrates:
 * - Local image embedding (logo.svg)
 * - TableHeader for multi-page tables
 * - PageNumber and TotalPages in footer
 * - Configurable tax rate
 */
export default function Invoice({ data }: { data: InvoiceData }) {
  const subtotal = data.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const taxRate = data.taxRate ?? 0.1;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <Document title={`Invoice ${data.number}`}>
      <Tailwind>
        <Page
          size="A4"
          margin="1in"
          footer={
            <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-200 pt-3">
              <div>
                {data.company.name} • {data.company.email} • {data.company.phone}
              </div>
              <div>
                Page <PageNumber /> of <TotalPages />
              </div>
            </div>
          }
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            {/* Company Logo & Info */}
            <div>
              <img src="./pdf-templates/assets/logo.svg" alt="Company Logo" className="h-10 mb-2" />
              <div className="text-xs text-gray-500">
                {data.company.address}
              </div>
            </div>

            {/* Invoice Title & Number */}
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 tracking-tight">
                INVOICE
              </div>
              <div className="text-lg font-semibold text-gray-600 mt-1">
                {data.number}
              </div>
            </div>
          </div>

          {/* Invoice Details & Bill To */}
          <div className="flex justify-between mb-8">
            {/* Bill To */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Bill To
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {data.customer.name}
              </div>
              <div className="text-sm text-gray-600 mt-0.5">
                {data.customer.address}
              </div>
              <div className="text-sm text-gray-600">
                {data.customer.city}
              </div>
            </div>

            {/* Invoice Info */}
            <div className="text-right">
              <table className="ml-auto text-sm">
                <tbody>
                  <tr>
                    <td className="text-gray-500 pr-4 py-0.5">Invoice Date:</td>
                    <td className="text-gray-900 py-0.5">{data.date}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-500 pr-4 py-0.5">Due Date:</td>
                    <td className="text-gray-900 py-0.5">{data.dueDate}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-500 pr-4 py-1.5 font-semibold">Amount Due:</td>
                    <td className="text-gray-900 py-1.5 font-bold text-lg">${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Items Table with TableHeader for repeating headers */}
          <table className="w-full mb-6 border-collapse">
            <TableHeader>
              <tr className="bg-gray-800 text-white">
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase">
                  Description
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold uppercase w-16">
                  Qty
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold uppercase w-24">
                  Rate
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold uppercase w-28">
                  Amount
                </th>
              </tr>
            </TableHeader>
            <tbody>
              {data.items.map((item, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="py-3 px-4 border-b border-gray-100">
                    <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td className="text-center py-3 px-4 text-gray-700 text-sm border-b border-gray-100">
                    {item.qty}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-700 text-sm border-b border-gray-100">
                    ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="text-right py-3 px-4 font-medium text-gray-900 text-sm border-b border-gray-100">
                    ${(item.qty * item.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  <td className="py-2 text-right text-gray-900">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Tax ({(taxRate * 100).toFixed(0)}%)</td>
                  <td className="py-2 text-right text-gray-900">${tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr className="border-t-2 border-gray-800">
                  <td className="pt-3 pb-2 font-bold text-gray-900 text-base">Total Due</td>
                  <td className="pt-3 pb-2 text-right font-bold text-gray-900 text-lg">${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Notes */}
          {data.notes && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xs font-semibold text-gray-700 uppercase mb-1">
                Notes
              </div>
              <div className="text-sm text-gray-600">
                {data.notes}
              </div>
            </div>
          )}
        </Page>
      </Tailwind>
    </Document>
  );
}
