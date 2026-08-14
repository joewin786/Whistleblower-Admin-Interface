"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { getAdminToken, isSuperAdmin } from "../../../../lib/adminAuth";

export default function AddAdminPage() {
  const router = useRouter();
  const base = process.env.NEXT_PUBLIC_API_URL;
  const token = getAdminToken();

  // ✅ Check superadmin
  if (!isSuperAdmin()) {
    router.push("/dashboard/admins");
    return null;
  }

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validasi
    if (
      !form.full_name.trim() ||
      !form.email.trim() ||
      !form.password.trim() ||
      !form.department.trim()
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);

      // ✅ Endpoint baru untuk create admin
      const res = await fetch(`${base}/admin/management/admins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          department: form.department,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add admin");
      }

      toast.success("✅ Admin created successfully");
      router.push("/dashboard/admins");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to add admin");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 flex flex-col items-center p-6">
      <div className="w-full max-w-lg bg-gray-900 rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/dashboard/admins")}
            className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-blue-400" />
            <h1 className="text-lg font-semibold text-blue-400">
              Add New Admin
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="e.g., John Doe"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@example.com"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimum 8 characters"
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 text-xs"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Confirm Password <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              placeholder="Re-enter password"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Department <span className="text-red-400">*</span>
            </label>
            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Department</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Security">Security</option>
              <option value="Finance">Finance</option>
              <option value="Legal">Legal</option>
            </select>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-blue-300">
              ℹ️ Admin accounts can log in and manage reports, categories, and
              settings.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-md font-medium transition ${
              loading
                ? "bg-blue-500/50 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <Send size={18} />
            {loading ? "Creating Admin..." : "Create Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
