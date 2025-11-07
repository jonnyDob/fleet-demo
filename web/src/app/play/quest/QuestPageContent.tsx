// app/play/quest/QuestPageContent.tsx
"use client";

import { useRouter } from "next/navigation";
import { useGetEmployeeDashboardQuery } from "@/lib/api";

export default function QuestPageContent() {
  const router = useRouter();
  const { data, isLoading, isError } = useGetEmployeeDashboardQuery();

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-section p-4 text-sm text-neutral-600">
          Loading rewards…
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">
        Could not load rewards. Make sure the API is running and the dashboard
        endpoint is returning data.
      </div>
    );
  }

  const { employee, office, progress } = data;

  // Safely pull percentages if your backend has them; otherwise fall back
  const individualPercent = clampPercent(
    progress?.individualReward?.percent ?? 65
  );
  const teamPercent = clampPercent(progress?.teamReward?.percent ?? 40);

  const individualReached = individualPercent >= 100;
  const teamReached = teamPercent >= 100;

  const firstName = employee?.name?.split(" ")[0] ?? "You";

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="card-section space-y-6">
          {/* Header + nav actions */}
          <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-green-700">
                Rewards
              </p>
              <h1 className="text-2xl font-bold text-neutral-900">
                Rewards your office is working toward
              </h1>
              <p className="text-sm text-neutral-600">
                These are the actual rewards your commutes unlock — one just for{" "}
                {firstName} and two for your whole team at{" "}
                <span className="font-semibold">{office.name}</span>.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => router.push("/play/today")}
                className="btn-secondary btn-sm"
              >
                Back to today&apos;s commute
              </button>
              <button
                onClick={() => router.push("/play/result")}
                className="btn-primary btn-sm"
              >
                View stats
              </button>
            </div>
          </header>

          {/* Reward rows – hard-coded names, game-y visuals */}
          <div className="space-y-4 pt-2">
            {/* 1. Free Coffee Card – Individual */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">☕️</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-neutral-900">
                        Free Coffee Card
                      </h3>
                      <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-neutral-600">
                        Individual
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600">
                      A personal perk for {firstName} when you keep logging
                      commutes.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-medium text-green-700">
                  {individualReached
                    ? "Reached 🎉"
                    : `${individualPercent}% complete`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-500 transition-all"
                  style={{ width: `${individualPercent}%` }}
                />
              </div>
            </div>

            {/* 2. Team Pizza Friday – Team reward (current team reward) */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🍕</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-neutral-900">
                        Team Pizza Friday
                      </h3>
                      <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-neutral-600">
                        Team reward
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600">
                      When your whole office logs enough commutes, you unlock a
                      Pizza Friday together.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-medium text-purple-700">
                  {teamReached ? "Reached 🎉" : `${teamPercent}% complete`}
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-500 transition-all"
                  style={{ width: `${teamPercent}%` }}
                />
              </div>
            </div>

            {/* 3. Leave Early Friday – Next team reward */}
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-neutral-900">
                        Leave Early Friday
                      </h3>
                      <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-neutral-600">
                        Team reward
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600">
                      After Pizza Friday, this is the next team reward: heading
                      home early to start the weekend.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-medium text-neutral-500">
                  Up next
                </span>
              </div>

              {/* Faint bar just to show it’s coming later (not wired to real data yet) */}
              <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-neutral-300 to-neutral-400 opacity-60"
                  style={{ width: "25%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}
