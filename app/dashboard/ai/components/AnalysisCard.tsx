"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnalysisCardProps {
  id: number;
  reportId: number;
  verdict: string;
  confidence: number;
  reasoning: string;
  redFlags: string[];
  supportingFactors: string[];
  recommendation: string;
  aiModel: string;
  onReanalyze: (reportId: number) => void;
}

export default function AnalysisCard({
  reportId,
  verdict,
  confidence,
  reasoning,
  redFlags,
  supportingFactors,
  recommendation,
  aiModel,
  onReanalyze,
}: AnalysisCardProps) {
  const verdictColor =
    verdict === "verified"
      ? "from-green-400 to-emerald-600"
      : verdict === "hoax"
      ? "from-red-400 to-pink-600"
      : "from-yellow-300 to-amber-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all"
    >
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.3),transparent)]" />

      <div className="p-6 relative z-10">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Laporan #{reportId}
          </h2>

          <span
            className={cn(
              "px-3 py-1 text-sm font-semibold text-white rounded-full shadow-md bg-linear-to-r",
              verdictColor
            )}
          >
            {verdict.toUpperCase()}
          </span>
        </div>

        <p className="text-sm text-gray-500 mb-3">
          Confidence: <strong>{confidence.toFixed(1)}%</strong> | Model:{" "}
          <span className="font-mono text-blue-600 dark:text-blue-400">
            {aiModel}
          </span>
        </p>

        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
          {reasoning}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="p-4 bg-white/60 dark:bg-gray-800/70 rounded-lg border border-gray-200/30 dark:border-gray-700/40">
            <p className="font-semibold text-red-500 mb-2">🚩 Red Flags</p>
            {redFlags.length > 0 ? (
              <ul className="list-disc ml-5 text-gray-700 dark:text-gray-300 space-y-1">
                {redFlags.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">Tidak ada indikator mencurigakan.</p>
            )}
          </div>

          <div className="p-4 bg-white/60 dark:bg-gray-800/70 rounded-lg border border-gray-200/30 dark:border-gray-700/40">
            <p className="font-semibold text-green-500 mb-2">
              ✅ Supporting Factors
            </p>
            {supportingFactors.length > 0 ? (
              <ul className="list-disc ml-5 text-gray-700 dark:text-gray-300 space-y-1">
                {supportingFactors.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">
                Tidak ada faktor pendukung khusus.
              </p>
            )}
          </div>
        </div>

        <div className="mt-5">
          <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
            🧭 Rekomendasi:
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {recommendation}
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => onReanalyze(reportId)}
            className="px-5 py-2.5 bg-linear-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg shadow hover:shadow-lg transition-all"
          >
            🔄 Analisis Ulang
          </button>
        </div>
      </div>
    </motion.div>
  );
}
