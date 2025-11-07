// src/app/play/today/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useGetEmployeeDashboardQuery,
  useSelectCommuteOptionMutation,
} from "@/lib/api";
import CommuteMap, { CommuteModeKey } from "@/components/CommuteMap";

function optionToModeKey(name: string): CommuteModeKey {
  const n = name.toLowerCase();
  if (n.includes("bike") || n.includes("cycle")) return "bike";
  if (n.includes("carpool") || n.includes("pool")) return "carpool";
  if (n.includes("drive") || n.includes("car")) return "drive";
  return "transit";
}

export default function PlayTodayPage() {
  const router = useRouter();

  // ALL HOOKS MUST BE CALLED FIRST - before any early returns
  const { data, isLoading, isError, refetch } = useGetEmployeeDashboardQuery();
  const [selectOption] = useSelectCommuteOptionMutation();

  const [previewOptionId, setPreviewOptionId] = useState<number | null>(null);
  const [showXpFlash, setShowXpFlash] = useState(false);
  const [selectingOptionId, setSelectingOptionId] = useState<number | null>(
    null
  );

  // Extract data (with fallbacks for when data is loading)
  const employee = data?.employee;
  const office = data?.office;
  const stats = data?.stats;
  const progress = data?.progress;
  const commuteOptions = data?.commuteOptions || [];
  const selectedOption = commuteOptions.find((o) => o.selected) ?? null;

  const previewOption = useMemo(
    () =>
      commuteOptions.find((o) => o.id === previewOptionId) ??
      selectedOption ??
      commuteOptions[0],
    [commuteOptions, previewOptionId, selectedOption]
  );

  const previewMode = previewOption
    ? optionToModeKey(previewOption.name)
    : "transit";

  // NOW we can do early returns after all hooks are called
  if (isLoading) {
    return (
      <p className="text-sm text-neutral-600">Loading your commute options…</p>
    );
  }

  if (isError || !data || !employee || !office || !stats || !progress) {
    return (
      <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">
        Could not load your commute dashboard. Make sure the API is running.
      </div>
    );
  }

  const handleViewStats = () => {
    router.push("/play/result");
  };

  const handleConfirm = async (optionId: number) => {
    setSelectingOptionId(optionId);
    try {
      await selectOption({ optionId }).unwrap();
      // Wait for refetch to complete so UI updates immediately
      await refetch();
      // show small gamified flash
      setShowXpFlash(true);
      setTimeout(() => setShowXpFlash(false), 2200);
    } catch (e) {
      console.error("Failed to select commute option", e);
      alert("Could not update commute choice – check the API logs.");
    } finally {
      setSelectingOptionId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* XP / reward flash – small gamified toast */}
      {showXpFlash && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="rounded-2xl bg-gradient-to-r from-brand-500 to-pink-500 text-white px-4 py-3 shadow-xl flex flex-col gap-1 text-sm">
            <div className="font-semibold">Quest complete! 🎉</div>
            <div>+35 XP for you · +35 XP for your office's reward track.</div>
            <div className="text-xs text-pink-100">
              Team reward progress: {progress.teamReward.percent}% → imagine
              this nudging closer to Pizza Friday.
            </div>
          </div>
        </div>
      )}

      {/* Summary card */}
      <section className="card">
        <div className="card-section space-y-4">
          <p className="text-xs uppercase tracking-wide text-green-700">
            Today&apos;s commute setup
          </p>
          <h2 className="text-2xl font-bold text-neutral-900">
            Hi {employee.name.split(" ")[0]}, pick how you want to get to{" "}
            {office.name}
          </h2>
          <p className="text-sm text-neutral-600">
            Choose a route to see how much pre-tax money and CO₂ you save, plus
            how it nudges your team toward light rewards like pizza or early
            Fridays.
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
            <div className="p-3 rounded-xl bg-pink-50 space-y-1">
              <div className="text-xs text-neutral-600">
                Reward progress (you &amp; your team)
              </div>
              <div className="text-xs text-neutral-500">
                Individual: {progress.individualReward.percent}% · Team:{" "}
                {progress.teamReward.percent}%
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
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

      {/* Commute options + map */}
      <section className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6">
        {/* Options list */}
        <div className="card">
          <div className="card-section space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">
                  Choose your commute mode
                </h3>
                <p className="text-xs text-neutral-600">
                  Tap a card to preview the route on the map, then confirm to
                  lock it in for this demo.
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

            <div className="mt-4 space-y-3">
              {commuteOptions.map((opt) => {
                const isSelected = selectedOption?.id === opt.id;
                const isPreviewed = previewOption?.id === opt.id;
                const isSelectingThis = selectingOptionId === opt.id;

                const modeKey = optionToModeKey(opt.name);
                const colorStripe =
                  modeKey === "bike"
                    ? "from-emerald-400 to-emerald-600"
                    : modeKey === "drive"
                    ? "from-red-400 to-red-600"
                    : modeKey === "carpool"
                    ? "from-orange-400 to-orange-600"
                    : "from-blue-400 to-blue-600";

                return (
                  <div
                    key={opt.id}
                    className={`border rounded-xl p-4 flex flex-col gap-3 cursor-pointer transition-all ${
                      isPreviewed
                        ? "border-brand-500 bg-brand-50/60 shadow-sm"
                        : "border-neutral-200 bg-white hover:border-brand-300 hover:bg-brand-50/30"
                    }`}
                    onClick={() => setPreviewOptionId(opt.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className={`w-1 h-10 rounded-full bg-gradient-to-b ${colorStripe} flex-shrink-0`}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-neutral-900">
                            {opt.name}
                          </h4>
                          {opt.description && (
                            <p className="text-xs text-neutral-600">
                              {opt.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <span className="text-[11px] px-2 py-1 rounded-full bg-brand-100 text-brand-700 font-medium whitespace-nowrap flex-shrink-0">
                          Currently selected
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirm(opt.id);
                      }}
                      disabled={isSelectingThis}
                      className="btn-primary btn-sm mt-1"
                    >
                      {isSelectingThis
                        ? "Updating…"
                        : isSelected
                        ? "Reconfirm this commute"
                        : "Confirm this commute"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Map + explanation */}
        <div className="card">
          <div className="card-section space-y-3">
            <h3 className="text-sm font-semibold text-neutral-900">
              Route preview – {previewOption?.name || "Loading..."}
            </h3>
            <p className="text-xs text-neutral-600">
              This map uses a simple demo route between a hard-coded home and
              your office. In a real deployment, Fleet would plug into real
              origin/destination data and transit APIs to show live routes and
              times.
            </p>
            <CommuteMap mode={previewMode} />
            <p className="text-xs text-neutral-500">
              Green dot = office · Blue dot = approximate home. Different modes
              use different colored paths so it feels playful and easy to talk
              through.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
