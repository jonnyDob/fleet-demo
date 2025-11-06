// /src/layout.tsx
import "./globals.css";

("use client");

import { Provider } from "react-redux";
import { store } from "@/store";
import Link from "next/link";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider store={store}>
          <header className="border-b border-neutral-100 bg-white">
            <nav className="container-narrow h-14 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link
                  href="/employees"
                  className="font-semibold text-neutral-900"
                >
                  Fleet Demo
                </Link>
                <Link
                  href="/employees"
                  className="text-sm text-neutral-600 hover:text-neutral-900"
                >
                  Employees
                </Link>
                <Link
                  href="/reports"
                  className="text-sm text-neutral-600 hover:text-neutral-900"
                >
                  Reports
                </Link>
              </div>
              <button onClick={logout} className="btn-ghost text-sm">
                Logout
              </button>
            </nav>
          </header>
          <main className="container-narrow py-8">{children}</main>
        </Provider>
      </body>
    </html>
  );
}
