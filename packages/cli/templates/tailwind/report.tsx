import React from "react";
"use client";

import { Document, Page, PageNumber, TotalPages } from "@pdfn/react";
import { Tailwind } from "@pdfn/tailwind";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

/**
 * Sales Report template with Recharts
 *
 * Demonstrates:
 * - "use client" directive for client-side rendering
 * - Recharts integration (BarChart, LineChart, PieChart)
 * - Multi-page layout with headers and footers
 *
 * Requirements:
 * - recharts package: npm install recharts
 *
 * Works automatically with `pdfn dev` - no additional setup needed!
 *
 * For production apps (using generate() directly):
 * - Next.js: Add @pdfn/next to next.config.ts
 * - Vite: Add @pdfn/vite to vite.config.ts
 */

interface ReportProps {
  title?: string;
  period?: string;
  generatedDate?: string;
  monthlySales?: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  categoryBreakdown?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  quarterlyGrowth?: Array<{
    quarter: string;
    growth: number;
  }>;
  summary?: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    growthRate: number;
  };
  company?: {
    name: string;
    department: string;
  };
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Report({
  title = "Annual Sales Report",
  period = "January - December 2024",
  generatedDate = "January 15, 2025",
  monthlySales = [
    { month: "Jan", revenue: 45000, expenses: 32000, profit: 13000 },
    { month: "Feb", revenue: 52000, expenses: 35000, profit: 17000 },
    { month: "Mar", revenue: 48000, expenses: 33000, profit: 15000 },
    { month: "Apr", revenue: 61000, expenses: 38000, profit: 23000 },
    { month: "May", revenue: 55000, expenses: 36000, profit: 19000 },
    { month: "Jun", revenue: 67000, expenses: 41000, profit: 26000 },
    { month: "Jul", revenue: 72000, expenses: 44000, profit: 28000 },
    { month: "Aug", revenue: 69000, expenses: 42000, profit: 27000 },
    { month: "Sep", revenue: 78000, expenses: 47000, profit: 31000 },
    { month: "Oct", revenue: 82000, expenses: 49000, profit: 33000 },
    { month: "Nov", revenue: 91000, expenses: 53000, profit: 38000 },
    { month: "Dec", revenue: 98000, expenses: 56000, profit: 42000 },
  ],
  categoryBreakdown = [
    { name: "Electronics", value: 35, color: "#3b82f6" },
    { name: "Software", value: 28, color: "#10b981" },
    { name: "Services", value: 22, color: "#f59e0b" },
    { name: "Hardware", value: 15, color: "#ef4444" },
  ],
  quarterlyGrowth = [
    { quarter: "Q1", growth: 12 },
    { quarter: "Q2", growth: 18 },
    { quarter: "Q3", growth: 24 },
    { quarter: "Q4", growth: 31 },
  ],
  summary = {
    totalRevenue: 818000,
    totalExpenses: 506000,
    netProfit: 312000,
    growthRate: 31,
  },
  company = {
    name: "Your Company",
    department: "Finance Department",
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
          header={
            <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
              <div>
                <div className="text-lg font-bold text-gray-900">{company.name}</div>
                <div className="text-xs text-gray-500">{company.department}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-700">{title}</div>
                <div className="text-xs text-gray-500">{period}</div>
              </div>
            </div>
          }
          footer={
            <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-200 pt-3">
              <div>Generated: {generatedDate}</div>
              <div>
                Page <PageNumber /> of <TotalPages />
              </div>
            </div>
          }
        >
          {/* Title Section */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
            <p className="text-sm text-gray-600">{period}</p>
          </div>

          {/* Executive Summary */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
              Executive Summary
            </h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-xs text-blue-600 font-medium uppercase">Total Revenue</div>
                <div className="text-lg font-bold text-blue-700">{formatCurrency(summary.totalRevenue)}</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <div className="text-xs text-red-600 font-medium uppercase">Total Expenses</div>
                <div className="text-lg font-bold text-red-700">{formatCurrency(summary.totalExpenses)}</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-xs text-green-600 font-medium uppercase">Net Profit</div>
                <div className="text-lg font-bold text-green-700">{formatCurrency(summary.netProfit)}</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <div className="text-xs text-purple-600 font-medium uppercase">YoY Growth</div>
                <div className="text-lg font-bold text-purple-700">+{summary.growthRate}%</div>
              </div>
            </div>
          </div>

          {/* Monthly Revenue Chart */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
              Monthly Revenue vs Expenses
            </h2>
            <BarChart width={580} height={200} data={monthlySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[2, 2, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[2, 2, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </div>

          {/* Two Column Layout: Pie Chart and Growth Chart */}
          <div className="grid grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
                Revenue by Category
              </h2>
              <PieChart width={280} height={160}>
                <Pie
                  data={categoryBreakdown}
                  cx={70}
                  cy={80}
                  innerRadius={25}
                  outerRadius={55}
                  paddingAngle={2}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  wrapperStyle={{ paddingLeft: 20, fontSize: 10 }}
                />
              </PieChart>
            </div>

            {/* Quarterly Growth */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
                Quarterly Growth Rate
              </h2>
              <LineChart width={280} height={160} data={quarterlyGrowth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Line
                  type="monotone"
                  dataKey="growth"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </div>
          </div>

          {/* Monthly Profit Trend */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
              Monthly Profit Trend
            </h2>
            <LineChart width={580} height={160} data={monthlySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Line
                type="monotone"
                dataKey="profit"
                name="Profit"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </div>
        </Page>
      </Tailwind>
    </Document>
  );
}
