// src/app/reports/page.tsx
"use client";

import { useGetHrDashboardQuery } from "@/lib/api";

export default function ReportsPage() {
  const { data, isLoading, isError, refetch } = useGetHrDashboardQuery();

  if (isLoading) {
    return (
      <p className="text-sm text-neutral-600">
        Loading HR dashboard for your office…
      </p>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm space-y-2">
        <p>Could not load HR dashboard. Make sure the API is running.</p>
        <button
          onClick={() => refetch()}
          className="btn-secondary btn-sm inline-flex"
        >
          Try again
        </button>
      </div>
    );
  }

  const { office, summary, charts, rewards } = data;

  const maxMoney = charts.moneySavedByMonth.length
    ? Math.max(...charts.moneySavedByMonth.map((m) => m.amount))
    : 0;

  const maxCo2 = charts.co2SavedByMonth.length
    ? Math.max(...charts.co2SavedByMonth.map((m) => m.kg))
    : 0;

  return (
    <div className="space-y-6">
      {/* Top summary */}
      <section className="card">
        <div className="card-section space-y-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            HR view · Demo data
          </p>
          <h1 className="text-2xl font-bold text-neutral-900">
            {office.name}
            {office.city ? ` · ${office.city}` : ""} commute impact
          </h1>

          <p className="text-sm text-neutral-600 max-w-2xl">
            This dashboard shows what Fleet could surface for an HR or People
            leader: how many employees are participating, how much tax they’re
            saving, and how far along they are toward light, culture-building
            rewards like Pizza Friday or early Fridays.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
            <div className="p-3 rounded-xl bg-brand-50">
              <div className="text-xs text-neutral-600">Employees enrolled</div>
              <div className="text-xl font-semibold text-neutral-900">
                {summary.participatingEmployees} / {summary.totalEmployees}
              </div>
              <div className="text-xs text-neutral-500">
                Participation rate {summary.participationRate.toFixed(1)}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-50">
              <div className="text-xs text-neutral-600">
                Employer payroll tax savings
              </div>
              <div className="text-xl font-semibold text-neutral-900">
                ${summary.estimatedEmployerSavingsMonthly.toFixed(0)} / month
              </div>
              <div className="text-xs text-neutral-500">
                ~${summary.estimatedEmployerSavingsYearly.toFixed(0)} / year
              </div>
            </div>

            <div className="p-3 rounded-xl bg-pink-50">
              <div className="text-xs text-neutral-600">
                CO₂ saved by the company
              </div>
              <div className="text-xl font-semibold text-neutral-900">
                {summary.totalCo2SavedMonthlyKg.toFixed(0)} kg / month
              </div>
              <div className="text-xs text-neutral-500">
                ~{summary.totalCo2SavedYearlyKg.toFixed(0)} kg / year
              </div>
            </div>
          </div>

          <p className="text-xs text-neutral-500">
            Tax rate used in this demo: {summary.payrollTaxRate.toFixed(2)}% on
            pre-tax transportation benefits.
          </p>
        </div>
      </section>

      {/* Charts-ish section */}
      <section className="grid md:grid-cols-2 gap-6">
        {/* Money chart */}
        <div className="card">
          <div className="card-section space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-900">
                Monthly payroll tax savings
              </h2>
              <span className="text-xs text-neutral-500">
                Demo data based on your current cohort
              </span>
            </div>

            {charts.moneySavedByMonth.length === 0 ? (
              <p className="text-sm text-neutral-500">
                No data yet – this would fill in as employees start using
                benefits.
              </p>
            ) : (
              <ul className="space-y-2 text-xs">
                {charts.moneySavedByMonth.map((row) => {
                  const pct = maxMoney > 0 ? (row.amount / maxMoney) * 100 : 0;
                  return (
                    <li key={row.month} className="flex items-center gap-2">
                      <span className="w-10 text-neutral-500">{row.month}</span>
                      <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-pink-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-16 text-right font-medium">
                        ${row.amount.toFixed(0)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* CO₂ chart */}
        <div className="card">
          <div className="card-section space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-900">
                Monthly CO₂ savings
              </h2>
              <span className="text-xs text-neutral-500">
                Rough, illustrative figures
              </span>
            </div>

            {charts.co2SavedByMonth.length === 0 ? (
              <p className="text-sm text-neutral-500">
                No data yet – as more employees adopt sustainable modes, this
                climbs.
              </p>
            ) : (
              <ul className="space-y-2 text-xs">
                {charts.co2SavedByMonth.map((row) => {
                  const pct = maxCo2 > 0 ? (row.kg / maxCo2) * 100 : 0;
                  return (
                    <li key={row.month} className="flex items-center gap-2">
                      <span className="w-10 text-neutral-500">{row.month}</span>
                      <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-16 text-right font-medium">
                        {row.kg.toFixed(0)} kg
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Rewards section */}
      <section className="card">
        <div className="card-section space-y-4">
          <h2 className="text-sm font-semibold text-neutral-900">
            Rewards your office is working toward
          </h2>
          {rewards.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No rewards configured yet. In the demo seed, we usually add things
              like &quot;Free Coffee Card&quot; or &quot;Team Pizza
              Friday&quot;.
            </p>
          ) : (
            <ul className="space-y-3 text-sm">
              {rewards.map((r) => (
                <li
                  key={r.id}
                  className="border border-neutral-200 rounded-xl p-3 flex flex-col gap-2 bg-white"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-neutral-900">
                          {r.name}
                        </h3>
                        <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                          {r.type === "team" ? "Team reward" : "Individual"}
                        </span>
                      </div>
                      {r.description && (
                        <p className="text-xs text-neutral-600">
                          {r.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-xs text-neutral-500">
                      <div>
                        {r.currentPoints} / {r.targetPoints} pts
                      </div>
                      <div>{r.progressPercent}% complete</div>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-brand-500"
                      style={{ width: `${r.progressPercent}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs text-neutral-500">
            For the interview, you can talk through how Fleet could let HR
            configure different reward types, budgets, and eligibility rules,
            but the core idea is already visible here: commute choices roll up
            into company-level savings and culture moments.
          </p>
        </div>
      </section>
    </div>
  );
}
