"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
 * Chart components for PDF reports
 *
 * These are client-side components that require browser APIs.
 * For pdfn PDF generation, these need hydration support.
 */

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface RevenueChartProps {
  data: Array<{ month: string; revenue: number; target: number }>;
  width?: number;
  height?: number;
}

export function RevenueChart({
  data,
  width = 580,
  height = 220,
}: RevenueChartProps) {
  const formatCurrency = (v: number) => `$${(v / 1000).toFixed(0)}k`;

  return (
    <LineChart width={width} height={height} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis tickFormatter={formatCurrency} />
      <Tooltip
        formatter={(v) =>
          "$" + (v as number).toLocaleString("en-US")
        }
      />
      <Legend />
      <Line
        type="monotone"
        dataKey="revenue"
        stroke="#0088FE"
        strokeWidth={2}
        name="Revenue"
        isAnimationActive={false}
      />
      <Line
        type="monotone"
        dataKey="target"
        stroke="#82ca9d"
        strokeDasharray="5 5"
        name="Target"
        isAnimationActive={false}
      />
    </LineChart>
  );
}

interface CategoryChartProps {
  data: Array<{ category: string; sales: number }>;
  width?: number;
  height?: number;
}

export function CategoryChart({
  data,
  width = 250,
  height = 180,
}: CategoryChartProps) {
  return (
    <BarChart width={width} height={height} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="category" tick={{ fontSize: 10 }} />
      <YAxis tickFormatter={(v) => `$${v / 1000}k`} />
      <Tooltip
        formatter={(v) =>
          "$" + (v as number).toLocaleString("en-US")
        }
      />
      <Bar dataKey="sales" fill="#0088FE" isAnimationActive={false} />
    </BarChart>
  );
}

interface RegionChartProps {
  data: Array<{ region: string; value: number }>;
  width?: number;
  height?: number;
}

export function RegionChart({
  data,
  width = 280,
  height = 160,
}: RegionChartProps) {
  return (
    <PieChart width={width} height={height}>
      <Pie
        data={data}
        cx={70}
        cy={80}
        innerRadius={25}
        outerRadius={55}
        dataKey="value"
        nameKey="region"
        isAnimationActive={false}
      >
        {data.map((_, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip
        formatter={(v) =>
          "$" + (v as number).toLocaleString("en-US")
        }
      />
      <Legend
        layout="vertical"
        align="right"
        verticalAlign="middle"
        wrapperStyle={{ paddingLeft: 20 }}
      />
    </PieChart>
  );
}
