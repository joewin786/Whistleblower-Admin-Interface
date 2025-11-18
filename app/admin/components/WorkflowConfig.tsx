"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Plus,
  Trash2,
  GripVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  GitBranch,
} from "lucide-react";

interface Workflow {
  id?: number;
  name: string;
  order: number;
  isActive: boolean;
  update_at?: string;
}

export default function WorkflowConfig() {
  const base = process.env.NEXT_PUBLIC_API_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  async function fetchWorkflows() {
    try {
      setLoading(true);
      const res = await fetch(`${base}/admin/config/workflows`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.warn(
          "No workflows found or error fetching, status:",
          res.status
        );
        setWorkflows([]);
        return;
      }

      const data = await res.json();

      if (!data || data.length === 0) {
        setWorkflows([]);
        return;
      }

      const sortedData = data.sort(
        (a: Workflow, b: Workflow) => a.order - b.order
      );
      setWorkflows(sortedData);
    } catch (error) {
      console.error("Error fetching workflows:", error);
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateWorkflows() {
    try {
      setSaving(true);

      const workflowsToSave = workflows.map((wf) => ({
        id: wf.id || 0,
        name: wf.name,
        order: wf.order,
        isActive: wf.isActive,
      }));

      console.log("Saving workflows:", workflowsToSave);

      const res = await fetch(`${base}/admin/config/workflows`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(workflowsToSave),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server response:", errorText);
        throw new Error("Failed to update workflows: " + res.status);
      }

      alert("Workflows updated successfully!");
      fetchWorkflows();
    } catch (error) {
      console.error("Error updating workflows:", error);
      alert(
        "Failed to update workflows: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setSaving(false);
    }
  }

  function addWorkflow() {
    if (!newWorkflowName.trim()) {
      alert("Please enter a workflow name");
      return;
    }

    const newWorkflow: Workflow = {
      name: newWorkflowName.trim(),
      order: workflows.length + 1,
      isActive: true,
    };

    setWorkflows([...workflows, newWorkflow]);
    setNewWorkflowName("");
    setShowAddForm(false);
  }

  function deleteWorkflow(index: number) {
    if (confirm("Are you sure you want to delete this workflow?")) {
      const updated = workflows.filter((_, i) => i !== index);
      const reordered = updated.map((wf, i) => ({ ...wf, order: i + 1 }));
      setWorkflows(reordered);
    }
  }

  function toggleActive(index: number) {
    const updated = [...workflows];
    updated[index].isActive = !updated[index].isActive;
    setWorkflows(updated);
  }

  function updateName(index: number, name: string) {
    const updated = [...workflows];
    updated[index].name = name;
    setWorkflows(updated);
  }

  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...workflows];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);

    const reordered = updated.map((wf, i) => ({ ...wf, order: i + 1 }));
    setWorkflows(reordered);
    setDraggedIndex(index);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
  }

  useEffect(() => {
    fetchWorkflows();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitBranch className="text-blue-400" size={24} />
          <h2 className="text-2xl font-bold text-blue-300">Manage Workflows</h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} />
            Add Workflow
          </button>
          <button
            onClick={updateWorkflows}
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-blue-200">
          <p className="font-medium mb-1">Workflow Management</p>
          <p className="text-blue-300/80">
            Drag and drop workflows to reorder them. Toggle active status to
            enable/disable workflows. Remember to click "Save Changes" after
            making modifications.
          </p>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-200">
            Add New Workflow
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newWorkflowName}
              onChange={(e) => setNewWorkflowName(e.target.value)}
              placeholder="Enter workflow name"
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === "Enter" && addWorkflow()}
            />
            <button
              onClick={addWorkflow}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewWorkflowName("");
              }}
              className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {workflows.length === 0 ? (
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-12 text-center">
          <GitBranch className="mx-auto mb-4 text-gray-600" size={48} />
          <p className="text-gray-500 text-lg mb-4">No workflows configured</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            Add Your First Workflow
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {workflows.map((workflow, index) => (
            <div
              key={workflow.id || index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-gray-800/50 border border-gray-700 rounded-lg p-4 transition-all ${
                draggedIndex === index
                  ? "opacity-50 scale-95"
                  : "hover:bg-gray-800/70"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300">
                  <GripVertical size={20} />
                </div>

                <div className="bg-blue-900/30 text-blue-300 rounded-lg px-3 py-1 font-bold text-sm min-w-[50px] text-center">
                  #{workflow.order}
                </div>

                <input
                  type="text"
                  value={workflow.name}
                  onChange={(e) => updateName(index, e.target.value)}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Workflow name"
                />

                <button
                  onClick={() => toggleActive(index)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    workflow.isActive
                      ? "bg-green-900/30 text-green-300 hover:bg-green-900/50"
                      : "bg-red-900/30 text-red-300 hover:bg-red-900/50"
                  }`}
                >
                  {workflow.isActive ? (
                    <>
                      <CheckCircle2 size={18} />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle size={18} />
                      Inactive
                    </>
                  )}
                </button>

                <button
                  onClick={() => deleteWorkflow(index)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {workflow.id && (
                <div className="mt-3 ml-10 flex items-center gap-4 text-xs text-gray-500">
                  <span>ID: {workflow.id}</span>
                  {workflow.update_at && (
                    <span>
                      Last updated:{" "}
                      {new Date(workflow.update_at).toLocaleString("id-ID")}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {workflows.length > 0 && (
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-6">
              <span className="text-gray-400">
                Total Workflows:{" "}
                <span className="text-blue-400 font-semibold">
                  {workflows.length}
                </span>
              </span>
              <span className="text-gray-400">
                Active:{" "}
                <span className="text-green-400 font-semibold">
                  {workflows.filter((w) => w.isActive).length}
                </span>
              </span>
              <span className="text-gray-400">
                Inactive:{" "}
                <span className="text-red-400 font-semibold">
                  {workflows.filter((w) => !w.isActive).length}
                </span>
              </span>
            </div>
            <span className="text-gray-500 text-xs">
              Don't forget to save your changes
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
