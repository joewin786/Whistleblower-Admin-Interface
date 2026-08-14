"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { getAdminToken, getAdminData } from "../../../../lib/adminAuth";

export default function AddInvestigatorPage() {
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    department: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    const currentAdmin = getAdminData();

    if (!token) {
      router.push("/login");
      return;
    }

    // superadmin atau admin boleh
    const allowed =
      currentAdmin?.role === "superadmin" || currentAdmin?.role === "admin";

    setHasAccess(allowed);
    setAuthChecked(true);
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300">
        Checking access...
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 p-6">
        🚫 You do not have permission to add investigators.
      </div>
    );
  }

  const base = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.full_name || !form.email || !form.department) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const token = getAdminToken();

      const res = await fetch(`${base}/admin/management/investigators`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create investigator");
        return;
      }

      toast.success("Investigator created successfully!");
      router.push("/dashboard/admins");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 flex flex-col items-center p-6">
      <div className="w-full max-w-2xl bg-gray-900 rounded-xl shadow-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <h1 className="text-xl font-semibold text-purple-400">
            Add New Investigator
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Full Name
            </label>
            <input
              type="text"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Investigator Full Name"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="investigator@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Department
            </label>
            <select
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            >
              <option value="">Select Department</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Security">Security</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-md text-white font-medium transition ${
              loading
                ? "bg-purple-500/40 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            <UserPlus size={18} />
            {loading ? "Creating..." : "Create Investigator"}
          </button>
        </form>
      </div>
    </div>
  );
}
