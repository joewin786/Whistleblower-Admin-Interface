"use client";

import { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, User, MessageCircle, X } from "lucide-react";

export default function ChatAgentAdminPage() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const selectedUserRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // =====================================================
  // Pusher Listener
  // =====================================================
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: "ap1",
    });

    const channel = pusher.subscribe("admin-notifications");

    // 1. USER MINTA ADMIN (handoff)
    channel.bind("chatagent-handoff", (data: any) => {
      console.log("⚡ Handoff:", data);
      setPendingUsers((prev) => {
        // Cek apakah user sudah ada
        const exists = prev.some((u) => u.user_id === data.user_id);
        if (exists) return prev;
        return [...prev, data];
      });
    });

    // 2. PESAN BARU DARI USER
    channel.bind("admin-new-message", (data: any) => {
      console.log("💬 Pesan USER:", data);

      const active = selectedUserRef.current;

      // Tampilkan pesan di chat window jika user sedang aktif
      if (active?.user_id === data.user_id) {
        setMessages((prev) => [
          ...prev,
          {
            from: "user",
            text: data.message,
            timestamp: new Date().toISOString(),
          },
        ]);
      }

      // Update atau tambahkan ke pending list
      setPendingUsers((prev) => {
        const exists = prev.some((u) => u.user_id === data.user_id);
        if (exists) {
          // Update pesan terakhir
          return prev.map((u) =>
            u.user_id === data.user_id ? { ...u, message: data.message } : u
          );
        }
        // Tambahkan user baru
        return [...prev, data];
      });
    });

    // 3. USER DISCONNECTED (timeout)
    channel.bind("user-disconnected", (data: any) => {
      console.log("⏰ User disconnected:", data);

      // Hapus dari pending list
      setPendingUsers((prev) => prev.filter((u) => u.user_id !== data.user_id));

      // Jika sedang chat dengan user ini, clear selection
      if (selectedUserRef.current?.user_id === data.user_id) {
        setSelectedUser(null);
        setMessages([]);
        alert("User telah terputus karena tidak ada aktivitas selama 3 menit.");
      }
    });

    return () => {
      pusher.unsubscribe("admin-notifications");
      pusher.disconnect();
    };
  }, []);

  // =====================================================
  // SEND MESSAGE
  // =====================================================
  const sendReply = async () => {
    if (!selectedUser || !input.trim()) return;

    const messageText = input;
    setInput("");

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/config/chat-agent/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          },
          body: JSON.stringify({
            user_id: selectedUser.user_id,
            message: messageText,
          }),
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          from: "admin",
          text: messageText,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error("Failed to send message:", err);
      setInput(messageText);
    }
  };

  // =====================================================
  // END SESSION
  // =====================================================
  const endSession = async () => {
    if (!selectedUser) return;

    if (!confirm("Anda yakin ingin mengakhiri sesi chat dengan user ini?")) {
      return;
    }

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/config/chat-agent/end-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          },
          body: JSON.stringify({
            user_id: selectedUser.user_id,
          }),
        }
      );

      // Hapus dari pending list
      setPendingUsers((prev) =>
        prev.filter((u) => u.user_id !== selectedUser.user_id)
      );

      // Clear selection
      setSelectedUser(null);
      setMessages([]);

      alert("Sesi chat telah diakhiri.");
    } catch (err) {
      console.error("Failed to end session:", err);
      alert("Gagal mengakhiri sesi.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  };

  return (
    <div className="flex gap-4 p-4 h-[calc(100vh-100px)]">
      {/* LEFT PANEL */}
      <div className="w-1/4 bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-xl overflow-y-auto">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2 text-blue-400">
          <MessageCircle size={20} /> Users Needing Help
        </h2>

        {pendingUsers.length === 0 && (
          <p className="text-gray-500 text-sm text-center mt-10">
            Belum ada user yang meminta bantuan.
          </p>
        )}

        <div className="space-y-3">
          {pendingUsers.map((u, i) => (
            <div
              key={i}
              onClick={() => {
                setSelectedUser(u);
                setMessages([]);
              }}
              className={`p-4 rounded-lg cursor-pointer border transition ${
                selectedUser?.user_id === u.user_id
                  ? "bg-blue-600/20 border-blue-500"
                  : "bg-gray-800/70 border-gray-700 hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <User className="text-blue-400" size={20} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-blue-300 truncate">
                    User #{u.user_id.substring(0, 8)}...
                  </p>
                  <p className="text-gray-400 text-sm line-clamp-1">
                    {u.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-3/4 bg-gray-900 border border-gray-800 rounded-xl flex flex-col shadow-xl">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-800/50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <User className="text-blue-400" size={22} />
                <h2 className="font-semibold text-lg text-blue-300">
                  Chat with User #{selectedUser.user_id.substring(0, 8)}...
                </h2>
              </div>
              <Button
                onClick={endSession}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <X size={16} />
                End Session
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.from === "admin" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-xl max-w-[70%] text-sm shadow-lg ${
                      m.from === "admin"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-200"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-800 bg-gray-800/40 rounded-b-xl">
              <div className="flex items-center gap-3">
                <Textarea
                  placeholder="Ketik pesan... (Enter untuk kirim, Shift+Enter untuk baris baru)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="h-20 resize-none bg-gray-800 text-gray-200"
                />
                <Button
                  onClick={sendReply}
                  disabled={!input.trim()}
                  className="h-20 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send size={18} />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ⏰ Sesi akan otomatis berakhir jika tidak ada aktivitas selama 3
                menit
              </p>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center m-auto text-lg">
            Pilih user untuk memulai percakapan.
          </p>
        )}
      </div>
    </div>
  );
}
