"use client";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TrendChart({ data }: { data: any[] | null }) {
  // 🔹 Jika data kosong/null, tampilkan placeholder
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-gray-900/70 backdrop-blur-md border border-gray-800 p-6 rounded-2xl shadow-lg text-center text-gray-400">
        <h2 className="text-xl font-semibold mb-2 text-gray-200">
          Report Trends
        </h2>
        <p className="text-gray-500">Tidak ada data tren untuk ditampilkan.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/70 backdrop-blur-md border border-gray-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-200">
        Report Trends
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="month" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#0ea5e9"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
