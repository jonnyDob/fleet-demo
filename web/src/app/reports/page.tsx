"use client";

import { useReportQuery } from "@/lib/api";

export default function ReportsPage() {
  const { data, isLoading, error, refetch } = useReportQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  return (
    <main style={{ maxWidth: 640, margin: "3rem auto", fontFamily: "ui-sans-serif" }}>
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
        </div>
      )}
    </main>
  );
}
