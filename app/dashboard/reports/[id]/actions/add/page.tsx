"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import toast from "react-hot-toast";



export default function AddActionPage() {
  
  const router = useRouter();
  const params = useParams();
  const reportId = params?.id;

  const base = process.env.NEXT_PUBLIC_API_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  const [form, setForm] = useState({
    action_description: "",
    department: "",
    responsible_person: "",
    handle_at: "",
    estimated_completion: "",
  });

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<
    {id: number ,full_name: string; department: string }[]
  >([]);

  // 🧭 Simulasi data pegawai — kalau sudah ada endpoint user di backend, tinggal fetch dari sana
  useEffect(() => {
  async function fetchInvestigators() {
    const res = await fetch(`${base}/admin/management/investigators`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setEmployees(
      data.map((inv: any) => ({
        id: inv.id ?? inv.ID,
        full_name: inv.full_name ?? inv.FullName,
        department: inv.department ?? inv.Department,
      }))
    );
  }
  fetchInvestigators();
}, []);

  // filter nama sesuai department yang dipilih
  const filteredEmployees = form.department
    ? employees.filter(
        (emp) =>
          emp.department?.toLowerCase() === form.department?.toLowerCase()
      )
    : [];


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.action_description.trim()) {
      toast.error("Deskripsi tindakan wajib diisi");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${base}/admin/config/actions/${reportId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action_description: form.action_description,
          department: form.department,
          responsible_person: form.responsible_person,
          handle_at: form.handle_at ? new Date(form.handle_at) : null,
          estimated_completion: form.estimated_completion
            ? new Date(form.estimated_completion)
            : null,
        }),
      });

      if (!res.ok) throw new Error("Gagal menambahkan action");

      toast.success("✅ Action berhasil ditambahkan!");
      router.push(`/dashboard/reports/${reportId}/actions`);
    } catch (err) {
      toast.error("Gagal menambahkan action");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 flex flex-col items-center p-6">
      <div className="w-full max-w-2xl bg-gray-900 rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition"
          >
            <ArrowLeft size={18} /> Kembali
          </button>
          <h1 className="text-xl font-semibold text-blue-400">
            Tambah Action untuk Report #{reportId}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Action Description
            </label>
            <textarea
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={form.action_description}
              onChange={(e) =>
                setForm({ ...form, action_description: e.target.value })
              }
              placeholder="Deskripsikan tindakan yang akan dilakukan..."
            />
          </div>

          {/* Department + Responsible Person */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Department
              </label>
              <select
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
                value={form.department}
                onChange={(e) =>
                  setForm({
                    ...form,
                    department: e.target.value,
                    responsible_person: "", // reset saat department berubah
                  })
                }
              >
                <option value="">Pilih Departemen</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            {/* Responsible Person */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Responsible Person
              </label>
              <select
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
                value={form.responsible_person}
                onChange={(e) =>
                  setForm({ ...form, responsible_person: e.target.value })
                }
                disabled={!form.department}
              >
                <option value="">
                  {form.department
                    ? "Pilih Penanggung Jawab"
                    : "Pilih Departemen terlebih dahulu"}
                </option>
                {filteredEmployees.map((emp) => (
                  <option key={emp.id} value={emp.full_name}>
                    {emp.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Handle Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Handle At (Waktu Mulai)
              </label>
              <input
                type="datetime-local"
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
                value={form.handle_at}
                onChange={(e) =>
                  setForm({ ...form, handle_at: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Estimated Completion (Perkiraan Selesai)
              </label>
              <input
                type="datetime-local"
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
                value={form.estimated_completion}
                onChange={(e) =>
                  setForm({ ...form, estimated_completion: e.target.value })
                }
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-md text-white font-medium transition ${
              loading
                ? "bg-blue-500/50 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <Send size={18} />
            {loading ? "Mengirim..." : "Tambah Action"}
          </button>
        </form>
      </div>
    </div>
  );
}
