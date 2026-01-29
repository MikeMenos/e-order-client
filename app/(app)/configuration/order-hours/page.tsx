"use client";

import { usePrefSchedule } from "../../../../hooks/useSchedule";

export default function OrderHoursPage() {
  const scheduleQuery = usePrefSchedule();

  const schedule = scheduleQuery.data ?? null;

  return (
    <main className="min-h-screen bg-slate-50 p-6 space-y-4 text-slate-900">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Order hours</h1>
        <p className="text-sm text-slate-600">
          Read-only view of preferred schedule for orders (from
          MyStore/PrefSchedule_Get).
        </p>
      </header>

      {scheduleQuery.isLoading && (
        <p className="text-sm text-slate-500">Loading schedule…</p>
      )}
      {scheduleQuery.error && (
        <p className="text-sm text-red-400">Failed to load schedule.</p>
      )}

      {schedule && (
        <pre className="max-h-[400px] overflow-auto rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-900 shadow-sm">
          {JSON.stringify(schedule, null, 2)}
        </pre>
      )}
    </main>
  );
}
