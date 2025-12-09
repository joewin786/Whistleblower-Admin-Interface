"use client";

import { useState, useEffect } from "react";

export default function SettingsConfig() {
  const base = process.env.NEXT_PUBLIC_API_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(false);

  async function fetchSettings() {
    const res = await fetch(`${base}/admin/config/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setSettings(data);
  }

  async function updateSettings() {
    setLoading(true);
    await fetch(`${base}/admin/config/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    });
    setLoading(false);
    alert("Settings updated!");
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">System Settings</h2>

      <div className="space-y-4">
        <input
          className="w-full border p-2 rounded-md bg-gray-800 text-gray-200"
          placeholder="System Name"
          value={settings.system_name || ""}
          onChange={(e) =>
            setSettings({ ...settings, system_name: e.target.value })
          }
        />
        <input
          className="w-full border p-2 rounded-md bg-gray-800 text-gray-200"
          placeholder="Support Email"
          value={settings.support_email || ""}
          onChange={(e) =>
            setSettings({ ...settings, support_email: e.target.value })
          }
        />
        <button
          onClick={updateSettings}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
