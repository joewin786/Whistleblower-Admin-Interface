"use client";

import {
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Users,
  XCircle,
} from "lucide-react";

export default function OverviewCards({ data }: { data: any }) {
  const items = [
    {
      label: "Total Reports",
      value: data?.total_reports ?? 0,
      icon: <BarChart3 className="text-blue-400" />,
    },
    {
      label: "Under Review Reports",
      value: data?.under_review ?? 0,
      icon: <AlertTriangle className="text-yellow-400" />,
    },
    {
      label: "Resolved Reports",
      value: data?.resolved_reports ?? 0,
      icon: <CheckCircle className="text-green-400" />,
    },
    {
      label: "Dismissed Reports",
      value: data?.dismissed_reports ?? 0,
      icon: <XCircle className="text-red-400" />,
    },
    {
      label: "Total Investigators",
      value: data?.total_investigators ?? 0,
      icon: <Users className="text-purple-400" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-gray-900/70 backdrop-blur-md border border-gray-800 p-6 rounded-2xl shadow-lg flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-gray-400">{item.label}</p>
            <h3 className="text-2xl font-bold mt-1">{item.value}</h3>
          </div>
          <div className="p-3 bg-gray-800/50 rounded-xl">{item.icon}</div>
        </div>
      ))}
    </div>
  );
}
