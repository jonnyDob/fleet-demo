"use client";
import { Provider } from "react-redux";
import { store } from "@/store";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <nav style={{ padding: "8px 12px", borderBottom: "1px solid #eee" }}>
            <Link href="/employees">Employees</Link>
            <span style={{ margin: "0 8px" }}>|</span>
            <Link href="/reports">Reports</Link>
            <button onClick={logout} style={{ float: "right" }}>Logout</button>
          </nav>
          {children}
        </Provider>
      </body>
    </html>
  );
}
