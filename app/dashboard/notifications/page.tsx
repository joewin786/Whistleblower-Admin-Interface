"use client";
import { useEffect, useState } from "react";
import { Bell, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  created_at: string;
}

export default function AdminNotifyPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/config/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Gagal memuat notifikasi");
      const data = await res.json();
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat notifikasi");
    } finally {
      setLoading(false);
    }
  }

  function getIcon(type: string) {
    switch (type) {
      case "status":
        return <CheckCircle className="text-green-400" size={18} />;
      case "warning":
        return <AlertTriangle className="text-yellow-400" size={18} />;
      case "error":
        return <XCircle className="text-red-400" size={18} />;
      default:
        return <Bell className="text-blue-400" size={18} />;
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto text-gray-100">
      <h2 className="text-2xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
        <Bell size={20} /> Notifikasi
      </h2>

      {loading ? (
        <p className="text-gray-400">Memuat notifikasi...</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-400">Belum ada notifikasi masuk.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex gap-3 hover:border-blue-600 transition"
            >
              <div className="mt-1">{getIcon(notif.type)}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-300">{notif.title}</h3>
                <p className="text-gray-300 text-sm">{notif.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notif.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
