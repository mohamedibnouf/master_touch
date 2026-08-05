"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { useTranslations } from "next-intl";
import { Card } from "@/presentation/components/ui/primitives";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
);

export default function DashboardCharts() {
  const t = useTranslations("admin");

  const traffic = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: t("visitors"),
        data: [120, 190, 150, 220, 280, 240, 300],
        borderColor: "#1e5eff",
        backgroundColor: "rgba(30,94,255,0.15)",
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const messagesChart = {
    labels: ["New", "Read", "Replied", "Archived"],
    datasets: [
      {
        label: t("messages"),
        data: [12, 8, 5, 3],
        backgroundColor: ["#0a1b33", "#132a4a", "#1e5eff", "#94a3b8"],
      },
    ],
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <p className="mb-4 font-semibold text-[var(--primary)]">{t("traffic")}</p>
        <div className="relative min-h-[12rem] w-full overflow-x-auto sm:min-h-[14rem]">
          <Line
            data={traffic}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
            }}
          />
        </div>
      </Card>
      <Card>
        <p className="mb-4 font-semibold text-[var(--primary)]">{t("messages")}</p>
        <div className="relative min-h-[12rem] w-full overflow-x-auto sm:min-h-[14rem]">
          <Bar
            data={messagesChart}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
            }}
          />
        </div>
      </Card>
    </div>
  );
}
