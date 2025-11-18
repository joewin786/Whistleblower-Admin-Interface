"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart2,
  Settings,
  Bell,
  AlertCircle,
  Users,
  LogOut,
  BracesIcon,
  Brain,
  MessageSquare,
  Tags,
} from "lucide-react";
import { useState, useEffect } from "react";
import Pusher from "pusher-js";
import toast, { Toaster } from "react-hot-toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [notifCount, setNotifCount] = useState(0);
  const [userName, setUserName] = useState<string | null>(null);

  // 🔔 Listener notifikasi (Pusher)
  useEffect(() => {
    const pusher = new Pusher("239d12869d6500d25b16", {
      cluster: "ap1",
    });

    const channel = pusher.subscribe("notification-channel");

    channel.bind("new-notification", (data: any) => {
      console.log("🔔 Notifikasi diterima:", data);
      setNotifCount((prev) => prev + 1);

      toast.success(`${data.title}: ${data.message}`, {
        duration: 5000,
        style: {
          background: "#1f2937",
          color: "#fff",
          border: "1px solid #3b82f6",
        },
        iconTheme: { primary: "#3b82f6", secondary: "#fff" },
      });
    });

    return () => {
      pusher.unsubscribe("notification-channel");
      pusher.disconnect();
    };
  }, []);

  // 🧩 Ambil nama user (opsional)
  useEffect(() => {
    const storedName = localStorage.getItem("user_name");
    if (storedName) setUserName(storedName);
  }, []);

  // 🚪 Fungsi Logout
  const handleLogout = () => {
    // Hapus semua data auth
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    localStorage.removeItem("user_name");

    toast.success("Berhasil logout!", {
      style: {
        background: "#1f2937",
        color: "#fff",
        border: "1px solid #3b82f6",
      },
    });

    setTimeout(() => {
      router.push("/login");
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-200">
      {/* === SIDEBAR === */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between">
        {/* Header atas */}
        <div>
          <div className="p-6 text-2xl font-bold border-b border-gray-800 text-blue-400 flex items-center justify-between">
            Dashboard
            {/* 🔔 Notifikasi badge */}
            <Link href="/dashboard/notifications" className="relative">
              <Bell
                size={20}
                className="text-gray-400 hover:text-blue-400 transition cursor-pointer"
              />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-xs px-1.5 rounded-full text-white">
                  {notifCount}
                </span>
              )}
            </Link>
          </div>

          {/* Menu utama */}
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
        </div>

        {/* === Bagian bawah sidebar === */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 w-full text-sm rounded-md text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>

          {userName && (
            <p className="text-[11px] text-gray-500 text-center mt-2">
              Logged in as{" "}
              <span className="text-gray-300 font-medium">{userName}</span>
            </p>
          )}

          <p className="text-[10px] text-gray-600 text-center mt-3">
            © 2025 Whistleblower
          </p>
        </div>
      </aside>

      {/* === MAIN CONTENT === */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>

      {/* Toast container */}
      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  );
}

// === Reusable sidebar link ===
function SidebarLink({
  href,
  icon,
  text,
}: {
  href: string;
  icon?: React.ReactNode;
  text: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
        isActive
          ? "bg-blue-600/20 text-blue-400 font-medium"
          : "text-gray-400 hover:text-blue-400 hover:bg-gray-800"
      }`}
    >
      {icon} {text}
    </Link>
  );
}
