"use client";

import { useState, useEffect } from "react";

export default function RoleConfig() {
  const base = process.env.NEXT_PUBLIC_API_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [roles, setRoles] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchRoles() {
    try {
      const res = await fetch(`${base}/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRoles(data);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  }

  async function createRole() {
    setLoading(true);
    try {
      await fetch(`${base}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      setName("");
      fetchRoles();
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(id: string, newName: string) {
    await fetch(`${base}/roles/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newName }),
    });
    fetchRoles();
  }

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Roles</h2>
      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 rounded-md bg-gray-800 text-gray-200"
          placeholder="Role name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={createRole}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
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
                if (newName) updateRole(r.id, newName);
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
