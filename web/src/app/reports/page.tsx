"use client";
import { useReportQuery } from "@/lib/api";
import Guard from "../(protected)/guard";

export default function ReportsPage() {
  const { data, isLoading, error } = useReportQuery();

  return (
    <Guard>
    <main style={{ maxWidth: 640, margin: "3rem auto", fontFamily: "ui-sans-serif" }}>
      <h1>Program Report</h1>
      {isLoading && <p>Loading…</p>}
      {error && <p style={{ color: "crimson" }}>Failed to load</p>}
      {data && (
        <div style={{ marginTop: 12 }}>
          <p><strong>Participation Rate:</strong> {data.participationRate}%</p>
          <p><strong>Active Enrollments:</strong> {data.activeEnrollments}</p>
        </div>
      )}
    </main>
    </Guard>
  );
}
