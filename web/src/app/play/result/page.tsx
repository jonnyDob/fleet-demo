// src/app/play/result/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useGetLobbyQuery } from "@/lib/api";

export default function PlayResultPage() {
  const router = useRouter();
  const { data, isLoading } = useGetLobbyQuery();

  const handleBack = () => {
    router.push("/play/today");
  };

  if (isLoading || !data) {
    return (
      <p className="text-sm text-neutral-600">
        Loading latest office progress…
      </p>
    );
  }

  const { runsToday, runsThisWeek, teamTotals } = data;
  const topTeam = teamTotals[0];

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="card-section space-y-4">
          <p className="text-xs uppercase tracking-wide text-green-700">
            Commute complete
          </p>
          <h2 className="text-2xl font-bold text-neutral-900">
            Nice run – you just nudged your office closer to Free Pizza Friday
            🎉
          </h2>
          <p className="text-sm text-neutral-600">
            For the prototype we grant{" "}
            <span className="font-semibold">+35 XP</span> to you and your team
            every time you finish a quest. HR can tie this to light perks like
            pizza or coffee that make showing up feel fun.
          </p>

          <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 rounded-xl bg-brand-50">
              <div className="text-xs text-neutral-600">Runs today</div>
              <div className="text-xl font-semibold text-neutral-900">
                {runsToday}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-purple-50">
              <div className="text-xs text-neutral-600">Runs this week</div>
              <div className="text-xl font-semibold text-neutral-900">
                {runsThisWeek}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-pink-50">
              <div className="text-xs text-neutral-600">Top team this week</div>
              <div className="text-xl font-semibold text-neutral-900">
                {topTeam ? topTeam.team : "—"}
              </div>
            </div>
          </div>

          <button onClick={handleBack} className="btn-secondary btn-lg mt-4">
            Back to lobby
          </button>
        </div>
      </section>
    </div>
  );
}
