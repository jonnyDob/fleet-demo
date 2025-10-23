"use client";

import { useMemo, useState } from "react";
import {
  useEmployeesQuery,
  useEnrollmentsQuery,
  useEnrollMutation,
  useCancelEnrollMutation,
} from "@/lib/api";

export default function EmployeesPage() {
  const [dept, setDept] = useState("");

  // Employees (optional filter)
  const { data, isLoading, error } = useEmployeesQuery(
    dept ? { department: dept } : undefined
  );
  const employees = Array.isArray(data) ? data : data?.results ?? [];

  // Active enrollments (server truth)
  const { data: enrollmentsData } = useEnrollmentsQuery({ status: "active" });
  const enrollmentsArray = Array.isArray(enrollmentsData)
    ? enrollmentsData
    : enrollmentsData?.results ?? [];

  // Map: employeeId -> enrollmentId (if active)
  const activeMap = useMemo(() => {
    const m = new Map<number, number>();
    for (const row of enrollmentsArray) {
      const emp = row?.employee;
      const empId = typeof emp === "number" ? emp : emp?.id;
      if (empId && row?.id) m.set(empId, row.id);
    }
    return m;
  }, [enrollmentsArray]);

  // Mutations
  const [enroll, { isLoading: enrolling }] = useEnrollMutation();
  const [cancelEnroll, { isLoading: canceling }] = useCancelEnrollMutation();

  // Local optimistic states
  const [justEnrolled, setJustEnrolled] = useState<Set<number>>(new Set());
  const [justCanceled, setJustCanceled] = useState<Set<number>>(new Set());

  const handleEnroll = async (employeeId: number) => {
    try {
      await enroll({ employee: employeeId, option: 1, status: "active" }).unwrap();
      setJustEnrolled((prev) => new Set(prev).add(employeeId));
      // if it had been canceled locally, clear that state
      setJustCanceled((prev) => {
        const next = new Set(prev);
        next.delete(employeeId);
        return next;
      });
      alert("Enrolled!");
    } catch {
      alert("Enroll failed. (Duplicate active enrollment?)");
    }
  };

  const handleUnenroll = async (employeeId: number) => {
    const enrollmentId = activeMap.get(employeeId);
    if (!enrollmentId) return; // nothing to cancel
    try {
      await cancelEnroll({ id: enrollmentId }).unwrap();
      setJustCanceled((prev) => new Set(prev).add(employeeId));
      // if it had been newly enrolled in this session, clear that
      setJustEnrolled((prev) => {
        const next = new Set(prev);
        next.delete(employeeId);
        return next;
      });
      alert("Enrollment canceled");
    } catch {
      alert("Could not cancel enrollment");
    }
  };

  return (
    <main style={{ maxWidth: 720, margin: "3rem auto", fontFamily: "ui-sans-serif" }}>
      <h1>Employees</h1>

      <label>Department: </label>
      <select value={dept} onChange={(e) => setDept(e.target.value)} style={{ marginLeft: 8 }}>
        <option value="">All</option>
        <option>Engineering</option>
        <option>Ops</option>
      </select>

      {isLoading && <p>Loading…</p>}
      {error && <p style={{ color: "crimson" }}>Failed to load</p>}

      <ul style={{ marginTop: 16 }}>
        {employees.map((e: any) => {
          const serverActive = activeMap.has(e.id);
          const locallyEnrolled = justEnrolled.has(e.id);
          const locallyCanceled = justCanceled.has(e.id);

          // Determine current state
          const isActive = (serverActive && !locallyCanceled) || locallyEnrolled;

          return (
            <li key={e.id} style={{ marginBottom: 8 }}>
              {e.name} — {e.email} — {e.department}{" "}
              {isActive ? (
                <button
                  onClick={() => handleUnenroll(e.id)}
                  disabled={canceling}
                  style={{ marginLeft: 12 }}
                  title="Click to cancel enrollment"
                >
                  Unenroll
                </button>
              ) : (
                <button
                  onClick={() => handleEnroll(e.id)}
                  disabled={enrolling}
                  style={{ marginLeft: 12 }}
                >
                  Enroll to Transit
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
