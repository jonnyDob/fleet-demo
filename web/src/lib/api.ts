// src/lib/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ------------------ Existing types ------------------

export interface LobbyTeamTotal {
  team: string;
  runsThisWeek: number;
}

export interface LobbyCoworker {
  name: string;
  team: string;
  status: string;
}

export interface LobbyResponse {
  officeName: string;
  runsToday: number;
  runsThisWeek: number;
  teamTotals: LobbyTeamTotal[];
  coworkers: LobbyCoworker[];
}

export interface StartSessionResponse {
  id: number;
  status: "in_progress" | "completed";
}

export interface FinishSessionResponse {
  id: number;
  status: "completed";
  points: number;
}

// ------------------ NEW: Employee dashboard types ------------------

export interface EmployeeDashboardOption {
  id: number;
  name: string;
  description: string;
  active: boolean;
  monthlyCostBeforeTax: number;
  monthlyCostAfterTax: number;
  co2KgPerMonth: number;
  selected: boolean;
}

export interface EmployeeDashboardEmployee {
  id: number;
  name: string;
  department: string | null;
  homePostalCode: string | null;
}

export interface EmployeeDashboardOffice {
  id: number;
  name: string;
  city: string | null;
}

export interface EmployeeDashboardStats {
  moneySavedMonthly: number;
  moneySavedYearly: number;
  co2SavedMonthlyKg: number;
  co2SavedYearlyKg: number;
}

export interface EmployeeDashboardProgressBlock {
  label: string;
  percent: number;
}

export interface EmployeeDashboardProgress {
  individualReward: EmployeeDashboardProgressBlock;
  teamReward: EmployeeDashboardProgressBlock;
}

export interface EmployeeDashboardDailyMoneyPoint {
  date: string; // ISO date
  amount: number;
}

export interface EmployeeDashboardDailyCo2Point {
  date: string; // ISO date
  kg: number;
}

export interface EmployeeDashboardCharts {
  dailyMoneySaved: EmployeeDashboardDailyMoneyPoint[];
  dailyCo2Saved: EmployeeDashboardDailyCo2Point[];
}

export interface EmployeeDashboardResponse {
  employee: EmployeeDashboardEmployee;
  office: EmployeeDashboardOffice;
  commuteOptions: EmployeeDashboardOption[];
  stats: EmployeeDashboardStats;
  progress: EmployeeDashboardProgress;
  charts: EmployeeDashboardCharts;
}

// select endpoint
export interface SelectCommuteOptionResponse {
  employeeId: number;
  selectedOptionId: number;
  sessionId: number;
}

// ------------------ NEW: HR dashboard types ------------------

export interface HrDashboardOffice {
  id: number;
  name: string;
  city: string | null;
  address: string | null;
  monthlyBudget: number;
}

export interface HrDashboardSummary {
  totalEmployees: number;
  participatingEmployees: number;
  participationRate: number;
  payrollTaxRate: number;
  totalPreTaxSpend: number;
  estimatedEmployerSavingsMonthly: number;
  estimatedEmployerSavingsYearly: number;
  totalCo2SavedMonthlyKg: number;
  totalCo2SavedYearlyKg: number;
}

export interface HrDashboardMoneyByMonth {
  month: string;
  amount: number;
}

export interface HrDashboardCo2ByMonth {
  month: string;
  kg: number;
}

export interface HrDashboardCharts {
  moneySavedByMonth: HrDashboardMoneyByMonth[];
  co2SavedByMonth: HrDashboardCo2ByMonth[];
}

export interface HrDashboardReward {
  id: number;
  name: string;
  type: "individual" | "team";
  description: string;
  targetPoints: number;
  currentPoints: number;
  progressPercent: number;
}

export interface HrDashboardResponse {
  office: HrDashboardOffice;
  summary: HrDashboardSummary;
  charts: HrDashboardCharts;
  rewards: HrDashboardReward[];
}

// ------------------ API definition ------------------

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    // e.g. http://127.0.0.1:8000/api/
    baseUrl: process.env.NEXT_PUBLIC_API_BASE!,
    prepareHeaders: (headers) => {
      const t =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (t) headers.set("authorization", `Bearer ${t}`);
      return headers;
    },
  }),
  tagTypes: [
    "Employees",
    "Enrollments",
    "Report",
    "EmployeeDashboard",
    "HrDashboard",
  ],
  endpoints: (b) => ({
    // ---------- auth ----------
    login: b.mutation<
      { access: string; refresh: string },
      { username: string; password: string }
    >({
      query: (body) => ({ url: "token/", method: "POST", body }),
    }),

    // ---------- employees / enrollments ----------
    employees: b.query<
      { results?: any[]; count?: number } | any[],
      { department?: string } | void
    >({
      query: (q) => {
        const p = new URLSearchParams();
        if (q?.department) p.set("department", q.department);
        return `employees/?${p.toString()}`;
      },
      providesTags: ["Employees"],
    }),

    enrollments: b.query<any[] | { results?: any[] }, { status?: string } | void>(
      {
        query: (q) => {
          const p = new URLSearchParams();
          if (q?.status) p.set("status", q.status);
          return `enrollments/?${p.toString()}`;
        },
        providesTags: ["Enrollments"],
      }
    ),

    enroll: b.mutation<any, { employee: number; option: number; status?: string }>(
      {
        query: (body) => ({ url: "enrollments/", method: "POST", body }),
        invalidatesTags: ["Enrollments", "Report", "Employees"],
      }
    ),

    // NEW: POST /enrollments/{id}/cancel/
    cancelEnroll: b.mutation<any, { id: number }>({
      query: ({ id }) => ({ url: `enrollments/${id}/cancel/`, method: "POST" }),
      invalidatesTags: ["Enrollments", "Report", "Employees"],
    }),

    report: b.query<{ participationRate: number; activeEnrollments: number }, void>(
      {
        query: () => "reports/participation",
        providesTags: ["Report"],
      }
    ),

    // ---------- existing commute game endpoints ----------
    getLobby: b.query<LobbyResponse, void>({
      query: () => "commute/lobby/",
    }),

    startCommuteSession: b.mutation<StartSessionResponse, void>({
      query: () => ({
        url: "commute/sessions/start/",
        method: "POST",
      }),
    }),

    finishCommuteSession: b.mutation<FinishSessionResponse, number>({
      query: (sessionId) => ({
        url: `commute/sessions/${sessionId}/finish/`,
        method: "POST",
      }),
    }),

    options: b.query<any[] | { results?: any[] }, void>({
      query: () => "options/",
    }),

    // ---------- NEW: Employee dashboard ----------
    getEmployeeDashboard: b.query<EmployeeDashboardResponse, void>({
      query: () => "employee/dashboard/",
      providesTags: ["EmployeeDashboard"],
    }),

    selectCommuteOption: b.mutation<
      SelectCommuteOptionResponse,
      { optionId: number }
    >({
      query: ({ optionId }) => ({
        url: "employee/commute/select/",
        method: "POST",
        body: { optionId },
      }),
      invalidatesTags: ["EmployeeDashboard", "Report"],
    }),

    // ---------- NEW: HR dashboard ----------
    getHrDashboard: b.query<HrDashboardResponse, void>({
      query: () => "hr/dashboard/",
      providesTags: ["HrDashboard"],
    }),
  }),
});

export const {
  useLoginMutation,
  useEmployeesQuery,
  useEnrollmentsQuery,
  useEnrollMutation,
  useCancelEnrollMutation,
  useReportQuery,
  useGetLobbyQuery,
  useStartCommuteSessionMutation,
  useFinishCommuteSessionMutation,
  useOptionsQuery,
  // NEW hooks:
  useGetEmployeeDashboardQuery,
  useSelectCommuteOptionMutation,
  useGetHrDashboardQuery,
} = api;
