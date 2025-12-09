"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RoleConfig() {
  const base = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();

  const [roles, setRoles] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fungsi untuk get token dengan handling
  const getToken = () => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/login");
      return null;
    }
    return token;
  };

  async function fetchRoles() {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${base}/admin/config/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle 401 - token invalid/expired
      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      // Cek apakah response OK
      if (!res.ok) {
        const text = await res.text();
        console.error("Response not OK:", res.status, text);
        setError(`Failed to fetch roles: ${res.status}`);
        return;
      }

      // Cek content-type
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Response is not JSON:", text);
        setError("Server returned non-JSON response");
        return;
      }

      const data = await res.json();
      setRoles(data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  async function createRole() {
    if (!name.trim()) return;

    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${base}/admin/config/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      // Handle 401
      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        console.error("Create failed:", res.status, text);
        setError(`Failed to create role: ${res.status}`);
        return;
      }

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        await res.json();
      }

      setName("");
      await fetchRoles();
    } catch (err) {
      console.error("Create error:", err);
      setError(err instanceof Error ? err.message : "Failed to create role");
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(id: string, newName: string) {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${base}/admin/config/roles/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName }),
      });

      // Handle 401
      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        console.error("Update failed:", res.status, text);
        setError(`Failed to update role: ${res.status}`);
        return;
      }

      await fetchRoles();
    } catch (err) {
      console.error("Update error:", err);
      setError(err instanceof Error ? err.message : "Failed to update role");
    }
  }

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Roles</h2>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 rounded-md bg-gray-800 text-gray-200"
          placeholder="Role name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && createRole()}
        />
        <button
          onClick={createRole}
          disabled={loading || !name.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-md"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>

      <ul className="space-y-2">
        {roles.map((r) => (
          <li
            key={r.id}
            className="flex justify-between items-center border-b border-gray-800 py-2"
          >
            <span>{r.name}</span>
            <button
              onClick={() => {
                const newName = prompt("Enter new name:", r.name);
                if (newName && newName.trim()) updateRole(r.id, newName);
              }}
              className="text-blue-400 hover:underline"
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}