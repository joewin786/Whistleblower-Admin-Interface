"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function InvestigatorChart({ data }: { data: any[] | null }) {
  // ✅ Pastikan data valid sebelum render chart
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-gray-900/70 backdrop-blur-md border border-gray-800 p-6 rounded-2xl shadow-lg text-center text-gray-400">
        <h2 className="text-xl font-semibold mb-2 text-gray-200">
          Investigator Performance
        </h2>
        <p className="text-gray-500">
          Tidak ada data performa investigator untuk ditampilkan.
        </p>
      </div>
    );
  }

  // ✅ Pastikan key sesuai dengan backend kamu (lihat penjelasan di bawah)
  const chartData = data.map((item) => ({
    name: item.investigatorName || item.name,
    casesHandled: item.handledReports || 0,
  }));

  return (
    <div className="bg-gray-900/70 backdrop-blur-md border border-gray-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-200">
        Investigator Performance
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="name" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Bar dataKey="casesHandled" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
