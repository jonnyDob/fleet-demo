// src/app/play/result/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useGetEmployeeDashboardQuery } from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

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

  const { employee, office, stats, progress, commuteOptions } = data;
  const selected = commuteOptions.find((o) => o.selected);

  // Hardcoded demo data for 7 days with realistic progressive values
  const demoChartData = [
    {
      date: "11-01",
      moneySaved: 2.5,
      co2Saved: 12.3,
      points: 15,
    },
    {
      date: "11-02",
      moneySaved: 0,
      co2Saved: 0,
      points: 0,
    },
    {
      date: "11-03",
      moneySaved: 3.2,
      co2Saved: 15.8,
      points: 19,
    },
    {
      date: "11-04",
      moneySaved: 2.8,
      co2Saved: 13.9,
      points: 17,
    },
    {
      date: "11-05",
      moneySaved: 4.1,
      co2Saved: 20.2,
      points: 24,
    },
    {
      date: "11-06",
      moneySaved: 9.26,
      co2Saved: 38.5,
      points: 48,
    },
    {
      date: "11-07",
      moneySaved: 1.68,
      co2Saved: 7.0,
      points: 9,
    },
  ];

  // Mock leaderboard data
  const leaderboard = [
    { name: "Sarah Chen", points: 892, department: "Engineering" },
    { name: "Marcus Thompson", points: 847, department: "Product" },
    {
      name: employee.name,
      points: 132,
      department: employee.department || "Your Team",
    },
  ];

  const totalPoints = demoChartData.reduce((sum, day) => sum + day.points, 0);

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

      {/* Rewards progress */}
      <section className="card">
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
      </section>

      {/* Charts Section */}
      <section className="space-y-6">
        {/* Points Earned */}
        <div className="card">
          <div className="card-section space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900">
                Points earned this week
              </h3>
              <div className="text-2xl font-bold text-brand-600">
                {totalPoints} pts
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={demoChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="points"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: "#8b5cf6", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <p className="text-xs text-neutral-500">
              Earn points for every sustainable commute. Points unlock rewards
              and team challenges!
            </p>
          </div>
        </div>

        {/* Money & CO2 Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Money Saved Chart */}
          <div className="card">
            <div className="card-section space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900">
                Money saved (Last 7 days)
              </h3>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={demoChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [
                        `$${value.toFixed(2)}`,
                        "Saved",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="moneySaved"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Total this week</span>
                <span className="font-semibold text-green-600">
                  $
                  {demoChartData
                    .reduce((sum, day) => sum + day.moneySaved, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* CO2 Saved Chart */}
          <div className="card">
            <div className="card-section space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900">
                CO₂ saved (Last 7 days)
              </h3>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={demoChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                      tickFormatter={(value) => `${value} kg`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [
                        `${value.toFixed(1)} kg`,
                        "CO₂ Saved",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="co2Saved"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ fill: "#6366f1", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Total this week</span>
                <span className="font-semibold text-indigo-600">
                  {demoChartData
                    .reduce((sum, day) => sum + day.co2Saved, 0)
                    .toFixed(1)}{" "}
                  kg
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="card">
          <div className="card-section space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900">
              Top commuters this month
            </h3>

            <div className="space-y-3">
              {leaderboard.map((person, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                    person.name === employee.name
                      ? "bg-brand-50 border-2 border-brand-200"
                      : "bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {index === 0 && "🥇"}
                      {index === 1 && "🥈"}
                      {index === 2 && "🥉"}
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900">
                        {person.name}
                        {person.name === employee.name && (
                          <span className="ml-2 text-xs text-brand-600 font-normal">
                            (You)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {person.department}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-neutral-900">
                      {person.points}
                    </div>
                    <div className="text-xs text-neutral-500">points</div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-neutral-500">
              Keep commuting sustainably to climb the leaderboard and unlock
              exclusive rewards!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
