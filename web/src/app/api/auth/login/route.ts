import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_BASE!; // http://127.0.0.1:8000/api/

export async function POST(req: Request) {
  const body = await req.json(); // { username, password }
  const res = await fetch(`${API}token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const data = await res.json(); // { access, refresh }
  const resp = NextResponse.json({ ok: true });

  // 15 min cookie for demo (adjust to your token lifetime)
  const maxAge = 60 * 15;

  // HttpOnly cookie: unreadable by JS (XSS-safe)
  resp.cookies.set("access", data.access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  // (Optional) store refresh too if you plan to refresh on server
  resp.cookies.set("refresh", data.refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return resp;
}
