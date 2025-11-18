"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, CheckCircle, XCircle } from "lucide-react";

export default function AdminListPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const base = process.env.NEXT_PUBLIC_API_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  useEffect(() => {
    async function fetchAdmins() {
      try {
        const res = await fetch(`${base}/admin/config/admins`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch admins");
        const data = await res.json();
        setAdmins(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAdmins();
  }, []);

  if (loading) return <p className="text-gray-400 p-6">Loading admins...</p>;
  if (error) return <p className="text-red-500 p-6">{error}</p>;

  return (
    <div className="p-8 text-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-400">Admin Management</h1>
        <button
          onClick={() => router.push("/dashboard/admins/add")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-all"
        >
          <PlusCircle size={16} /> Add Admin
        </button>
      </div>

      <div className="overflow-x-auto bg-gray-900 rounded-lg border border-gray-800 shadow-md">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Full Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Department</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {admins.length > 0 ? (
              admins.map((admin, i) => (
                <tr
                  key={admin.id}
                  className="border-b border-gray-800 hover:bg-gray-850 transition"
                >
                  <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-2">{admin.full_name}</td>
                  <td className="px-4 py-2 text-gray-300">{admin.email}</td>
                  <td className="px-4 py-2">{admin.department}</td>
                  <td className="px-4 py-2 capitalize">{admin.role}</td>
                  <td className="px-4 py-2">
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
                  className="text-center py-4 text-gray-500 italic"
                >
                  No admins found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
