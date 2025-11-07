// src/app/employees/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useEmployeesQuery } from "@/lib/api";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react";
import { loadRewardsPool, saveRewardsPool } from "@/lib/rewardsPoolStorage";

export default function EmployeesPage() {
  const [dept, setDept] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // 1) Unfiltered employees: used to compute full department list + total employees
  const { data: allEmployeesData } = useEmployeesQuery(undefined);
  const allEmployees = Array.isArray(allEmployeesData)
    ? allEmployeesData
    : allEmployeesData?.results ?? [];

  // 2) Filtered employees (by department) for the table
  const { data, isLoading, error } = useEmployeesQuery(
    dept ? { department: dept } : undefined
  );
  const employees = Array.isArray(data) ? data : data?.results ?? [];

  // Local "Team Rewards Pool" membership (front-end only, persisted via localStorage)
  const [poolMembers, setPoolMembers] = useState<Set<number>>(new Set());
  const [initializedPool, setInitializedPool] = useState(false);

  // Seed from localStorage first; if empty and we have employees, mark ALL as enrolled once
  useEffect(() => {
    if (initializedPool) return;

    // Wait until employees are loaded
    if (!allEmployees || allEmployees.length === 0) return;

    // 1) Try localStorage
    const fromStorage = loadRewardsPool();
    if (fromStorage.length > 0) {
      setPoolMembers(new Set(fromStorage));
      setInitializedPool(true);
      return;
    }

    // 2) Otherwise, first-time: seed with ALL employees as "enrolled"
    const allIds = allEmployees
      .map((emp: any) => emp.id)
      .filter((id: any) => typeof id === "number");

    const initial = new Set<number>(allIds);
    setPoolMembers(initial);
    saveRewardsPool(allIds);
    setInitializedPool(true);
  }, [allEmployees, initializedPool]);

  const handleEnroll = (employeeId: number) => {
    setPoolMembers((prev) => {
      const next = new Set(prev);
      next.add(employeeId);
      saveRewardsPool([...next]);
      return next;
    });
    showNotification("Joined Team Rewards Pool", "success");
  };

  const handleUnenroll = (employeeId: number) => {
    setPoolMembers((prev) => {
      const next = new Set(prev);
      next.delete(employeeId);
      saveRewardsPool([...next]);
      return next;
    });
    showNotification("Unenrolled from Team Rewards Pool", "success");
  };

  const showNotification = (message: string, _type: "success" | "error") => {
    // Simple alert for now - replace with a toast later if you like
    alert(message);
  };

  // Dynamic department list based on ALL employees (not filtered),
  // so the dropdown always shows the full set of departments.
  const departments = useMemo(() => {
    const set = new Set<string>();
    allEmployees.forEach((emp: any) => {
      if (emp.department) set.add(emp.department);
    });
    return Array.from(set).sort();
  }, [allEmployees]);

  // Filter employees (for the current table view) by search query
  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return employees;
    return employees.filter((emp: any) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        emp.name?.toLowerCase().includes(searchLower) ||
        emp.email?.toLowerCase().includes(searchLower) ||
        emp.department?.toLowerCase().includes(searchLower)
      );
    });
  }, [employees, searchQuery]);

  // Global active count across ALL employees (local pool only)
  const globalActiveCount = poolMembers.size;
  const totalEmployees = allEmployees.length;

  // Get initials from name
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // Get color based on name for consistent avatar colors
  const getAvatarColor = (name: string) => {
    const colors = [
      "from-purple-400 to-pink-400",
      "from-blue-400 to-cyan-400",
      "from-green-400 to-emerald-400",
      "from-orange-400 to-red-400",
      "from-indigo-400 to-purple-400",
      "from-pink-400 to-rose-400",
    ];
    const hash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-pink-50/20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Employee Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage transit benefit enrollments for your team
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {globalActiveCount} / {totalEmployees || 0} Enrolled
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <select
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="pl-10 pr-10 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer transition-all shadow-sm hover:shadow-md font-medium text-gray-700"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.75rem center",
                    backgroundSize: "1.25rem",
                  }}
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading employees...</p>
            <p className="text-sm text-gray-500 mt-1">
              Please wait while we fetch the data
            </p>
          </div>
        )}

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-1">
              Failed to load employees
            </h3>
            <p className="text-sm text-red-700">
              Please try refreshing the page or contact support
            </p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-purple-50/30 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEmployees.map((employee: any) => {
                    const isActive = poolMembers.has(employee.id);
                    const isProcessing = false; // no async calls now

                    return (
                      <tr
                        key={employee.id}
                        className="hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-pink-50/30 transition-all duration-200"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getAvatarColor(
                                employee.name
                              )} flex items-center justify-center text-white font-bold text-sm shadow-md`}
                            >
                              {getInitials(employee.name)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {employee.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-600">
                          {employee.email}
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-200">
                            {employee.department}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200">
                              <CheckCircle2 className="w-4 h-4" />
                              Enrolled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                              <Circle className="w-4 h-4" />
                              Not Enrolled
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-right">
                          {isActive ? (
                            <button
                              onClick={() => handleUnenroll(employee.id)}
                              disabled={isProcessing}
                              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 border border-red-200 transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                "Unenroll from Pool"
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEnroll(employee.id)}
                              disabled={isProcessing}
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                "Join Team Rewards Pool"
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-100">
              {filteredEmployees.map((employee: any) => {
                const isActive = poolMembers.has(employee.id);
                const isProcessing = false;

                return (
                  <div
                    key={employee.id}
                    className="p-5 hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-pink-50/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarColor(
                          employee.name
                        )} flex items-center justify-center text-white font-bold shadow-md flex-shrink-0`}
                      >
                        {getInitials(employee.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {employee.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {employee.email}
                            </p>
                          </div>
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 flex-shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Enrolled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200 flex-shrink-0">
                              <Circle className="w-3.5 h-3.5" />
                              Not Enrolled
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-200">
                            {employee.department}
                          </span>
                        </div>
                        {isActive ? (
                          <button
                            onClick={() => handleUnenroll(employee.id)}
                            disabled={isProcessing}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 border border-red-200 transition-all disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              "Unenroll from Pool"
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnroll(employee.id)}
                            disabled={isProcessing}
                            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              "Join Team Rewards Pool"
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredEmployees.length === 0 && (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No employees found
                </h3>
                <p className="text-gray-500">
                  {searchQuery
                    ? "Try adjusting your search criteria"
                    : "No employees available"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
