import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE!,
    prepareHeaders: (headers) => {
      const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (t) headers.set("authorization", `Bearer ${t}`);
      return headers;
    },
  }),
  endpoints: (b) => ({
    // login
    login: b.mutation<{ access: string; refresh: string }, { username: string; password: string }>({
      query: (body) => ({ url: "token/", method: "POST", body }),
    }),

    // employees list
    employees: b.query<{ results: any[]; count?: number }, { department?: string } | void>({
      query: (q) => {
        const p = new URLSearchParams();
        if (q?.department) p.set("department", q.department);
        return `employees/?${p.toString()}`;
      },
    }),

    // POST /api/enrollments/
    enroll: b.mutation<any, { employee: number; option: number; status?: string }>({
      query: (body) => ({ url: "enrollments/", method: "POST", body }),
    }),

    // GET /api/reports/participation
    report: b.query<{ participationRate: number; activeEnrollments: number }, void>({
      query: () => "reports/participation",
    }),
  }),
});

export const {
  useLoginMutation,
  useEmployeesQuery,
  useEnrollMutation,
  useReportQuery,
} = api;
