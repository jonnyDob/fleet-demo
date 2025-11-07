// app/layout.tsx
"use client";

import "./global.css";
import { Provider } from "react-redux";
import { store } from "@/store";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Mode = "admin" | "commuter" | null;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showNav = pathname !== "/login";

  const [mounted, setMounted] = useState(false);

  // Read chosen mode ("admin" or "commuter") from localStorage
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem("mode");
    if (stored === "admin" || stored === "commuter") {
      return stored;
    }
    return null;
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore logout errors for now
    }
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("mode");
      window.location.href = "/login";
    }
  };

  // Helper for active nav styling
  const navLinkClass = (active: boolean) =>
    [
      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
      active
        ? "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 shadow-sm"
        : "text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700",
    ].join(" ");

  // Active states for commuter nav
  const isHome = pathname.startsWith("/play/today");
  const isRewards = pathname.startsWith("/play/quest");
  const isStats = pathname.startsWith("/play/result");

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
                    {mounted && (
                      <div className="flex items-center gap-2">
                        {/* ADMIN FLOW NAV */}
                        {mode === "admin" && (
                          <>
                            <Link
                              href="/employees"
                              className={navLinkClass(
                                pathname.startsWith("/employees")
                              )}
                            >
                              Employees
                            </Link>
                            <Link
                              href="/reports"
                              className={navLinkClass(
                                pathname.startsWith("/reports")
                              )}
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
                              className={navLinkClass(isHome)}
                            >
                              Home
                            </Link>
                            <Link
                              href="/play/quest"
                              className={navLinkClass(isRewards)}
                            >
                              Rewards
                            </Link>
                            <Link
                              href="/play/result"
                              className={navLinkClass(isStats)}
                            >
                              My Statistics
                            </Link>
                          </>
                        )}
                      </div>
                    )}
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
