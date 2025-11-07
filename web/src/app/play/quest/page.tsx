// app/play/quest/page.tsx
import { Suspense } from "react";
import QuestPageContent from "./QuestPageContent";

export default function QuestPage() {
  return (
    <Suspense
      fallback={
        <div className="card">
          <div className="card-section p-4 text-sm text-neutral-600">
            Loading rewards....
          </div>
        </div>
      }
    >
      <QuestPageContent />
    </Suspense>
  );
}
