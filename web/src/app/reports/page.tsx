"use client";

import { useEffect, useMemo, useState } from "react";
import { useReportQuery } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

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
        const next = [...prev.filter((p) => p.day !== label), { day: label, participation: data.participationRate }];
        return next.slice(-7);
      });
    }
  }, [data?.participationRate]);

  return (
    <main style={{ maxWidth: 800, margin: "3rem auto", fontFamily: "ui-sans-serif" }}>
      <h1>Program Report</h1>

      <button onClick={() => refetch()} style={{ margin: "12px 0" }}>
        Refresh
      </button>

      {isLoading && <p>Loading…</p>}
      {error && <p style={{ color: "crimson" }}>Failed to load</p>}

      {data && (
        <div style={{ marginTop: 12 }}>
          <p>
            <strong>Participation Rate:</strong> {data.participationRate}%
          </p>
          <p>
            <strong>Active Enrollments:</strong> {data.activeEnrollments}
          </p>

          <div style={{ height: 280, marginTop: 16, border: "1px solid #eee", borderRadius: 8, padding: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="participation" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </main>
  );
}
