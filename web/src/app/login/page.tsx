"use client";
import { useState } from "react";
import { useLoginMutation } from "@/lib/api";

export default function Login() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [login, { isLoading, error }] = useLoginMutation();

  const submit = async () => {
    try {
      const res = await login({ username, password }).unwrap();
      localStorage.setItem("token", res.access);
      window.location.href = "/employees";
    } catch {}
  };

  return (
    <main style={{ maxWidth: 360, margin: "3rem auto", fontFamily: "ui-sans-serif" }}>
      <h1 style={{ marginBottom: 12 }}>Login</h1>
      <input
        placeholder="username"
        onChange={(e) => setU(e.target.value)}
        style={{ display: "block", margin: "8px 0", width: "100%", padding: 8 }}
      />
      <input
        placeholder="password"
        type="password"
        onChange={(e) => setP(e.target.value)}
        style={{ display: "block", margin: "8px 0", width: "100%", padding: 8 }}
      />
      <button onClick={submit} disabled={isLoading} style={{ padding: "8px 12px", marginTop: 8 }}>
        Log in
      </button>
      {error && <p style={{ color: "crimson" }}>Login failed</p>}
    </main>
  );
}
