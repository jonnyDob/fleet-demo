// src/app/reports/page.tsx
"use client";

import { useReportQuery, useGetLobbyQuery } from "@/lib/api";

export default function ReportsPage() {
  const { data: report, isLoading: loadingReport } = useReportQuery();
  const { data: lobby, isLoading: loadingLobby } = useGetLobbyQuery();

  const isLoading = loadingReport || loadingLobby;

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-brand-100">
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              HR console
            </p>
            <h1 className="text-2xl font-bold text-neutral-900">
              Commute engagement overview
            </h1>
            <p className="text-sm text-neutral-600">
              See how many people are enrolled in commute benefits, and how
              often they&apos;re turning commute time into something positive.
            </p>
          </div>
        </header>

        {isLoading && (
          <p className="text-sm text-neutral-600">Loading reports…</p>
        )}

        {!isLoading && (
          <div className="space-y-6">
            {/* Top tiles: existing participation + new office metrics */}
            <section className="grid md:grid-cols-3 gap-4">
              {/* Existing participation metric */}
              <div className="card">
                <div className="card-section space-y-1">
                  <p className="text-xs text-neutral-500">
                    Benefit participation
                  </p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {report?.participationRate ?? 0}%
                  </p>
                  <p className="text-xs text-neutral-600">
                    {report?.activeEnrollments ?? 0} active enrollments right
                    now.
                  </p>
                </div>
              </div>

              {/* Weekly commute runs */}
              <div className="card">
                <div className="card-section space-y-1">
                  <p className="text-xs text-neutral-500">
                    Commute runs this week
                  </p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {lobby?.runsThisWeek ?? 0}
                  </p>
                  <p className="text-xs text-neutral-600">
                    Each completed &quot;quest&quot; is a run where someone
                    turned commute time into something intentional.
                  </p>
                </div>
              </div>

              {/* Today runs */}
              <div className="card">
                <div className="card-section space-y-1">
                  <p className="text-xs text-neutral-500">Runs today</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {lobby?.runsToday ?? 0}
                  </p>
                  <p className="text-xs text-neutral-600">
                    Helpful for seeing how today&apos;s office energy compares
                    to a typical day.
                  </p>
                </div>
              </div>
            </section>

            {/* Team standings */}
            <section className="card">
              <div className="card-section">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-sm font-semibold text-neutral-900">
                      Team standings – this week
                    </h2>
                    <p className="text-xs text-neutral-600">
                      Departments with the most completed commute quests.
                    </p>
                  </div>
                </div>

                {lobby && lobby.teamTotals.length > 0 ? (
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="th w-16">Rank</th>
                        <th className="th">Team</th>
                        <th className="th w-32 text-right">Runs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lobby.teamTotals.map((team, idx) => (
                        <tr
                          key={team.team + idx}
                          className={idx % 2 === 1 ? "tr-alt" : ""}
                        >
                          <td className="td text-sm text-neutral-600">
                            #{idx + 1}
                          </td>
                          <td className="td text-sm font-medium">
                            {team.team}
                          </td>
                          <td className="td text-sm text-right">
                            {team.runsThisWeek}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-neutral-500">
                    No commute runs yet this week. Once people complete quests,
                    teams will show up here.
                  </p>
                )}
              </div>
            </section>

            {/* Little “how HR might use this” blurb */}
            <section className="card">
              <div className="card-section text-sm text-neutral-600 space-y-2">
                <h2 className="text-sm font-semibold text-neutral-900">
                  How HR would use this
                </h2>
                <p>
                  The idea is that HR can see not just who is eligible for
                  commute benefits, but how often employees are actually
                  engaging with them. A quick weekly check on this dashboard
                  tells you which teams are leaning into office days and which
                  ones might need a nudge or a perk adjustment.
                </p>
                <p className="text-xs text-neutral-500">
                  For the prototype these numbers are based on seeded demo data,
                  but the wiring and UX are the same as a real deployment.
                </p>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
