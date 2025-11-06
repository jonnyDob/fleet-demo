// app/layout.tsx
"use client";

import "./global.css";
import { Provider } from "react-redux";
import { store } from "@/store";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react"; // ⬅️ NEW

type Mode = "admin" | "commuter" | null; // ⬅️ NEW

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showNav = pathname !== "/login";

  // Read chosen mode ("admin" or "commuter") from localStorage
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem("mode");
    if (stored === "admin" || stored === "commuter") {
      return stored;
    }
    return null;
  });
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore logout errors for now
    }
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("mode"); // ⬅️ NEW
      window.location.href = "/login";
    }
  };

  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          {showNav && (
            <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/95">
              <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                  {/* Logo */}
                  <div className="flex items-center gap-8">
                    <div className="h-9 w-28 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 shadow-md flex items-center justify-center">
                      <span className="text-white font-bold text-lg tracking-wide">
                        Fleet
                      </span>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-2">
                      {/* ADMIN FLOW NAV */}
                      {mode === "admin" && (
                        <>
                          <Link
                            href="/employees"
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 transition-all"
                          >
                            Employees
                          </Link>
                          <Link
                            href="/reports"
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 transition-all"
                          >
                            Reports
                          </Link>
                        </>
                      )}

                      {/* COMMUTER FLOW NAV */}
                      {mode === "commuter" && (
                        <>
                          <Link
                            href="/play/today"
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 transition-all"
                          >
                            Today&apos;s Quest
                          </Link>
                          {/* later you can add more, e.g. /play/history */}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={logout}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-200 transition-all"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </nav>
          )}
          {children}
        </Provider>
      </body>
    </html>
  );
}
