"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

export default function CategoryChart({ data }: { data: any[] }) {
  // 🔒 Pastikan data aman
  const safeArray = Array.isArray(data) ? data : [];

  // 🔄 Convert dari backend {category, count} → {name, value}
  const mappedData = safeArray
    .filter((item) => item?.category && typeof item?.count === "number")
    .map((item) => ({
      name: item.category,
      value: item.count,
    }));

  const hasData = mappedData.length > 0;

  return (
    <div className="bg-gray-900/70 backdrop-blur-md border border-gray-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-200">
        Reports by Category
      </h2>

      {/* 🚫 Tidak ada data → tampilkan placeholder */}
      {!hasData ? (
        <div className="flex items-center justify-center h-[300px] text-gray-400">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={mappedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={110}
              dataKey="value"
              label={({ name, value }) => `${name} (${value})`}
            >
              {mappedData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                borderRadius: "8px",
                border: "1px solid #374151",
              }}
              labelStyle={{ color: "#fff" }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
