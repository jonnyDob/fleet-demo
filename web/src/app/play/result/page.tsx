// src/app/play/result/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useGetEmployeeDashboardQuery } from "@/lib/api";

export default function PlayResultPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useGetEmployeeDashboardQuery();

  const handleBack = () => {
    router.push("/play/today");
  };

  if (isLoading) {
    return (
      <p className="text-sm text-neutral-600">
        Loading your latest commute stats…
      </p>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">
        Could not load stats. Try going back to the commute screen and refresh.
      </div>
    );
  }

  const { employee, office, stats, progress, commuteOptions, charts } = data;
  const selected = commuteOptions.find((o) => o.selected);

  return (
    <div className="space-y-6">
      {/* Top summary */}
      <section className="card">
        <div className="card-section space-y-4">
          <p className="text-xs uppercase tracking-wide text-green-700">
            Commute impact
          </p>
          <h2 className="text-2xl font-bold text-neutral-900">
            Here&apos;s what your commute is doing for your wallet and the
            planet
          </h2>

          <p className="text-sm text-neutral-600">
            {selected ? (
              <>
                Right now you&apos;re commuting with{" "}
                <span className="font-semibold">{selected.name}</span> into{" "}
                <span className="font-semibold">
                  {office.name}
                  {office.city ? ` (${office.city})` : ""}
                </span>
                . These numbers are based on rough demo assumptions, but reflect
                the kind of impact Fleet would track using real payroll + trip
                data.
              </>
            ) : (
              <>
                Pick a commute option on the previous screen to see personalized
                numbers. For now we&apos;re showing the default demo employee.
              </>
            )}
          </p>

          <div className="mt-4 grid md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 rounded-xl bg-brand-50">
              <div className="text-xs text-neutral-600">
                Money saved / month
              </div>
              <div className="text-xl font-semibold text-neutral-900">
                ${stats.moneySavedMonthly.toFixed(0)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-brand-50">
              <div className="text-xs text-neutral-600">Money saved / year</div>
              <div className="text-xl font-semibold text-neutral-900">
                ${stats.moneySavedYearly.toFixed(0)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-purple-50">
              <div className="text-xs text-neutral-600">
                CO₂ saved / month (kg)
              </div>
              <div className="text-xl font-semibold text-neutral-900">
                {stats.co2SavedMonthlyKg.toFixed(0)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-purple-50">
              <div className="text-xs text-neutral-600">
                CO₂ saved / year (kg)
              </div>
              <div className="text-xl font-semibold text-neutral-900">
                {stats.co2SavedYearlyKg.toFixed(0)}
              </div>
            </div>
          </div>

          <button onClick={handleBack} className="btn-secondary btn-lg mt-4">
            Back to commute choices
          </button>
        </div>
      </section>

      {/* Progress + lightweight "chart-ish" view */}
      <section className="grid md:grid-cols-2 gap-6">
        {/* Rewards progress */}
        <div className="card">
          <div className="card-section space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900">
              Rewards progress
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <div className="flex items-center justify-between text-xs text-neutral-600 mb-1">
                  <span>{progress.individualReward.label}</span>
                  <span>{progress.individualReward.percent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-pink-500 transition-all"
                    style={{
                      width: `${progress.individualReward.percent}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-neutral-600 mb-1">
                  <span>{progress.teamReward.label}</span>
                  <span>{progress.teamReward.percent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                    style={{
                      width: `${progress.teamReward.percent}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-500">
              For the demo, progress is based on how many &quot;completed
              commutes&quot; your user and office have logged. In production,
              Fleet would plug into real trip + benefit data to drive this.
            </p>
          </div>
        </div>

        {/* Simple daily history list (can be turned into charts later) */}
        <div className="card">
          <div className="card-section space-y-3">
            <h3 className="text-sm font-semibold text-neutral-900">
              Last 7 days of impact
            </h3>
            <p className="text-xs text-neutral-600">
              For now we show a simple daily breakdown that could easily be
              visualized as line charts.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="font-semibold text-neutral-800 mb-1">
                  Money saved
                </div>
                <ul className="space-y-1 max-h-48 overflow-auto pr-1">
                  {charts.dailyMoneySaved.map((d) => (
                    <li
                      key={d.date}
                      className="flex items-center justify-between"
                    >
                      <span className="text-neutral-500">
                        {d.date.slice(5)}
                      </span>
                      <span className="font-medium">
                        ${d.amount.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="font-semibold text-neutral-800 mb-1">
                  CO₂ saved (kg)
                </div>
                <ul className="space-y-1 max-h-48 overflow-auto pr-1">
                  {charts.dailyCo2Saved.map((d) => (
                    <li
                      key={d.date}
                      className="flex items-center justify-between"
                    >
                      <span className="text-neutral-500">
                        {d.date.slice(5)}
                      </span>
                      <span className="font-medium">{d.kg.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-xs text-neutral-500">
              If you want to impress in the next iteration, we can swap these
              lists for actual charts (Recharts, etc.) using the same data
              structure.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
