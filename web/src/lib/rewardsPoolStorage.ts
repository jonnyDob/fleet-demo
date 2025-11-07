// src/lib/rewardsPoolStorage.ts
const STORAGE_KEY = "fleet_demo_rewards_pool_members";

export function loadRewardsPool(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id) => typeof id === "number");
  } catch {
    return [];
  }
}

export function saveRewardsPool(ids: number[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore write failures for demo
  }
}
