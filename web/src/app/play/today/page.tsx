// src/app/play/today/page.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  useGetEmployeeDashboardQuery,
  useSelectCommuteOptionMutation,
} from "@/lib/api";

export default function PlayTodayPage() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useGetEmployeeDashboardQuery();

  const [selectOption, { isLoading: isSelecting }] =
    useSelectCommuteOptionMutation();

  const handleViewStats = () => {
    router.push("/play/result");
  };

  const handleSelect = async (optionId: number) => {
    try {
      await selectOption({ optionId }).unwrap();
      // refresh dashboard to get updated stats/progress
      refetch();
    } catch (e) {
      console.error("Failed to select commute option", e);
      alert("Could not update commute choice – check the API logs.");
    }
  };

  if (isLoading) {
    return (
      <p className="text-sm text-neutral-600">Loading your commute options…</p>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">
        Could not load your commute dashboard. Make sure the API is running.
      </div>
    );
  }

  const { employee, office, stats, progress, commuteOptions } = data;
  const selectedOption = commuteOptions.find((o) => o.selected);

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <section className="card">
        <div className="card-section space-y-4">
          <p className="text-xs uppercase tracking-wide text-green-700">
            Today&apos;s commute setup
          </p>
          <h2 className="text-2xl font-bold text-neutral-900">
            Hi {employee.name.split(" ")[0]}, let&apos;s tune your commute
          </h2>
          <p className="text-sm text-neutral-600">
            You&apos;re commuting into{" "}
            <span className="font-semibold">
              {office.name}
              {office.city ? ` (${office.city})` : ""}
            </span>
            . Pick a mode below to see how much pre-tax money and CO₂ you can
            save – and how it nudges your team toward rewards.
          </p>

          <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 rounded-xl bg-brand-50">
              <div className="text-xs text-neutral-600">Monthly savings</div>
              <div className="text-xl font-semibold text-neutral-900">
                ${stats.moneySavedMonthly.toFixed(0)}
              </div>
              <div className="text-xs text-neutral-500">
                Projected ${stats.moneySavedYearly.toFixed(0)} / year
              </div>
            </div>
            <div className="p-3 rounded-xl bg-purple-50">
              <div className="text-xs text-neutral-600">CO₂ saved / month</div>
              <div className="text-xl font-semibold text-neutral-900">
                {stats.co2SavedMonthlyKg.toFixed(0)} kg
              </div>
              <div className="text-xs text-neutral-500">
                ~{stats.co2SavedYearlyKg.toFixed(0)} kg / year
              </div>
            </div>
            <div className="p-3 rounded-xl bg-pink-50">
              <div className="text-xs text-neutral-600">
                Team reward progress
              </div>
              <div className="text-xl font-semibold text-neutral-900">
                {progress.teamReward.percent}%
              </div>
              <div className="w-full h-2 mt-2 rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-pink-500 transition-all"
                  style={{ width: `${progress.teamReward.percent}%` }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleViewStats}
            className="btn-secondary btn-lg mt-4"
          >
            View my detailed stats
          </button>
        </div>
      </section>

      {/* Commute options */}
      <section className="card">
        <div className="card-section space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                Choose how you get to the office
              </h3>
              <p className="text-xs text-neutral-600">
                In a real deployment, this could come from payroll and benefits
                data. For the demo, these are preloaded options with realistic
                numbers.
              </p>
            </div>
            {selectedOption && (
              <div className="hidden md:block text-xs text-neutral-500 text-right">
                <div className="font-semibold text-neutral-800">
                  Current choice:
                </div>
                <div>{selectedOption.name}</div>
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {commuteOptions.map((opt) => {
              const isSelected = opt.selected;
              return (
                <div
                  key={opt.id}
                  className={`border rounded-xl p-4 flex flex-col gap-3 ${
                    isSelected
                      ? "border-brand-500 bg-brand-50/60"
                      : "border-neutral-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-900">
                        {opt.name}
                      </h4>
                      {opt.description && (
                        <p className="text-xs text-neutral-600">
                          {opt.description}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <span className="text-xs px-2 py-1 rounded-full bg-brand-100 text-brand-700 font-medium">
                        Selected
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-neutral-600">
                    <div>
                      <div className="text-[11px] uppercase font-medium text-neutral-500">
                        Pre-tax / month
                      </div>
                      <div className="text-sm font-semibold text-neutral-900">
                        ${opt.monthlyCostBeforeTax.toFixed(0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase font-medium text-neutral-500">
                        After-tax
                      </div>
                      <div className="text-sm font-semibold text-neutral-900">
                        ${opt.monthlyCostAfterTax.toFixed(0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase font-medium text-neutral-500">
                        CO₂ / month
                      </div>
                      <div className="text-sm font-semibold text-neutral-900">
                        {opt.co2KgPerMonth.toFixed(0)} kg
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelect(opt.id)}
                    disabled={isSelecting || isSelected}
                    className="btn-primary btn-sm mt-1"
                  >
                    {isSelected
                      ? "Current commute"
                      : isSelecting
                      ? "Updating…"
                      : "Use this commute"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
