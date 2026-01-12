"use client";

import { Document, Page, PageNumber, TotalPages } from "@pdfn/react";
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
  ResponsiveContainer,
} from "recharts";

/**
 * Sales Report template with Recharts (inline styles)
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
      <Page
        size="A4"
        margin="0.75in"
        header={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "12px",
              marginBottom: "16px",
            }}
          >
            <div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#111827" }}>
                {company.name}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>{company.department}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>{title}</div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>{period}</div>
            </div>
          </div>
        }
        footer={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "12px",
              color: "#6b7280",
              borderTop: "1px solid #e5e7eb",
              paddingTop: "12px",
            }}
          >
            <div>Generated: {generatedDate}</div>
            <div>
              Page <PageNumber /> of <TotalPages />
            </div>
          </div>
        }
      >
        {/* Title Section */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", marginBottom: "4px" }}>
            {title}
          </h1>
          <p style={{ fontSize: "14px", color: "#4b5563" }}>{period}</p>
        </div>

        {/* Executive Summary */}
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "12px",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "4px",
            }}
          >
            Executive Summary
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
            <div
              style={{
                backgroundColor: "#eff6ff",
                padding: "12px",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "12px", color: "#2563eb", fontWeight: "500", textTransform: "uppercase" }}>
                Total Revenue
              </div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1d4ed8" }}>
                {formatCurrency(summary.totalRevenue)}
              </div>
            </div>
            <div
              style={{
                backgroundColor: "#fef2f2",
                padding: "12px",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "12px", color: "#dc2626", fontWeight: "500", textTransform: "uppercase" }}>
                Total Expenses
              </div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#b91c1c" }}>
                {formatCurrency(summary.totalExpenses)}
              </div>
            </div>
            <div
              style={{
                backgroundColor: "#f0fdf4",
                padding: "12px",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "12px", color: "#16a34a", fontWeight: "500", textTransform: "uppercase" }}>
                Net Profit
              </div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#15803d" }}>
                {formatCurrency(summary.netProfit)}
              </div>
            </div>
            <div
              style={{
                backgroundColor: "#faf5ff",
                padding: "12px",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "12px", color: "#9333ea", fontWeight: "500", textTransform: "uppercase" }}>
                YoY Growth
              </div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#7e22ce" }}>
                +{summary.growthRate}%
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "12px",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "4px",
            }}
          >
            Monthly Revenue vs Expenses
          </h2>
          <div style={{ height: "224px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Two Column Layout: Pie Chart and Growth Chart */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
          {/* Category Breakdown */}
          <div>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "12px",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "4px",
              }}
            >
              Revenue by Category
            </h2>
            <div style={{ height: "176px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={{ stroke: "#9ca3af", strokeWidth: 1 }}
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quarterly Growth */}
          <div>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "12px",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "4px",
              }}
            >
              Quarterly Growth Rate
            </h2>
            <div style={{ height: "176px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={quarterlyGrowth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Line
                    type="monotone"
                    dataKey="growth"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Monthly Profit Trend */}
        <div style={{ marginTop: "24px" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "12px",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "4px",
            }}
          >
            Monthly Profit Trend
          </h2>
          <div style={{ height: "176px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Profit"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Page>
    </Document>
  );
}
