import { Document, Page, TableHeader, PageNumber, TotalPages } from "@pdfn/react";
import { Tailwind } from "@pdfn/tailwind";

/**
 * Professional Invoice template using Tailwind CSS
 *
 * Demonstrates:
 * - TableHeader for multi-page tables
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
      <Tailwind>
        <Page
          size="A4"
          margin="1in"
          footer={
            <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-200 pt-3">
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
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="text-2xl font-bold text-gray-900">{company.name}</div>
              <div className="text-xs text-gray-500 mt-1">{company.address}</div>
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
              <div className="text-sm font-semibold text-gray-900">{customer.name}</div>
              <div className="text-sm text-gray-600 mt-0.5">{customer.address}</div>
              <div className="text-sm text-gray-600">{customer.city}</div>
            </div>
            <div className="text-right">
              <table className="ml-auto text-sm">
                <tbody>
                  <tr>
                    <td className="text-gray-500 pr-4 py-0.5">Invoice Date:</td>
                    <td className="text-gray-900 py-0.5">{date}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-500 pr-4 py-0.5">Due Date:</td>
                    <td className="text-gray-900 py-0.5">{dueDate}</td>
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
            <TableHeader>
              <tr className="bg-gray-800 text-white">
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase">Description</th>
                <th className="text-center py-3 px-4 text-xs font-semibold uppercase w-16">Qty</th>
                <th className="text-right py-3 px-4 text-xs font-semibold uppercase w-24">Rate</th>
                <th className="text-right py-3 px-4 text-xs font-semibold uppercase w-28">Amount</th>
              </tr>
            </TableHeader>
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
                  <td className="py-2 text-gray-600">Tax ({(taxRate * 100).toFixed(0)}%)</td>
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
          {notes && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xs font-semibold text-gray-700 uppercase mb-1">Notes</div>
              <div className="text-sm text-gray-600">{notes}</div>
            </div>
          )}
        </Page>
      </Tailwind>
    </Document>
  );
}
