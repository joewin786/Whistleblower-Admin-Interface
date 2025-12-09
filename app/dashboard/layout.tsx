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
  Brain,
  MessageSquare,
  Tags,
  Headphones,
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

  // Ambil unread notifikasi dari backend
  useEffect(() => {
    async function loadUnread() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/config/notifications/unread-count`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
            },
          }
        );

        const data = await res.json();
        setNotifCount(data.unread || 0);
      } catch (error) {
        console.log("Failed to load unread notifications.");
      }
    }

    loadUnread();
  }, []);

  // ===== REALTIME PUSHER =====
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: "ap1",
    });

    const channel = pusher.subscribe("admin-notifications");

    // Fungsi handle untuk semua event
    const handleNotif = (data: any, title: string) => {
      console.log("🔔 Admin notification received:", data);
      setNotifCount((prev) => prev + 1);

      toast.success(`${data.title || title}: ${data.message}`, {
        duration: 4500,
        style: {
          background: "#1f2937",
          color: "white",
          border: "1px solid #3b82f6",
        },
      });
    };

    // 1. Laporan baru
    channel.bind("new-report", (data: any) => handleNotif(data, "New Report"));

    // 2. User minta bantuan admin
    channel.bind("chatagent-handoff", (data: any) =>
      handleNotif(data, "Customer Service")
    );

    // 3. Pesan chat baru dari user
    channel.bind("new-message", (data: any) =>
      handleNotif(data, "New Message")
    );

    // 4. AI analysis selesai
    channel.bind("ai-analysis-result", (data: any) =>
      handleNotif(data, "AI Analysis")
    );

    // 5. Notifikasi umum
    channel.bind("new-notification", (data: any) =>
      handleNotif(data, "Notification")
    );

    return () => {
      pusher.unsubscribe("admin-notifications");
    };
  }, []);

  // ===== LOGOUT =====
  const handleLogout = () => {
    localStorage.clear();

    toast.success("Berhasil logout!", {
      style: {
        background: "#1f2937",
        color: "white",
      },
    });

    setTimeout(() => {
      router.push("/login");
    }, 800);
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-200">
      {/* === SIDEBAR === */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="p-6 text-2xl font-bold border-b border-gray-800 text-blue-400 flex items-center justify-between">
            Dashboard
            {/* Badge Notifikasi */}
            <Link
              href="/dashboard/notifications"
              className="relative"
              onClick={async () => {
                setNotifCount(0);

                await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/admin/config/notifications/read-all`,
                  {
                    method: "PATCH",
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem(
                        "admin_token"
                      )}`,
                    },
                  }
                );
              }}
            >
              <Bell className="text-gray-400 hover:text-blue-400 cursor-pointer" />

              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-xs px-1.5 rounded-full text-white">
                  {notifCount}
                </span>
              )}
            </Link>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 space-y-2">
            <SidebarLink
              href="/dashboard"
              icon={<BarChart2 size={18}/>}
              text="Dashboard"
            />
            <SidebarLink
              href="/dashboard/reports"
              icon={<AlertCircle size={18}/>}
              text="Reports"
            />
            <SidebarLink href="/admin" icon={<Settings />} text="Admin" />
            <SidebarLink
              href="/dashboard/admins"
              icon={<Users size={18}/>}
              text="Admin List"
            />
            <SidebarLink
              href="/dashboard/ai"
              icon={<Brain size={18}/>}
              text="AI Analytics"
            />
            <SidebarLink
              href="/dashboard/feedbacks"
              icon={<MessageSquare size={18}/>}
              text="Feedback List"
            />
            <SidebarLink
              href="/dashboard/feedback_types"
              icon={<Tags size={18}/>}
              text="Feedback Types"
            />

            {/* Chat Agent Admin */}
            <SidebarLink
              href="/dashboard/chat-agent"
              icon={<Headphones size={18}/>}
              text="Chat Agent"
            />
          </nav>
        </div>

        {/* Bawah */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 w-full text-sm rounded-md text-gray-400 hover:text-red-400 hover:bg-gray-800 transition"
          >
            <LogOut /> Logout
          </button>
        </div>
      </aside>

      {/* === MAIN === */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>

      <Toaster position="bottom-right" reverseOrder={false} />
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
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
        isActive
          ? "bg-blue-600/20 text-blue-400 font-medium"
          : "text-gray-400 hover:text-blue-400 hover:bg-gray-800"
      }`}
    >
      {icon} {text}
    </Link>
  );
}
