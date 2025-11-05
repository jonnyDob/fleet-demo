// src/app/play/layout.tsx
"use client";

import type { ReactNode } from "react";

export default function PlayLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-brand-100">
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Fleet Commute Game
            </p>
            <h1 className="text-2xl font-bold text-neutral-900">
              Office Lobby
            </h1>
            <p className="text-sm text-neutral-600">
              Join your coworkers, run a quick commute quest, and unlock fun
              perks together.
            </p>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
