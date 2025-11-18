"use client";

import { useState, useEffect } from "react";

export default function CategoryConfig() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const base = process.env.NEXT_PUBLIC_API_URL;

  async function fetchCategories() {
    try {
      // 🔹 ambil dari endpoint publik (user)
      const res = await fetch(`${base}/reports/categories`);
      if (!res.ok)
        throw new Error(`Failed to fetch categories (${res.status})`);
      const data = await res.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function createCategory() {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${base}/admin/config/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const errData = await res.text();
        throw new Error(`Failed to create category: ${errData}`);
      }

      setName("");
      fetchCategories(); // refresh daftar dari endpoint user
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function deleteCategory(id: string) {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${base}/admin/config/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete category");
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="text-gray-200">
      <h2 className="text-xl font-semibold mb-4">Manage Categories</h2>

      {error && <p className="text-red-500 mb-2 text-sm">⚠️ {error}</p>}

      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 rounded-md bg-gray-800 text-gray-200"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={createCategory}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="flex justify-between items-center border-b border-gray-800 py-2"
          >
            <span>{cat.name}</span>
            <button
              onClick={() => deleteCategory(cat.id)}
              className="text-red-500 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
