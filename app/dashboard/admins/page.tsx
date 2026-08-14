"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  CheckCircle,
  XCircle,
  UserPlus,
  Shield,
} from "lucide-react";
import { getAdminToken, isSuperAdmin, getAdminData } from "../../../lib/adminAuth";

export default function AdminListPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const base = process.env.NEXT_PUBLIC_API_URL;

  // ✅ Gunakan admin_token
  const token = getAdminToken();
  const currentAdmin = getAdminData();
  const canCreateAdmin = isSuperAdmin(); // Hanya superadmin yang bisa create

  useEffect(() => {
    // Redirect jika tidak login
    if (!token) {
      router.push("/login");
      return;
    }

    fetchAdmins();
  }, [token]);

  async function fetchAdmins() {
    try {
      // ✅ Endpoint baru
      const res = await fetch(`${base}/admin/management/admins`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch admins");
      }

      const data = await res.json();
      setAdmins(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 text-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">Admin Management</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage admin users and investigators
          </p>
        </div>

        {/* ✅ Hanya superadmin yang bisa tambah */}
          <div className="flex gap-2">
            {/* Superadmin → boleh add admin */}
            {isSuperAdmin() && (
              <button
                onClick={() => router.push("/dashboard/admins/add")}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                <Shield size={16} /> Add Admin
              </button>
            )}

            {/* Superadmin + Admin → boleh add investigator */}
            {(isSuperAdmin() || currentAdmin?.role === "admin") && (
              <button
                onClick={() =>
                  router.push("/dashboard/admins/add-investigator")
                }
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                <UserPlus size={16} /> Add Investigator
              </button>
            )}
          </div>
        
      </div>

      {/* Info jika role = admin biasa */}
      {currentAdmin?.role === "admin" && (
        <div className="mb-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <p className="text-sm text-blue-400">
            ℹ️ You can only create investigator accounts.
          </p>
        </div>
      )}

      <div className="overflow-x-auto bg-gray-900 rounded-lg border border-gray-800 shadow-md">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Full Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Department</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {admins.length > 0 ? (
              admins.map((admin, i) => (
                <tr
                  key={admin.id}
                  className="border-b border-gray-800 hover:bg-gray-850 transition"
                >
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{admin.full_name}</td>
                  <td className="px-4 py-3 text-gray-300">{admin.email}</td>
                  <td className="px-4 py-3">{admin.department}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        admin.role === "superadmin"
                          ? "bg-red-500/20 text-red-400"
                          : admin.role === "admin"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-purple-500/20 text-purple-400"
                      }`}
                    >
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {admin.is_active ? (
                      <span className="flex items-center gap-1 text-green-400">
                        <CheckCircle size={14} /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-400">
                        <XCircle size={14} /> Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-8 text-gray-500 italic"
                >
                  No admins or investigators found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
