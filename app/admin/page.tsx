"use client";

import { useState } from "react";
import CategoryConfig from "./components/CategoryConfig";
import RoleConfig from "./components/RoleConfig";
import SettingsConfig from "./components/SettingsConfig";
import WorkflowConfig from "./components/WorkflowConfig";


const tabs = [
  { key: "categories", label: "Categories" },
  { key: "roles", label: "Roles" },
  { key: "settings", label: "Settings" },
  { key: "workflows", label: "Workflows" },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-10">
      <h1 className="text-3xl font-bold mb-8 text-blue-400">
        Admin Configuration
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-800 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 px-2 border-b-2 transition-all ${
              activeTab === tab.key
                ? "border-blue-500 text-blue-400"
                : "border-transparent hover:text-blue-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-900/70 border border-gray-800 p-6 rounded-2xl shadow-lg">
        {activeTab === "categories" && <CategoryConfig />}
        {activeTab === "roles" && <RoleConfig />}
        {activeTab === "settings" && <SettingsConfig />}
        {activeTab === "workflows" && <WorkflowConfig />}

      </div>
    </div>
  );
}
