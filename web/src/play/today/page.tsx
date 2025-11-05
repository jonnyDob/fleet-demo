// src/app/play/today/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useGetLobbyQuery, useStartCommuteSessionMutation } from "@/lib/api";

export default function PlayTodayPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useGetLobbyQuery();
  const [startSession, { isLoading: isStarting }] =
    useStartCommuteSessionMutation();

  const handleStart = async () => {
    try {
      const res = await startSession().unwrap();
      router.push(`/play/quest?sessionId=${res.id}`);
    } catch (e) {
      console.error("Failed to start session", e);
      alert("Could not start quest – check the API logs.");
    }
  };

  if (isLoading) {
    return <p className="text-sm text-neutral-600">Loading lobby…</p>;
  }

  if (isError || !data) {
    return (
      <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">
        Could not load lobby. Make sure the API is running and you are logged
        in.
      </div>
    );
  }

  const { officeName, runsToday, runsThisWeek, teamTotals, coworkers } = data;
  const weeklyGoal = 50;
  const progressPct = Math.min(
    100,
    Math.round((runsThisWeek / weeklyGoal) * 100) || 0
  );

  return (
    <div className="space-y-6">
      {/* Office progress card */}
      <section className="card">
        <div className="card-section flex flex-col md:flex-row gap-6 md:items-center">
          <div className="flex-1 space-y-2">
            <h2 className="text-lg font-semibold text-neutral-900">
              {officeName} lobby
            </h2>
            <p className="text-sm text-neutral-600">
              This week your office is trying to hit{" "}
              <span className="font-semibold">{weeklyGoal}</span> commute runs.
            </p>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-600">
                <span>
                  Office progress: {runsThisWeek} / {weeklyGoal} runs
                </span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-pink-500 transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-neutral-500 mt-2">
              {runsToday} runs completed today • Your demo run still counts
              toward the office goal.
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-2">
            <button
              onClick={handleStart}
              disabled={isStarting}
              className="btn-primary btn-lg shadow-card"
            >
              {isStarting ? "Starting your quest…" : "Start my commute quest"}
            </button>
            <span className="text-xs text-neutral-500 text-center">
              Fully playable from your desk – no real commute needed.
            </span>
          </div>
        </div>
      </section>

      {/* Team standings & coworkers */}
      <section className="grid md:grid-cols-[2fr,3fr] gap-6">
        {/* Team standings */}
        <div className="card">
          <div className="card-section">
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">
              Team standings this week
            </h3>
            {teamTotals.length === 0 ? (
              <p className="text-sm text-neutral-500">
                No runs yet this week. Be the first to start a quest!
              </p>
            ) : (
              <ul className="space-y-2">
                {teamTotals.map((t, idx) => (
                  <li
                    key={t.team + idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500">
                        #{idx + 1}
                      </span>
                      <span className="font-medium">{t.team}</span>
                    </div>
                    <span className="text-neutral-600">
                      {t.runsThisWeek} runs
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Coworkers list */}
        <div className="card">
          <div className="card-section">
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">
              Who&apos;s around this morning
            </h3>
            <ul className="space-y-2 max-h-64 overflow-auto pr-1">
              {coworkers.map((c, idx) => (
                <li
                  key={c.name + idx}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-700">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-neutral-500">{c.team}</div>
                    </div>
                  </div>
                  <span className="text-xs text-neutral-600">{c.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
