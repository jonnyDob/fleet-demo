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
    // Login to get JWT
    login: b.mutation<{ access: string; refresh: string }, { username: string; password: string }>({
      query: (body) => ({ url: "token/", method: "POST", body }),
    }),
    // List employees with optional department filter
    employees: b.query<{ results: any[]; count?: number }, { department?: string } | void>({
      query: (q) => {
        const p = new URLSearchParams();
        if (q?.department) p.set("department", q.department);
        return `employees/?${p.toString()}`;
      },
    }),
  }),
});

export const { useLoginMutation, useEmployeesQuery } = api;
