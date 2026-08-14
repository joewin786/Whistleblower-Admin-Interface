"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell,
} from "recharts";

interface InvestigatorData {
  investigator_id: string;
  investigator_name: string;
  role: string;
  handled_reports: number;
  resolved_reports: number;
  avg_response_time: string;
}

interface ChartDataItem {
  name: string;
  Resolved: number;
  Pending: number;
  total: number;
  avgTime: string;
}

export default function InvestigatorChart({
  data,
}: {
  data: InvestigatorData[] | null;
}) {
  // ✅ Debug logging
  console.log("📊 Investigator data:", data);

  // ✅ Validasi data
  if (!data || !Array.isArray(data)) {
    console.warn("⚠️ Data is not an array:", data);
    return <EmptyState message="Data tidak valid" />;
  }

  if (data.length === 0) {
    console.warn("⚠️ Data array is empty");
    return <EmptyState message="Tidak ada data investigator" />;
  }

  // ✅ Mapping data untuk stacked bar chart
  const chartData: ChartDataItem[] = data.map((item) => {
    const handled = item.handled_reports || 0;
    const resolved = item.resolved_reports || 0;
    const pending = Math.max(0, handled - resolved); // Pastikan tidak negatif

    return {
      name: item.investigator_name || "Unknown",
      Resolved: resolved, // ✅ Capitalize untuk legend
      Pending: pending, // ✅ Capitalize untuk legend
      total: handled,
      avgTime: item.avg_response_time || "N/A",
    };
  });

  console.log("📊 Final chart data:", chartData);

  // ✅ Helper untuk calculate total dengan safe checking
  const calculateTotal = (
    key: keyof Pick<ChartDataItem, "Resolved" | "Pending" | "total">
  ) => {
    if (!chartData || chartData.length === 0) return 0;
    return chartData.reduce((sum, item) => {
      const value = Number(item[key]) || 0;
      return sum + value;
    }, 0);
  };

  // ✅ Custom tooltip untuk menampilkan info lengkap
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="font-semibold text-gray-100 mb-2">{data.name}</p>
          <div className="space-y-1 text-sm">
            <p className="text-green-400">
              ✓ Resolved: <span className="font-semibold">{data.Resolved}</span>
            </p>
            <p className="text-yellow-400">
              ⏳ Pending: <span className="font-semibold">{data.Pending}</span>
            </p>
            <p className="text-blue-400">
              📊 Total: <span className="font-semibold">{data.total}</span>
            </p>
            <p className="text-gray-400 text-xs mt-2 pt-2 border-t border-gray-700">
              Avg Time: {data.avgTime}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-900/70 backdrop-blur-md border border-gray-800 p-6 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-200">
          Investigator Performance
        </h2>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-400">Resolved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-gray-400">Pending</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 60 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#374151"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            stroke="#9ca3af"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
            label={{
              value: "Reports",
              angle: -90,
              position: "insideLeft",
              style: { fill: "#9ca3af", fontSize: 12 },
            }}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "transparent" }}
          />

          {/* ✅ Stacked Bars - HANYA 2 BAR, tidak ada yang lain */}
          <Bar
            dataKey="Resolved"
            stackId="a"
            fill="#22c55e"
            radius={[0, 0, 4, 4]}
            isAnimationActive={false}
          />
          <Bar
            dataKey="Pending"
            stackId="a"
            fill="#eab308"
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* ✅ Summary stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">
            {chartData.reduce((sum, item) => sum + item.Resolved, 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total Resolved</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {chartData.reduce((sum, item) => sum + item.Pending, 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total Pending</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-400">
            {chartData.reduce((sum, item) => sum + item.total, 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total Handled</p>
        </div>
      </div>

      {/* ✅ Debug info (hapus di production) */}
      {process.env.NODE_ENV === "development" && (
        <details className="mt-4 text-xs text-gray-500">
          <summary className="cursor-pointer hover:text-gray-400">
            Debug Info
          </summary>
          <pre className="mt-2 p-2 bg-gray-800 rounded overflow-auto max-h-40">
            {JSON.stringify({ rawData: data, chartData }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

// ✅ Reusable empty state component
function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-gray-900/70 backdrop-blur-md border border-gray-800 p-6 rounded-2xl shadow-lg text-center text-gray-400">
      <h2 className="text-xl font-semibold mb-2 text-gray-200">
        Investigator Performance
      </h2>
      <div className="flex flex-col items-center justify-center py-8">
        <svg
          className="w-16 h-16 text-gray-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p className="text-gray-500">{message}</p>
        <p className="text-xs text-gray-600 mt-2">
          Pastikan ada investigator aktif dengan laporan yang ditugaskan
        </p>
      </div>
    </div>
  );
}
