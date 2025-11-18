"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  ChevronDown,
  FolderCog,
  Users,
  Layers,
  FileCog,
  BarChart,
  BarChart2,
  Settings2,
  AlertCircle,
  Brain,
  MessageSquare,
  Tags,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-200">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-800 text-blue-400">
          Admin Panel
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarLink
            href="/dashboard"
            icon={<BarChart2 size={18} />}
            text="Dashboard"
          />
          <SidebarLink
            href="/dashboard/reports"
            icon={<AlertCircle size={18} />}
            text="Reports"
          />
          <SidebarLink
            href="/admin"
            icon={<Settings size={18} />}
            text="Admin"
          />
          <SidebarLink
            href="/dashboard/admins"
            icon={<Users size={18} />}
            text="Admin List"
          />
          <SidebarLink
            href="/dashboard/ai"
            icon={<Brain size={18} />}
            text="AI Analytics"
          />
          <SidebarLink
            href="/dashboard/feedbacks"
            icon={<MessageSquare size={18} />}
            text="Feedback List"
          />
          <SidebarLink
            href="/dashboard/feedback_types"
            icon={<Tags size={18} />}
            text="Feedback Types"
          />
        </nav>

        <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
          © 2025 Whistleblower Admin
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}

function SidebarLink({
  href,
  icon,
  text,
}: {
  href: string;
  icon: React.ReactNode;
  text: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition ${
        isActive ? "text-blue-400" : "text-gray-400 hover:text-blue-400"
      }`}
    >
      {icon} {text}
    </Link>
  );
}
