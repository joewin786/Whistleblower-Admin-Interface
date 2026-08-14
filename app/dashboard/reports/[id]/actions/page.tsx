"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ClipboardList,
  Clock,
  User,
  Building2,
  Calendar,
  CheckCircle2,
  Pencil
} from "lucide-react";

export default function ViewActionsPage() {
  const { id: reportId } = useParams();
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const base = process.env.NEXT_PUBLIC_API_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  async function fetchActions() {
    try {
      setLoading(true);
      const res = await fetch(`${base}/admin/config/actions/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch actions (${res.status})`);
      const data = await res.json();
      setActions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchActions();
  }, [reportId]);

  async function markCompleted(actionId: number) {
    try {
      const res = await fetch(
        `${base}/admin/config/actions/${reportId}/complete`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to complete action");

      alert("Action marked as completed!");
      fetchActions();
    } catch (err) {
      alert("Failed to update action");
      console.error(err);
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          Loading actions...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-red-400">
        {error}
      </div>
    );

  return (
    <div className="p-8 text-gray-200 bg-gray-950 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <ClipboardList className="text-blue-400" size={28} />
        <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          Actions for Report #{reportId}
        </h1>
      </div>

      {actions.length === 0 ? (
        <div className="bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-xl p-12 text-center">
          <ClipboardList className="mx-auto mb-4 text-gray-600" size={48} />
          <p className="text-gray-500 text-lg">
            No actions found for this report.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {actions.map((action, index) => (
            <div
              key={action.id}
              className="bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-xl p-6 hover:bg-gray-800/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 text-blue-400 rounded-lg px-3 py-1 font-bold text-sm">
                    #{index + 1}
                  </div>
                  <StatusBadge status={action.status} />
                </div>
                <div className="text-xs text-gray-500">ID: {action.id}</div>
              </div>

              <h3 className="text-lg font-semibold text-blue-300 mb-4">
                {action.action_description || "No description"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ActionItem
                  icon={<Building2 size={18} className="text-gray-400" />}
                  label="Department"
                  value={action.department}
                />
                <ActionItem
                  icon={<User size={18} className="text-gray-400" />}
                  label="Responsible Person"
                  value={action.responsible_person}
                />
                <ActionItem
                  icon={<Calendar size={18} className="text-gray-400" />}
                  label="Handle At"
                  value={
                    action.handle_at
                      ? new Date(action.handle_at).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Not scheduled"
                  }
                />
                <ActionItem
                  icon={<Clock size={18} className="text-gray-400" />}
                  label="Estimated Completion"
                  value={
                    action.estimated_completion
                      ? new Date(
                          action.estimated_completion
                        ).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Not set"
                  }
                />
              </div>

              {/* 📌 Action Buttons (Edit + Complete) */}
              <div className="flex gap-3 mt-6">
                {/* Edit Button */}
                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/reports/${reportId}/actions/${action.id}/edit`
                    )
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition"
                >
                  <Pencil size={16} />
                  Edit Action
                </button>

                {/* Mark Complete Button */}
                {action.status !== "completed" && (
                  <button
                    onClick={() => markCompleted(action.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition"
                  >
                    <CheckCircle2 size={16} />
                    Mark as Completed
                  </button>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
                <div>
                  Created:{" "}
                  {new Date(action.created_at).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
                <div>
                  Updated:{" "}
                  {new Date(action.updated_at).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionItem({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {icon}
      <div>
        <div className="text-gray-500 text-xs">{label}</div>
        <div className="text-gray-200 font-medium">{value || "N/A"}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
        status === "completed"
          ? "bg-green-700/30 text-green-300 border-green-600/40"
          : "bg-blue-800/30 text-blue-300 border-blue-700/40"
      }`}
    >
      <Clock size={14} />
      {status === "completed" ? "Completed" : "On Process"}
    </span>
  );
}
