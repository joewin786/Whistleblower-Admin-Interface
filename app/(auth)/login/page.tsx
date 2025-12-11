"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("🔵 Login attempt...");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      console.log("🔵 Response status:", res.status);

      const data = await res.json();
      console.log("🔵 Response data:", data);

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Validasi response
      if (!data.token || !data.admin) {
        console.error("❌ Invalid response format");
        throw new Error("Invalid response from server");
      }

      // ✅ CRITICAL: Simpan ke localStorage
      console.log("💾 Saving token...");
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_data", JSON.stringify(data.admin));

      // ✅ Verify tersimpan
      const savedToken = localStorage.getItem("admin_token");
      const savedData = localStorage.getItem("admin_data");

      console.log("✅ Verification:");
      console.log(
        "   Token saved:",
        savedToken ? "YES (" + savedToken.substring(0, 20) + "...)" : "NO"
      );
      console.log("   Data saved:", savedData ? "YES" : "NO");

      if (!savedToken || !savedData) {
        console.error("❌ FAILED TO SAVE TO LOCALSTORAGE!");
        alert(
          "Failed to save login data. Please try again or check browser settings."
        );
        return;
      }

      console.log("✅ Login successful! Redirecting...");

      // ✅ GUNAKAN window.location.href (lebih reliable)
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("🔴 Login error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-900/70 backdrop-blur-md p-10 rounded-3xl shadow-xl w-full max-w-md border border-gray-700"
      >
        <h1 className="text-3xl font-bold mb-2 text-center bg-linear-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          Admin Login
        </h1>
        <p className="text-gray-400 text-center mb-8 text-sm">
          Login for Admin & Superadmin
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm mb-1 text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg p-3 text-sm text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg p-3 text-sm text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm text-center font-medium bg-red-500/10 border border-red-500/20 rounded-lg p-2"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white py-3 rounded-lg font-medium shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-gray-400 text-center mb-2">
            Default Credentials:
          </p>
          <p className="text-xs text-blue-300 text-center font-mono">
            superadmin@system.com
          </p>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} WhistleBlower Admin
        </div>
      </motion.div>
    </div>
  );
}
