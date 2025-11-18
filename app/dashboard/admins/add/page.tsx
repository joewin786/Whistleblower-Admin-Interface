"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import toast from "react-hot-toast";

export default function AddAdminPage() {
  const router = useRouter();
  const base = process.env.NEXT_PUBLIC_API_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    department: "",
    role: "admin",
  });

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.full_name.trim() ||
      !form.email.trim() ||
      !form.department.trim()
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${base}/admin/config/admins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to add admin");
      toast.success("✅ Admin added successfully");
      router.push("/dashboard/admins");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add admin");
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
          <h1 className="text-lg font-semibold text-blue-400">Add New Admin</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Nama lengkap admin"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Alamat email"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Department
            </label>
            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Departemen</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Security">Security</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="admin">Admin</option>
              <option value="investigator">Investigator</option>
              <option value="superadmin">Super Admin</option>
            </select>
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
            {loading ? "Saving..." : "Add Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
