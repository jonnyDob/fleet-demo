"use client";

import { useState } from "react";
import { useLoginMutation } from "@/lib/api";

export default function LoginPage() {
  const [tab, setTab] = useState<"admin" | "commuter">("commuter");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading, error }] = useLoginMutation();

  const submit = async () => {
    // For the demo we use the same endpoint regardless of tab
    try {
      const res = await login({ username, password }).unwrap();
      localStorage.setItem("token", res.access);

      localStorage.setItem("mode", tab); // "admin" or "commuter"

      // 🔽 NEW: branch based on active tab
      if (tab === "admin") {
        window.location.href = "/employees";
      } else {
        window.location.href = "/play/today";
      }
      // window.location.href = "/employees";
    } catch {
      /* handled by error rendering below */
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div className="min-h-screen grid md:grid-cols-[520px_1fr]">
      {/* Left Panel - Form */}
      <section className="flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <div className="h-10 w-32 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl tracking-wide">
                Fleet
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Login to Fleet
          </h1>
          <p className="text-gray-600 mb-6">
            Welcome back, who are you logging in as?
          </p>

          {/* Tab Selector */}
          <div className="inline-flex rounded-xl bg-gray-100 p-1 mb-6">
            <button
              onClick={() => setTab("admin")}
              className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
                tab === "admin"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => setTab("commuter")}
              className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
                tab === "commuter"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Commuter
            </button>
          </div>

          {/* SSO Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#00A4EF" d="M0 0h11.377v11.372H0z" />
                <path fill="#FFB900" d="M12.623 0H24v11.372H12.623z" />
                <path fill="#7FBA00" d="M0 12.628h11.377V24H0z" />
                <path fill="#F25022" d="M12.623 12.628H24V24H12.623z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                Microsoft
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email / Username*
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={
                  tab === "admin" ? "admin username" : "employee email"
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Password*
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-sm font-medium text-purple-600 hover:text-purple-700"
              >
                Forgot your password?
              </a>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                Login failed
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={submit}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in…" : "Login"}
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{" "}
            <a
              href="#"
              className="font-medium text-purple-600 hover:text-purple-700"
            >
              Contact your admin
            </a>
          </p>
        </div>
      </section>

      {/* Right Panel - Gradient Hero */}
      <aside className="hidden md:block relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
          {/* Animated blobs */}
          <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col justify-center px-12 text-white">
          <div className="max-w-lg">
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Commute benefits made simple
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Save money, reduce stress, and make your commute work for you with
              Fleet's comprehensive benefits platform.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-white/20 border-2 border-white"
                  ></div>
                ))}
              </div>
              <p className="text-sm text-white/90">
                Trusted by <span className="font-semibold">10,000+</span>{" "}
                commuters
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
