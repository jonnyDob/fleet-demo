"use client";

import { useEffect, useState } from "react";
import { useReportQuery } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  RefreshCw,
} from "lucide-react";

type Point = { day: string; participation: number };

export default function ReportsPage() {
  const { data, isLoading, error, refetch } = useReportQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  // Demo time series: keep last 7 reads of the API (in memory)
  const [series, setSeries] = useState<Point[]>([]);

  useEffect(() => {
    if (data?.participationRate !== undefined) {
      const d = new Date();
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      setSeries((prev) => {
        const next = [
          ...prev.filter((p) => p.day !== label),
          { day: label, participation: data.participationRate },
        ];
        return next.slice(-7);
      });
    }
  }, [data?.participationRate]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900">
            {payload[0].value}%
          </p>
          <p className="text-xs text-gray-500">{payload[0].payload.day}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Program Analytics
              </h1>
              <p className="text-gray-600">
                Real-time insights into your transit benefit program
              </p>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading report data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
            Failed to load report data
          </div>
        )}

        {data && !isLoading && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Participation Rate */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    ↑ Live Data
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {data.participationRate}%
                </div>
                <div className="text-sm text-gray-600">Participation Rate</div>
              </div>

              {/* Active Enrollments */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">
                    Total Enrolled
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {data.activeEnrollments}
                </div>
                <div className="text-sm text-gray-600">Active Enrollments</div>
              </div>
            </div>

            {/* Chart */}
            {series.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    7-Day Participation Trend
                  </h3>
                  <p className="text-sm text-gray-600">
                    Daily participation rate over the last week
                  </p>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={series}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="day"
                        stroke="#9ca3af"
                        style={{ fontSize: "12px" }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        stroke="#9ca3af"
                        style={{ fontSize: "12px" }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="participation"
                        stroke="url(#colorGradient)"
                        strokeWidth={3}
                        dot={{ fill: "#9333ea", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <defs>
                        <linearGradient
                          id="colorGradient"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop offset="0%" stopColor="#9333ea" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
