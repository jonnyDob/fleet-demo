"use client";
import { useState } from "react";
import { useEmployeesQuery, useEnrollMutation } from "@/lib/api";
import Guard from "../(protected)/guard";

export default function EmployeesPage() {
  const [dept, setDept] = useState("");
  const { data, isLoading, error, refetch } =
    useEmployeesQuery(dept ? { department: dept } : undefined);
  const [enroll, { isLoading: enrolling }] = useEnrollMutation();

  const handleEnroll = async (employeeId: number) => {
    try {
      // Demo: option=1 (e.g., "transit"), status=active
      await enroll({ employee: employeeId, option: 1, status: "active" }).unwrap();
      alert("Enrolled!");
      // you could also refetch a report page after this; here we just refetch employees list
      refetch();
    } catch (e: any) {
      alert("Enroll failed. (Duplicate active enrollment?)");
    }
  };

  return (
    <Guard>
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
        {data?.results?.map((e: any) => (
          <li key={e.id} style={{ marginBottom: 8 }}>
            {e.name} — {e.email} — {e.department}{" "}
            <button
              onClick={() => handleEnroll(e.id)}
              disabled={enrolling}
              style={{ marginLeft: 12 }}
            >
              Enroll to Transit
            </button>
          </li>
        )) ?? null}
      </ul>
    </main>
 </Guard>
  );
}
