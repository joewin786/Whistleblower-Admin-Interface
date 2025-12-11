"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react";
import { PlusCircle } from "lucide-react";

export default function ReportsPage() {
  const router = useRouter();
  const base = process.env.NEXT_PUBLIC_API_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("all");

  async function fetchReports() {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError("No admin token found. Please login.");
        setReports([]); // prevent null issues
        return;
      }

      let url = `${base}/reports`;
      if (filterType !== "all") {
        url += `?reporter_type=${filterType}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Failed to fetch reports (${res.status})`);

      const data = await res.json();

      // 🛡 Fallback aman!
      setReports(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
      setReports([]); // 🛡 pastikan tidak null
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    fetchReports();
  }, [filterType]);

  if (loading)
    return (
      <div className="text-gray-400 text-center py-8">Loading reports...</div>
    );

  if (error) {
  if (error.includes("403")) {
    return (
      <div className="text-center py-8 text-gray-500 italic">
        No reports found
      </div>
    );
  }
  }
    


  return (
    <div className="p-6 bg-gray-950 min-h-screen text-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Incoming Reports
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Daftar laporan masuk dari user dan anonymous
          </p>
        </div>

        {/* Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 transition"
        >
          <option value="all">All Reports</option>
          <option value="authenticated">Authenticated</option>
          <option value="anonymous">Anonymous</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden border border-gray-800 rounded-xl shadow-lg bg-gray-900/40 backdrop-blur-md">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-800/80 text-gray-300 uppercase tracking-wider text-xs">
              <th className="px-6 py-3 text-left">#</th>
              <th className="px-6 py-3 text-left">Title</th>
              <th className="px-6 py-3 text-left">Reporter</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.length > 0 ? (
              reports.map((r, i) => (
                <tr
                  key={r.id}
                  onClick={() => router.push(`/dashboard/reports/${r.id}`)}
                  className="border-t border-gray-800 hover:bg-gray-800/60 transition cursor-pointer"
                >
                  <td className="px-6 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-6 py-3 text-blue-400 font-medium hover:underline">
                    {r.title}
                  </td>
                  <td className="px-6 py-3 text-gray-300">
                    {r.reporter_name || "Anonymous"}
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // 🔥 cegah event dari <tr>
                        router.push(`/dashboard/reports/${r.id}/actions/add`);
                      }}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-md transition-all"
                    >
                      <PlusCircle size={16} />
                      Add Action
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-6 text-gray-500 italic"
                >
                  No reports found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const baseStyle =
    "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold w-fit";

  switch (status) {
    case "resolved":
      return (
        <span className={`${baseStyle} bg-green-800/30 text-green-300`}>
          <CheckCircle size={14} /> Resolved
        </span>
      );
    case "under_review":
      return (
        <span className={`${baseStyle} bg-yellow-800/30 text-yellow-300`}>
          <AlertTriangle size={14} /> Under Review
        </span>
      );
    case "dismissed":
      return (
        <span className={`${baseStyle} bg-red-800/30 text-red-300`}>
          <XCircle size={14} /> Dismissed
        </span>
      );
    case "on_process":
      return (
        <span className={`${baseStyle} bg-blue-800/30 text-blue-300`}>
          <Clock size={14} /> On Process
        </span>
      );
    default:
      return (
        <span className={`${baseStyle} bg-gray-700/40 text-gray-300`}>
          <Clock size={14} /> {status}
        </span>
      );
  }
}
