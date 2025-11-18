"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AnalysisCard from "./components/AnalysisCard";

interface AIAnalysis {
  id: number;
  report_id: number;
  verdict: string;
  confidence: number;
  reasoning: string;
  red_flags: string[];
  supporting_factors: string[];
  recommendation: string;
  ai_model: string;
  analyzed_at: string;
}

export default function AIAnalysisPage() {
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAI, setCheckingAI] = useState(false);
  const [aiStatus, setAiStatus] = useState<{
    configured: boolean;
    message: string;
  } | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  // 🔹 1. Cek koneksi Mistral AI
  const checkAIConnection = async () => {
    setCheckingAI(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/config/ai/test-connection`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setAiStatus(data);
    } catch (err) {
      console.error(err);
      setAiStatus({ configured: false, message: "Gagal memeriksa Mistral AI" });
    } finally {
      setCheckingAI(false);
    }
  };

  // 🔹 2. Ambil semua hasil AI Analysis
  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/config/ai/analyses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setAnalyses(data.analyses || []);
      setStats(data.stats);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data analisis AI");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      checkAIConnection();
      fetchAnalyses();
    }
  }, [token]);

  // 🔹 3. Jalankan analisis ulang
  const reAnalyze = async (reportId: number) => {
    const confirm = window.confirm("Analisis ulang laporan ini dengan AI?");
    if (!confirm) return;

    toast.loading("AI sedang menganalisis...");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ai/reanalyze/${reportId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      toast.dismiss();
      if (res.ok) {
        toast.success("Analisis AI selesai!");
        fetchAnalyses();
      } else {
        toast.error(data.error || "Gagal melakukan analisis AI");
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Gagal menghubungi server");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">AI Analysis Dashboard</h1>
      <p className="text-gray-500 mb-6">
        Pemantauan dan hasil analisis AI (Mistral) pada laporan whistleblower.
      </p>

      {/* 🔹 Status Mistral AI */}
      <div className="mb-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1">Status Mistral AI</h2>
          {aiStatus ? (
            <p
              className={`${
                aiStatus.configured ? "text-green-500" : "text-red-500"
              }`}
            >
              {aiStatus.message}
            </p>
          ) : (
            <p className="text-gray-400">Memeriksa koneksi...</p>
          )}
        </div>
        <button
          onClick={checkAIConnection}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          {checkingAI ? "Memeriksa..." : "Periksa Ulang"}
        </button>
      </div>

      {/* 🔹 Statistik AI */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Total Analisis</h3>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
            <h3 className="text-sm text-green-700 dark:text-green-300">
              Verified
            </h3>
            <p className="text-2xl font-bold">{stats.verified}</p>
          </div>
          <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">
            <h3 className="text-sm text-yellow-700 dark:text-yellow-300">
              Unconfirmed
            </h3>
            <p className="text-2xl font-bold">{stats.unconfirmed}</p>
          </div>
          <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
            <h3 className="text-sm text-red-700 dark:text-red-300">Hoax</h3>
            <p className="text-2xl font-bold">{stats.hoax}</p>
          </div>
        </div>
      )}

      {/* 🔹 Daftar Analisis */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-500">Memuat hasil analisis...</p>
        ) : analyses.length === 0 ? (
          <p className="text-gray-400">Belum ada analisis AI.</p>
        ) : (
          analyses.map((a) => (
            <AnalysisCard
              key={a.id}
              id={a.id}
              reportId={a.report_id}
              verdict={a.verdict}
              confidence={a.confidence}
              reasoning={a.reasoning}
              redFlags={a.red_flags}
              supportingFactors={a.supporting_factors}
              recommendation={a.recommendation}
              aiModel={a.ai_model}
              onReanalyze={reAnalyze}
            />
          ))
        )}
      </div>
    </div>
  );
}
