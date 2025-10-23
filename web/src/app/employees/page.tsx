"use client";

import { useMemo, useState } from "react";
import {
  useEmployeesQuery,
  useEnrollMutation,
  useEnrollmentsQuery,
} from "@/lib/api";

export default function EmployeesPage() {
  const [dept, setDept] = useState("");

  // Employees (optionally filtered)
  const { data, isLoading, error } = useEmployeesQuery(
    dept ? { department: dept } : undefined
  );

  // Enroll action
  const [enroll, { isLoading: enrolling }] = useEnrollMutation();

  // Active enrollments from server (source of truth)
  const { data: enrollmentsData } = useEnrollmentsQuery({ status: "active" });

  // Normalize enrollments to a flat array
  const enrollmentsArray = Array.isArray(enrollmentsData)
    ? enrollmentsData
    : enrollmentsData?.results ?? [];

  // Build a Set of employee IDs that are already enrolled (server)
  const enrolledFromServer = useMemo(() => {
    const s = new Set<number>();
    for (const row of enrollmentsArray) {
      const emp = row?.employee;
      const id = typeof emp === "number" ? emp : emp?.id;
      if (id) s.add(id);
    }
    return s;
  }, [enrollmentsArray]);

  // Local “optimistic” set so button disables immediately after success
  const [justEnrolled, setJustEnrolled] = useState<Set<number>>(new Set());

  const handleEnroll = async (employeeId: number) => {
    try {
      // For the demo, option=1 is your "Transit" option
      await enroll({ employee: employeeId, option: 1, status: "active" }).unwrap();
      setJustEnrolled((prev) => new Set(prev).add(employeeId));
      alert("Enrolled!");
    } catch {
      alert("Enroll failed. (Duplicate active enrollment?)");
    }
  };

  // Normalize employees list
  const employees = Array.isArray(data) ? data : data?.results ?? [];

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
          const serverEnrolled = enrolledFromServer.has(e.id);
          const locallyEnrolled = justEnrolled.has(e.id);
          const disabled = serverEnrolled || locallyEnrolled || enrolling;

          return (
            <li key={e.id} style={{ marginBottom: 8 }}>
              {e.name} — {e.email} — {e.department}{" "}
              <button
                onClick={() => handleEnroll(e.id)}
                disabled={disabled}
                title={serverEnrolled ? "Already enrolled" : ""}
                style={{ marginLeft: 12 }}
              >
                {disabled ? "Enrolled" : "Enroll to Transit"}
              </button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
