"use client";

import { use, useEffect, useState, useRef } from "react";

export default function AdminMessages({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: reportId } = use(params);

  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [me, setMe] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState("");

  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [unreadCount, setUnreadCount] = useState(0);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasMarkedAsRead = useRef(false); // ✅ Track if already marked as read

  const handleTyping = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: "typing", user_id: currentUserId }));
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {}, 1500);
  };

  const decodeToken = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("admin_token");
    let userId = localStorage.getItem("user_id");

    if (!userId && stored) {
      const decoded = decodeToken(stored);
      userId =
        decoded?.user_id || decoded?.id || decoded?.sub || decoded?.userId;
      if (userId) {
        localStorage.setItem("user_id", userId);
      }
      if (decoded?.role) {
        localStorage.setItem("role", decoded.role);
      }
    }

    setToken(stored);
    setCurrentUserId(userId);
  }, []);

  const fetchUnreadCount = async () => {
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reports/${reportId}/messages/unread-count`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unread_count || 0);
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMe(data);
        } else {
          console.error("Failed to fetch /admin/auth/me:", res.status);
        }
      } catch (err) {
        console.error("Error fetching /admin/auth/me:", err);
      }
    };

    fetchMe();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/reports/${reportId}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        setMessages(data);
        setError(null);
        await fetchUnreadCount();
      } catch (err) {
        setError("Gagal memuat pesan");
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [token, reportId]);

  // ✅ CRITICAL FIX: Mark as read via HTTP (untuk database persistence)
  useEffect(() => {
    if (!token) return;
    const markAsRead = async () => {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/reports/${reportId}/messages/mark-all-read`,
          {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("✅ [HTTP] Marked messages as read");
        setUnreadCount(0);
      } catch (err) {
        console.error("❌ [HTTP] Error marking messages as read:", err);
      }
    };
    const timer = setTimeout(() => {
      markAsRead();
    }, 500);
    return () => clearTimeout(timer);
  }, [token, reportId]);

  // ✅ CRITICAL FIX: Send read_all via WebSocket for realtime broadcast
  const sendReadAllEvent = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn("⚠️ WebSocket not ready, cannot send read_all");
      return;
    }

    if (!currentUserId) {
      console.warn("⚠️ currentUserId not available, cannot send read_all");
      return;
    }

    const payload = {
      type: "read_all",
      reader_id: currentUserId,
      report_id: parseInt(reportId),
      read_at: new Date().toISOString(),
    };

    socket.send(JSON.stringify(payload));
    console.log("📤 [WebSocket] Sent read_all event:", payload);

    // ✅ Update local UI optimistically
    setMessages((prev) =>
      prev.map((msg) => {
        // Mark messages from OTHERS as read
        if (msg.sender_id !== currentUserId && !msg.is_read) {
          return { ...msg, is_read: true, read_at: new Date().toISOString() };
        }
        return msg;
      })
    );
  };

  useEffect(() => {
    if (!token) return;
    const connectWebSocket = () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const wsUrl = apiUrl.replace(/^http/, "ws");
        const fullWsUrl = `${wsUrl}/ws/admin/reports/${reportId}?token=${encodeURIComponent(
          token
        )}`;
        const ws = new WebSocket(fullWsUrl);

        ws.onopen = () => {
          console.log("✅ WebSocket connected");
          setIsConnected(true);
          setError(null);
          reconnectAttemptsRef.current = 0;

          // ✅ CRITICAL FIX: Send read_all event IMMEDIATELY after connection
          if (!hasMarkedAsRead.current) {
            hasMarkedAsRead.current = true;
            setTimeout(() => {
              sendReadAllEvent();
            }, 500); // Small delay to ensure connection is stable
          }
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            console.log("📩 WebSocket received:", msg);

            // 🟢 Event: pesan dibaca semua (read_all)
            if (msg.type === "messages_read_all") {
              console.log("📖 Processing messages_read_all:", msg);

              // ✅ CRITICAL: Abaikan event kalau yang baca adalah diri sendiri
              if (msg.reader_id === currentUserId) {
                console.log("⚠️ IGNORED: Reader is me (self-read event)");
                return;
              }

              // ✅ Update semua pesan yang dikirim admin jadi terbaca
              setMessages((prev) =>
                prev.map((m) =>
                  m.sender_id === currentUserId
                    ? { ...m, is_read: true, read_at: msg.read_at }
                    : m
                )
              );

              console.log(
                `✅ Marked messages from me as read (read by: ${msg.reader_id})`
              );
              return;
            }

            // 🟡 Event: user sedang mengetik
            if (msg.type === "typing") {
              console.log("⌨️ User sedang mengetik...", msg.user_id);
              return;
            }

            // 🔵 Event: message delivered
            if (msg.type === "message_delivered") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === msg.message_id ? { ...m, is_delivered: true } : m
                )
              );
              return;
            }

            // 🔵 Event: pesan baru (teks / file)
            if (msg.message || msg.file_url) {
              setMessages((prev) => {
                // hindari duplikat pesan
                if (prev.some((m) => m.id === msg.id)) return prev;
                return [...prev, msg];
              });
              fetchUnreadCount();

              // ✅ Auto-mark as read if message is from others
              if (msg.sender_id !== currentUserId) {
                setTimeout(() => sendReadAllEvent(), 500);
              }
            }
          } catch (err) {
            console.error("❌ Error parsing message:", err);
          }
        };

        ws.onclose = () => {
          console.log("🔌 WebSocket closed");
          setIsConnected(false);
          if (reconnectAttemptsRef.current < 5) {
            const delay = Math.min(
              1000 * Math.pow(2, reconnectAttemptsRef.current),
              10000
            );
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttemptsRef.current += 1;
              connectWebSocket();
            }, delay);
          }
        };

        ws.onerror = (error) => {
          console.error("❌ WebSocket error:", error);
          setError("WebSocket connection error");
        };

        setSocket(ws);
        return ws;
      } catch (err) {
        console.error("❌ Error creating WebSocket:", err);
        return null;
      }
    };
    const ws = connectWebSocket();
    return () => {
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      if (ws) ws.close();
    };
  }, [token, reportId, currentUserId]); // ✅ Added currentUserId dependency

  // ✅ Mark as read when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isConnected) {
        console.log("👁️ Page visible, marking messages as read");
        sendReadAllEvent();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isConnected, socket, currentUserId]);

  // ✅ Mark as read when scrolling to bottom
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    if (isNearBottom && isConnected) {
      sendReadAllEvent();
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const messageContent = input.trim();
    setInput("");

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ message: messageContent }));
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reports/${reportId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: messageContent }),
        }
      );

      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => [...prev, newMsg]);
      }
    } catch {
      setError("Network error");
    }
  };

  // ✏️ Edit message
  const editMessage = async (messageId: string, newText: string) => {
    if (!token || !newText.trim()) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reports/${reportId}/messages/${messageId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: newText }),
        }
      );
      if (res.ok) {
        const updated = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? updated : m))
        );
      }
    } catch (err) {
      console.error("Error editing message:", err);
    }
  };

  // 🗑️ Delete message
  const deleteMessage = async (messageId: string) => {
    if (!token) return;
    if (!confirm("Hapus pesan ini?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reports/${reportId}/messages/${messageId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      }
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  // 📎 Upload file
  const uploadFile = async (file: File) => {
    if (!file || !token) return;
    setUploadingFile(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reports/${reportId}/messages/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data]);
        setSelectedFile(null);
      }
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const isAdminMessage = (msg: any) => {
    return msg.sender_role === "admin";
  };


 const renderReadStatus = (msg: any) => {
   if (!isAdminMessage(msg)) return null;

   if (msg.is_read) {
     return <span className="text-blue-400 text-[11px] ml-1">✔✔</span>;
   }
   if (msg.is_delivered) {
     return <span className="text-gray-400 text-[11px] ml-1">✔✔</span>;
   }
   return <span className="text-gray-400 text-[11px] ml-1">✔</span>;
 };


  // === UI Section ===
  return (
    <div className="flex flex-col h-screen bg-linear-to-br from-gray-900 via-gray-950 to-gray-900">
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/60 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-white">
            Report #{reportId}
          </h1>
          <p className="text-gray-400 text-xs mt-0.5">Chat dengan Reporter</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="bg-red-500/80 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              {unreadCount}
            </span>
          )}
          <span
            className={`text-xs px-3 py-1.5 rounded-full font-medium ${
              isConnected
                ? "bg-green-600/20 text-green-400 border border-green-500/30"
                : "bg-red-600/20 text-red-400 border border-red-500/30"
            }`}
          >
            {isConnected ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      {/* MESSAGES */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6 space-y-3"
        onScroll={handleScroll}
      >
        {messages.map((msg, idx) => {
          const isAdmin = isAdminMessage(msg);
          const showDateDivider =
            idx === 0 ||
            new Date(messages[idx - 1]?.created_at).toDateString() !==
              new Date(msg.created_at).toDateString();
          return (
            <div key={idx}>
              {showDateDivider && (
                <div className="flex justify-center my-3">
                  <div className="bg-gray-800/60 px-3 py-1 rounded-lg text-xs text-gray-400">
                    {new Date(msg.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
              )}

              <div
                className={`flex items-end ${
                  isAdmin ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2.5 max-w-[70%] rounded-2xl shadow-md ${
                    isAdminMessage(msg)
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-none"
                  }`}
                >
                  {isAdmin && (
                    <div className="absolute -top-3 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          const newText = prompt("Edit pesan:", msg.message);
                          if (newText && newText.trim())
                            editMessage(msg.id, newText);
                        }}
                        className="text-xs bg-gray-700 hover:bg-gray-600 rounded px-1"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="text-xs bg-red-700 hover:bg-red-600 rounded px-1"
                      >
                        🗑️
                      </button>
                    </div>
                  )}

                  {msg.file_url && (
                    <div className="mb-2">
                      {msg.file_type?.startsWith("image/") ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}${msg.file_url}`}
                          alt="uploaded"
                          className="max-w-xs rounded-lg"
                        />
                      ) : (
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL}${msg.file_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-300 underline text-sm"
                        >
                          📎 {msg.file_name || "Lihat file"}
                        </a>
                      )}
                    </div>
                  )}

                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </p>
                  <div
                    className={`flex items-end mb-1 ${
                      isAdminMessage(msg)
                        ? "justify-end" // admin → kanan
                        : "justify-start" // user → kiri
                    }`}
                  >
                    <span>
                      {new Date(msg.created_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {renderReadStatus(msg)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}></div>
      </div>

      {/* INPUT */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,application/pdf,.doc,.docx"
        />
        <div className="flex items-center gap-3 bg-gray-800/70 px-4 py-3 rounded-3xl border border-gray-700 focus-within:border-blue-500 transition-all">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile || !token}
            className="text-gray-400 hover:text-blue-400 transition-colors"
          >
            📎
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ketik pesan..."
            className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 focus:outline-none text-sm"
            disabled={!token}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !token}
            className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all transform hover:scale-105 active:scale-95"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
