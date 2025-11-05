// src/app/play/quest/page.tsx
"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useFinishCommuteSessionMutation } from "@/lib/api";

const MISSIONS = [
  {
    key: "calm_start",
    title: "Calm start",
    description: "Take three slow breaths and pick one tiny win for today.",
  },
  {
    key: "plan",
    title: "Plan your win",
    description:
      "Decide one thing you’ll do on this commute: rest, learn, or plan.",
  },
  {
    key: "connect",
    title: "Connect",
    description: "Think of one coworker you’ll check in with when you arrive.",
  },
];

export default function QuestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdParam = searchParams.get("sessionId");
  const sessionId = sessionIdParam ? parseInt(sessionIdParam, 10) : null;

  const [step, setStep] = useState(0);
  const [finishSession, { isLoading }] = useFinishCommuteSessionMutation();

  if (!sessionId) {
    return (
      <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">
        Missing session. Go back to the lobby and start again.
      </div>
    );
  }

  const mission = MISSIONS[step];
  const total = MISSIONS.length;
  const pct = Math.round(((step + 1) / total) * 100);

  const handleNext = async () => {
    if (step < total - 1) {
      setStep((prev) => prev + 1);
      return;
    }

    // Last step: finish session
    try {
      await finishSession(sessionId).unwrap();
    } catch (e) {
      console.error("Failed to finish session", e);
    }
    router.push("/play/result");
  };

  return (
    <div className="card">
      <div className="card-section space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Commute quest
            </p>
            <h2 className="text-lg font-semibold text-neutral-900">
              Step {step + 1} of {total}
            </h2>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-neutral-500">{pct}% complete</span>
            <div className="w-32 h-2 rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-pink-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-neutral-900">
            {mission.title}
          </h3>
          <p className="text-sm text-neutral-600">{mission.description}</p>
        </div>

        <button
          onClick={handleNext}
          disabled={isLoading}
          className="btn-primary btn-lg w-full mt-2"
        >
          {step < total - 1
            ? "Complete mission"
            : isLoading
            ? "Finishing commute…"
            : "Finish commute"}
        </button>

        <p className="text-xs text-neutral-500 text-center">
          In a real deployment these missions could be tuned by office, mode, or
          even mood. For now, it&apos;s a quick demo quest.
        </p>
      </div>
    </div>
  );
}
