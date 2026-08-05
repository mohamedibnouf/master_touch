"use client";

import dynamic from "next/dynamic";
import { LoadingState } from "@/presentation/components/admin/AsyncStates";

const DashboardCharts = dynamic(() => import("@/presentation/features/admin/DashboardCharts"), {
  ssr: false,
  loading: () => (
    <div className="grid gap-4 lg:grid-cols-2">
      <LoadingState label="…" />
      <LoadingState label="…" />
    </div>
  ),
});

export function DashboardChartsSlot() {
  return <DashboardCharts />;
}
