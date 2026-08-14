"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import OverviewCards from "./components/OverviewCards";
import TrendChart from "./components/TrendChart";
import CategoryChart from "./components/CategoryChart";
import InvestigatorChart from "./components/InvestigatorChart";
import Pusher from "pusher-js";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>({
    totalReports: 0,
    underReviewReports: 0,
    resolvedReports: 0,
    dismissedReports: 0,
    totalInvestigators: 0,
  });
  const [trends, setTrends] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const headers = { Authorization: `Bearer ${token}` };

    async function fetchData() {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL;
        const [ov, tr, cat, perf] = await Promise.all([
          fetch(`${base}/analytics/overview`, { headers }).then((r) =>
            r.json()
          ),
          fetch(`${base}/analytics/trends`, { headers }).then((r) => r.json()),
          fetch(`${base}/analytics/by-categories`, { headers }).then((r) =>
            r.json()
          ),
          fetch(`${base}/analytics/investigator-performance`, { headers }).then(
            (r) => r.json()
          ),
        ]);

        setOverview(ov || {});
        setTrends(tr);
        setCategories(cat);
        setPerformance(perf);
      } catch (err) {
        console.error("Gagal memuat data dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    const pusher = new Pusher("239d12869d6500d25b16", { cluster: "ap1" });
    const channel = pusher.subscribe("admin-notifications");

    channel.bind("new-message", (data: any) => {
      toast.success(`${data.title}: ${data.message}`, { duration: 5000 });
    });

    return () => {
      pusher.unsubscribe("admin-notifications");
      pusher.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-300">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
      <div className="ml-64 flex-1 p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto space-y-8"
        >
          <h1 className="text-3xl font-bold mb-2 bg-linear-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Admin Analytics Dashboard
          </h1>
          <p className="text-gray-400 mb-8">
            Visualisasi laporan dan performa investigasi
          </p>

          {/* Overview Cards */}
          <OverviewCards data={overview} />

          {/* Trend Chart */}
          <TrendChart data={trends} />

          {/* Category Chart */}
          <CategoryChart data={categories} />

          {/* Investigator Performance */}
          <InvestigatorChart data={performance} />
        </motion.div>
      </div>
    </div>
  );
}
