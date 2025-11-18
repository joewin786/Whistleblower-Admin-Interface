"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  MessageSquare,
  ClipboardList,
  ArrowLeft,
  Mail,
  FileText,
  Brain,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default function ReportDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [evidences, setEvidences] = useState<any[]>([]);
  const [loadingEvidence, setLoadingEvidence] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ type: string; message: string } | null>(
    null
  );

  // 🆕 New states for review & AI
  const [existingReview, setExistingReview] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAIResultModal, setShowAIResultModal] = useState(false);

  const [review, setReview] = useState({
    credibility_score: 5,
    evidence_quality: 5,
    consistency_score: 5,
    source_reliability: 5,
    urgency_level: "medium",
    review_notes: "",
  });

  const base = process.env.NEXT_PUBLIC_API_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const showToast = (type: string, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`${base}/reports/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Failed to load report (${res.status})`);
        const data = await res.json();
        setReport(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [id]);

  useEffect(() => {
    async function fetchEvidence() {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/reports/${id}/evidence`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setEvidences(data);
      } catch (err) {
        console.error("Gagal memuat evidence:", err);
      } finally {
        setLoadingEvidence(false);
      }
    }
    fetchEvidence();
  }, [id]);

  // 🆕 Fetch existing review & AI analysis
  useEffect(() => {
    async function fetchReviewAndAI() {
      if (!token || !id) return;

      try {
        const reviewRes = await fetch(
          `${base}/admin/config/reviews/report/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (reviewRes.ok) {
          const reviewData = await reviewRes.json();
          setExistingReview(reviewData);
        }
      } catch (err) {
        console.log("No existing review");
      }

      try {
        const aiRes = await fetch(`${base}/admin/config/ai/analysis/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          setAiAnalysis(aiData);
        }
      } catch (err) {
        console.log("No AI analysis yet");
      }
    }
    fetchReviewAndAI();
  }, [id, token]);

  const handleSubmitReview = async () => {
    if (!review.review_notes.trim()) {
      showToast("error", "Please add review notes");
      return;
    }

    try {
      showToast("info", "Saving review...");

      const res = await fetch(`${base}/admin/config/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          report_id: Number(id),
          ...review,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast("error", data.error || "Failed to save review");
        return;
      }

      showToast("success", "Review saved successfully!");
      setExistingReview(data.review);
      setShowReviewModal(false);
      setReport({ ...report, status: "under_review" });
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to save review");
    }
  };

  const handleTriggerAI = async () => {
    if (!existingReview) {
      showToast("error", "Please save review first");
      return;
    }

    try {
      showToast("info", "AI is analyzing...");

      const aiRes = await fetch(`${base}/admin/config/ai/analyze/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const aiData = await aiRes.json();

      if (!aiRes.ok) {
        showToast("error", aiData.error || "AI analysis failed");
        return;
      }

      showToast("success", "AI analysis completed!");
      setAiAnalysis(aiData.analysis);
      setShowAIResultModal(true);

      if (aiData.new_status) {
        setReport({ ...report, status: aiData.new_status });
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to run AI analysis");
    }
  };

  const calculateOverallScore = () => {
    const {
      credibility_score,
      evidence_quality,
      consistency_score,
      source_reliability,
    } = review;
    return (
      (credibility_score +
        evidence_quality +
        consistency_score +
        source_reliability) /
      4
    ).toFixed(1);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-400 animate-pulse">
        Loading report details...
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 p-6">⚠️ Failed to load report: {error}</div>
    );

  if (!report)
    return (
      <div className="text-gray-400 p-6">No report data found for ID {id}</div>
    );

  return (
    <div className="p-8 text-gray-200 space-y-6">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === "success"
              ? "bg-green-600"
              : toast.type === "error"
              ? "bg-red-600"
              : "bg-blue-600"
          } text-white`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/dashboard/reports")}
          className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition"
        >
          <ArrowLeft size={18} /> Back to Reports
        </button>

        <select
          value={report.status}
          onChange={async (e) => {
            const newStatus = e.target.value;
            try {
              const res = await fetch(`${base}/reports/${id}`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
              });
              if (!res.ok) throw new Error("Failed to update status");
              setReport({ ...report, status: newStatus });
              window.dispatchEvent(
                new CustomEvent("reportUpdated", {
                  detail: { id, status: newStatus },
                })
              );
            } catch (err) {
              alert("❌ Gagal mengubah status laporan.");
              console.error(err);
            }
          }}
          className={`px-3 py-1 rounded-md text-sm font-semibold cursor-pointer bg-gray-800 border border-gray-700 hover:border-gray-500 transition ${
            report.status === "resolved"
              ? "text-green-300"
              : report.status === "under_review"
              ? "text-yellow-300"
              : "text-gray-300"
          }`}
        >
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6 hover:border-gray-700 transition-all duration-200">
        <h1 className="text-3xl font-bold text-blue-400 mb-3">
          {report.title}
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          Report ID: #{report.id} •{" "}
          {report.createdAt
            ? new Date(report.createdAt).toLocaleString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Unknown date"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <p className="text-sm text-gray-400">Reporter Type</p>
            <p className="font-medium mt-1">
              {report.reporterType === "authenticated"
                ? "Authenticated User"
                : "Anonymous"}
            </p>
            {report.reporterType === "anonymous" && report.email && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                <Mail size={16} className="text-gray-500" />
                <span>{report.email}</span>
              </div>
            )}
          </div>
          {report.category && (
            <div>
              <p className="text-sm text-gray-400">Category</p>
              <p className="font-medium mt-1">{report.category}</p>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-400 mb-1">Description</p>
          <p className="bg-gray-800/50 rounded-xl p-4 text-gray-300 leading-relaxed">
            {report.description}
          </p>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">Evidence</h3>
          {loadingEvidence ? (
            <p className="text-gray-400">Loading evidence...</p>
          ) : evidences.length === 0 ? (
            <p className="text-gray-500">No evidence uploaded.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {evidences.map((file) => (
                <EvidenceItem key={file.id} file={file} />
              ))}
            </div>
          )}
        </div>

        {(existingReview || aiAnalysis) && (
          <div className="mt-6 pt-6 border-t border-gray-800">
            <h3 className="text-lg font-semibold text-blue-400 mb-3">
              Admin Review & AI Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {existingReview && (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-300">
                      Review Status
                    </p>
                    <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">
                      Reviewed
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Credibility</p>
                      <p className="text-blue-400 font-bold">
                        {existingReview.credibility_score}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Evidence</p>
                      <p className="text-blue-400 font-bold">
                        {existingReview.evidence_quality}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Consistency</p>
                      <p className="text-blue-400 font-bold">
                        {existingReview.consistency_score}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Reliability</p>
                      <p className="text-blue-400 font-bold">
                        {existingReview.source_reliability}/10
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-500">Overall Score</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {existingReview.overall_score?.toFixed(1)}/10
                    </p>
                  </div>
                </div>
              )}
              {aiAnalysis && (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-300">
                      AI Analysis
                    </p>
                    <button
                      onClick={() => setShowAIResultModal(true)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      View Details
                    </button>
                  </div>
                  <div className="text-center">
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-lg mb-2 ${
                        aiAnalysis.verdict === "verified"
                          ? "bg-green-900/30 text-green-400"
                          : aiAnalysis.verdict === "hoax"
                          ? "bg-red-900/30 text-red-400"
                          : "bg-yellow-900/30 text-yellow-400"
                      }`}
                    >
                      {aiAnalysis.verdict === "verified" ? (
                        <CheckCircle size={20} />
                      ) : aiAnalysis.verdict === "hoax" ? (
                        <XCircle size={20} />
                      ) : (
                        <AlertCircle size={20} />
                      )}
                      {aiAnalysis.verdict.toUpperCase()}
                    </div>
                    <p className="text-sm text-gray-400">
                      Confidence: {aiAnalysis.confidence?.toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={() => router.push(`/dashboard/reports/${id}/actions`)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all duration-200"
          >
            <ClipboardList size={16} /> View Actions
          </button>
          <button
            onClick={() => router.push(`/dashboard/reports/${id}/messages`)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all duration-200"
          >
            <MessageSquare size={16} /> Send Message
          </button>
          {!existingReview && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all duration-200"
            >
              <FileText size={16} /> Review Report
            </button>
          )}
          {existingReview && !aiAnalysis && (
            <button
              onClick={handleTriggerAI}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all duration-200"
            >
              <Brain size={16} /> Run AI Analysis
            </button>
          )}
          {aiAnalysis && (
            <button
              onClick={() => setShowAIResultModal(true)}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all duration-200"
            >
              <Brain size={16} /> View AI Result
            </button>
          )}
        </div>
      </div>

      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-xl max-w-md w-full shadow-xl border border-gray-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-blue-400 mb-4">
              Review Report #{id}
            </h2>
            <div className="space-y-4">
              {[
                { key: "credibility_score", label: "Credibility Score" },
                { key: "evidence_quality", label: "Evidence Quality" },
                { key: "consistency_score", label: "Consistency Score" },
                { key: "source_reliability", label: "Source Reliability" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm text-gray-300">{label}</label>
                    <span className="text-sm font-bold text-blue-400">
                      {(review as any)[key]}/10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={(review as any)[key]}
                    onChange={(e) =>
                      setReview({ ...review, [key]: +e.target.value })
                    }
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              ))}
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">Overall Score</p>
                <p className="text-3xl font-bold text-blue-400">
                  {calculateOverallScore()}/10
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Urgency Level
                </label>
                <select
                  value={review.urgency_level}
                  onChange={(e) =>
                    setReview({ ...review, urgency_level: e.target.value })
                  }
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-gray-200"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="critical">🔴 Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Review Notes
                </label>
                <textarea
                  rows={3}
                  value={review.review_notes}
                  onChange={(e) =>
                    setReview({ ...review, review_notes: e.target.value })
                  }
                  placeholder="Add your detailed observations..."
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-gray-200 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAIResultModal && aiAnalysis && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-xl max-w-2xl w-full shadow-xl border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
                <Brain size={20} /> AI Analysis Result
              </h2>
              <button
                onClick={() => setShowAIResultModal(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="text-center py-4 bg-gray-800/50 rounded-lg">
                <div
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-xl ${
                    aiAnalysis.verdict === "verified"
                      ? "bg-green-900/30 text-green-400"
                      : aiAnalysis.verdict === "hoax"
                      ? "bg-red-900/30 text-red-400"
                      : "bg-yellow-900/30 text-yellow-400"
                  }`}
                >
                  {aiAnalysis.verdict === "verified" ? (
                    <CheckCircle size={24} />
                  ) : aiAnalysis.verdict === "hoax" ? (
                    <XCircle size={24} />
                  ) : (
                    <AlertCircle size={24} />
                  )}
                  {aiAnalysis.verdict.toUpperCase()}
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  AI Confidence: {aiAnalysis.confidence?.toFixed(1)}%
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-300 mb-2">
                  AI Reasoning
                </p>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {aiAnalysis.reasoning}
                </p>
              </div>
              {aiAnalysis.red_flags && aiAnalysis.red_flags.length > 0 && (
                <div className="bg-red-900/10 border border-red-900/30 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-400 mb-2">
                    🚩 Red Flags
                  </p>
                  <ul className="space-y-1">
                    {aiAnalysis.red_flags.map((flag: string, idx: number) => (
                      <li
                        key={idx}
                        className="text-sm text-gray-400 flex items-start gap-2"
                      >
                        <span className="text-red-500">•</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {aiAnalysis.supporting_factors &&
                aiAnalysis.supporting_factors.length > 0 && (
                  <div className="bg-green-900/10 border border-green-900/30 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-400 mb-2">
                      ✓ Supporting Factors
                    </p>
                    <ul className="space-y-1">
                      {aiAnalysis.supporting_factors.map(
                        (factor: string, idx: number) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-400 flex items-start gap-2"
                          >
                            <span className="text-green-500">•</span>
                            <span>{factor}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              {aiAnalysis.recommendation && (
                <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-400 mb-2">
                    💡 Recommendation
                  </p>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {aiAnalysis.recommendation}
                  </p>
                </div>
              )}
              <button
                onClick={() => setShowAIResultModal(false)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EvidenceItem({ file }: { file: any }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const fileUrl = `${apiUrl}/${file.file_path}`;
  const isImage = file.file_type?.startsWith("image/");
  const isPdf = file.file_type === "application/pdf";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex flex-col items-center text-center">
      {isImage ? (
        <img
          src={fileUrl}
          alt="evidence"
          className="rounded-lg object-cover w-full h-40 border border-gray-700 mb-2"
        />
      ) : isPdf ? (
        <iframe
          src={fileUrl}
          title="PDF Evidence"
          className="w-full h-40 border border-gray-700 rounded-lg mb-2"
        />
      ) : (
        <div className="text-gray-400 text-sm mb-2">
          📄{" "}
          <a
            href={fileUrl}
            target="_blank"
            className="text-blue-400 hover:underline"
          >
            {file.file_path.split("/").pop()}
          </a>
        </div>
      )}
      <a
        href={fileUrl}
        target="_blank"
        className="text-blue-400 hover:underline text-sm"
      >
        Buka File
      </a>
    </div>
  );
}
