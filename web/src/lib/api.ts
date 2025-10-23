import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
    reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE!,
    prepareHeaders: (headers) => {
      const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (t) headers.set("authorization", `Bearer ${t}`);
      return headers;
    },
  }),
   tagTypes: ["Employees", "Report", "Enrollments"],
  endpoints: (b) => ({
    login: b.mutation<{ access: string; refresh: string }, { username: string; password: string }>({
      query: (body) => ({ url: "token/", method: "POST", body }),
    }),

    // employees list
    employees: b.query<{ results: any[]; count?: number } | any[], { department?: string } | void>({
      query: (q) => {
        const p = new URLSearchParams();
        if (q?.department) p.set("department", q.department);
        return `employees/?${p.toString()}`;
      },
      providesTags: ["Employees"],
    }),

    // Read active enrollments (used to disable buttons)
    enrollments: b.query<any[] | { results: any[] }, { status?: string } | void>({
      query: (q) => {
        const p = new URLSearchParams();
        if (q?.status) p.set("status", q.status);
        return `enrollments/?${p.toString()}`;
      },
      providesTags: ["Enrollments"],
    }),

    // POST /api/enrollments/
    enroll: b.mutation<any, { employee: number; option: number; status?: string }>({
      query: (body) => ({ url: "enrollments/", method: "POST", body }),
      invalidatesTags: ["Enrollments", "Report", "Employees"],
    }),

    // GET /api/reports/participation
    report: b.query<{ participationRate: number; activeEnrollments: number }, void>({
      query: () => "reports/participation",
      providesTags: ["Report"],
    }),
  }),
});

export const {
  useLoginMutation,
  useEmployeesQuery,
  useEnrollmentsQuery,
  useEnrollMutation,
  useReportQuery,
} = api;
