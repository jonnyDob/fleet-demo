"use client";
import { useEffect } from "react";

export default function Guard({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/login";
    }
  }, []);
  return <>{children}</>;
}
