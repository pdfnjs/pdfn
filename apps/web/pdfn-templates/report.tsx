"use client";

import { Document, Page, PageNumber, TotalPages, AvoidBreak } from "@pdfn/react";
import { Tailwind } from "@pdfn/tailwind";
import { RevenueChart, CategoryChart, RegionChart } from "./components/Charts";

/**
 * Monthly Sales Report template with Recharts
 *
 * Demonstrates:
 * - Recharts integration (LineChart, BarChart, PieChart)
 * - Data visualization in PDF reports
 * - Client-side chart rendering
 *
 * Note: Charts require browser APIs and render client-side.
 * pdfn handles hydration automatically for "use client" components.
 */

interface ReportProps {
  title?: string;
  period?: string;
  generatedAt?: string;
  monthlyRevenue?: Array<{ month: string; revenue: number; target: number }>;
  salesByCategory?: Array<{ category: string; sales: number }>;
  revenueByRegion?: Array<{ region: string; value: number }>;
  summary?: {
    totalRevenue: number;
    growth: number;
    newCustomers: number;
    avgOrderValue: number;
  };
}

export default function Report({
  title = "Monthly Sales Report",
  period = "January 2026",
  generatedAt = "February 1, 2026",
  monthlyRevenue = [
    { month: "Aug", revenue: 42000, target: 40000 },
    { month: "Sep", revenue: 45000, target: 42000 },
    { month: "Oct", revenue: 48000, target: 45000 },
    { month: "Nov", revenue: 52000, target: 48000 },
    { month: "Dec", revenue: 61000, target: 55000 },
    { month: "Jan", revenue: 58000, target: 58000 },
  ],
  salesByCategory = [
    { category: "Enterprise", sales: 125000 },
    { category: "Pro", sales: 89000 },
    { category: "Starter", sales: 45000 },
    { category: "API", sales: 32000 },
    { category: "Support", sales: 18000 },
  ],
  revenueByRegion = [
    { region: "North America", value: 145000 },
    { region: "Europe", value: 98000 },
    { region: "Asia Pacific", value: 67000 },
    { region: "Latin America", value: 23000 },
  ],
  summary = {
    totalRevenue: 333000,
    growth: 12.5,
    newCustomers: 847,
    avgOrderValue: 393,
  },
}: ReportProps) {
  const formatCurrency = (value: number) =>
    "$" + value.toLocaleString("en-US");

  return (
    <Document title={title}>
      <Tailwind>
        <Page
          size="A4"
          margin="0.75in"
          footer={
            <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-200 pt-3">
              <div>Generated on {generatedAt}</div>
              <div>
                Page <PageNumber /> of <TotalPages />
              </div>
            </div>
          }
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <p className="text-gray-500 mt-1">{period}</p>
              </div>
              <img
                src="https://pdfn.dev/logo-dark.svg"
                alt="Logo"
                className="h-8"
              />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-xs text-blue-600 font-medium uppercase">
                Total Revenue
              </div>
              <div className="text-xl font-bold text-gray-900 mt-1">
                {formatCurrency(summary.totalRevenue)}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-xs text-green-600 font-medium uppercase">
                Growth
              </div>
              <div className="text-xl font-bold text-gray-900 mt-1">
                +{summary.growth}%
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-xs text-purple-600 font-medium uppercase">
                New Customers
              </div>
              <div className="text-xl font-bold text-gray-900 mt-1">
                {summary.newCustomers}
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-xs text-orange-600 font-medium uppercase">
                Avg Order Value
              </div>
              <div className="text-xl font-bold text-gray-900 mt-1">
                {formatCurrency(summary.avgOrderValue)}
              </div>
            </div>
          </div>

          {/* Revenue Trend Chart */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Revenue Trend (6 Months)
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <RevenueChart data={monthlyRevenue} />
            </div>
          </div>

          {/* Two Column Charts */}
          <div className="grid grid-cols-2 gap-6">
            {/* Sales by Category */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Sales by Category
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <CategoryChart data={salesByCategory} />
              </div>
            </div>

            {/* Revenue by Region */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Revenue by Region
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <RegionChart data={revenueByRegion} />
              </div>
            </div>
          </div>

          {/* Data Table */}
          <AvoidBreak>
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Monthly Breakdown
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left py-2 px-3 font-semibold">Month</th>
                    <th className="text-right py-2 px-3 font-semibold">
                      Revenue
                    </th>
                    <th className="text-right py-2 px-3 font-semibold">Target</th>
                    <th className="text-right py-2 px-3 font-semibold">
                      Variance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyRevenue.map((row, i) => {
                    const variance = row.revenue - row.target;
                    const variancePct = ((variance / row.target) * 100).toFixed(
                      1
                    );
                    return (
                      <tr
                        key={i}
                        className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="py-2 px-3">{row.month}</td>
                        <td className="py-2 px-3 text-right">
                          {formatCurrency(row.revenue)}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {formatCurrency(row.target)}
                        </td>
                        <td
                          className={`py-2 px-3 text-right font-medium ${variance >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {variance >= 0 ? "+" : ""}
                          {variancePct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </AvoidBreak>
        </Page>
      </Tailwind>
    </Document>
  );
}
