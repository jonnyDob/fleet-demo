"use client";

import { useState } from "react";
import { useLoginMutation } from "@/lib/api";

export default function LoginPage() {
  const [tab, setTab] = useState<"admin" | "commuter">("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading, error }] = useLoginMutation();

  const submit = async () => {
    // For the demo we use the same endpoint regardless of tab
    try {
      const res = await login({ username, password }).unwrap();
      localStorage.setItem("token", res.access);
      window.location.href = "/employees";
    } catch {
      /* handled by error rendering below */
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") submit();
  };

  return (
    <main className="auth-shell">
      {/* Left: form panel */}
      <section className="auth-panel">
        <div className="auth-card">
          {/* “Logo” — keep text for now; swap to an <Image> if you want */}
          <div className="mb-6">
            <div className="h-8 w-24 rounded-md bg-[var(--brand-600)]/90" />
          </div>

          <h1 className="text-2xl font-semibold">Login to Fleet</h1>
          <p className="subtitle mt-1">Welcome back, who are you logging in as?</p>

          {/* Segmented control */}
          <div className="segment mt-4">
            <button
              className="segment-btn"
              aria-pressed={tab === "admin"}
              onClick={() => setTab("admin")}
            >
              Admin
            </button>
            <button
              className="segment-btn"
              aria-pressed={tab === "commuter"}
              onClick={() => setTab("commuter")}
            >
              Commuter
            </button>
          </div>

          <div className="hr" />

          {/* (Optional) SSO buttons — purely visual for the demo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button className="btn-chip">
              <span className="mr-2">🟠</span> Login with Google
            </button>
            <button className="btn-chip">
              <span className="mr-2">🟪</span> Login with Microsoft
            </button>
          </div>

          <div className="hr" />

          {/* Credentials */}
          <label className="label">Email / Username*</label>
          <input
            className="input mt-1 mb-4"
            placeholder={tab === "admin" ? "admin username" : "employee email"}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus
          />

          <label className="label">Password*</label>
          <input
            className="input mt-1"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={onKeyDown}
          />

          {/* Remember + forgot */}
          <div className="mt-3 flex items-center justify-between">
            <label className="text-sm text-neutral-700 flex items-center gap-2">
              <input type="checkbox" className="accent-[var(--brand-600)]" /> Remember me
            </label>
            <a className="text-sm link" href="#" onClick={(e) => e.preventDefault()}>
              Forgot your password?
            </a>
          </div>

          {/* Submit */}
          <button
            onClick={submit}
            disabled={isLoading}
            className="btn-primary btn-lg w-full mt-6"
          >
            {isLoading ? "Signing in…" : "Login"}
          </button>

          {error && <p className="text-sm text-red-600 mt-3">Login failed</p>}
        </div>
      </section>

      {/* Right: illustration / gradient panel */}
      <aside className="hero-gradient hidden md:block" />
    </main>
  );
}
