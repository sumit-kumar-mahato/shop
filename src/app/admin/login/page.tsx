"use client";

import React, { useState } from "react";
import { Lock, User, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirect to dashboard on success
        window.location.href = "/admin";
      } else {
        setError(data.error || "Authentication failed.");
      }
    } catch (err) {
      setError("A connection error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center px-4 relative font-sans">
      {/* Background radial gradient accent */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-luxury-gold/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <span className="text-[10px] font-bold tracking-widest text-luxury-gold uppercase border-b border-luxury-gold/30 pb-1">
            Secure Control Center
          </span>
          <h1 className="font-display font-bold tracking-widest text-2xl text-white uppercase mt-4">
            PRABODH KUMAR MAHATO
          </h1>
          <p className="text-xs text-zinc-400 font-light">
            Please authorize to access the visual CMS boutique manager.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl p-8 rounded-sm shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-950/40 border border-red-900/50 text-red-200 text-xs px-4 py-3 rounded-sm text-center">
                {error}
              </div>
            )}

            {/* Username field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Username Reference
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-zinc-500">
                  <User size={15} />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter administrator name"
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded px-4 py-3 pl-10 focus:outline-none focus:border-luxury-gold transition-colors"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Security Key
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-zinc-500">
                  <Lock size={15} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter security key"
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded px-4 py-3 pl-10 pr-10 focus:outline-none focus:border-luxury-gold transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-luxury-gold hover:bg-luxury-gold/90 disabled:opacity-50 text-zinc-950 font-semibold text-xs tracking-widest py-3.5 rounded transition-all uppercase active:scale-95"
              >
                {loading ? "Authenticating..." : "AUTHORIZE ACCESS"}
              </button>
            </div>
          </form>
        </div>

        {/* Back link */}
        <div className="text-center">
          <a
            href="/"
            className="text-[10px] tracking-widest text-zinc-500 hover:text-luxury-gold uppercase transition-colors"
          >
            ← Cancel & Return to Storefront
          </a>
        </div>
      </div>
    </div>
  );
}
