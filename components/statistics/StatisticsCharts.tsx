"use client";

import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import type { StoreStatisticsResponse } from "@/hooks/useStoreStatistics";
import type { ChartDataPoint } from "@/lib/statistics/aggregations";
import {
  aggregateWeeklyCompProjection,
  aggregateItemForecast,
  aggregateOrdersByPromShop,
  aggregateDailyOrders,
} from "@/lib/statistics/aggregations";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ChartSection } from "./ChartSection";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend,
);

const CHART_COLORS = {
  bar1: "rgb(249 115 22)", // orange
  bar2: "rgb(14 165 233)", // sky
  bar3: "rgb(34 197 94)", // green
  bar4: "rgb(99 102 241)", // indigo
  line: "rgb(249 115 22)",
  areaFill: "rgba(249, 115, 22, 0.2)",
};

const chartContainerClass = "relative w-full min-w-0";

function NoDataPlaceholder({ message }: { message: string }) {
  return (
    <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 text-slate-500 text-sm">
      {message}
    </div>
  );
}

type Props = {
  stats: StoreStatisticsResponse | null | undefined;
  chartId?: string;
  t: (key: string) => string;
};

export function StatisticsCharts({ stats, t }: Props) {
  const isMobile = useIsMobile();
  const weeklyData = stats?.weekly_comp_projection ?? [];
  const { trendData, topProducts, byStore } = useMemo(
    () => aggregateWeeklyCompProjection(weeklyData),
    [weeklyData],
  );

  const forecastCharts = useMemo(
    () => aggregateItemForecast(stats?.item_stats_forecast ?? []),
    [stats?.item_stats_forecast],
  );

  const ordersByPromShopCharts = useMemo(
    () => aggregateOrdersByPromShop(stats?.orders_by_prom_shop ?? []),
    [stats?.orders_by_prom_shop],
  );

  const dailyOrdersChart = useMemo(
    () => aggregateDailyOrders(stats?.orders_daily_summary ?? []),
    [stats?.orders_daily_summary],
  );

  const noData = t("stats_no_data");

  const barBaseOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  const lineBaseOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  return (
    <div className="grid w-full min-w-0 grid-cols-1 sm:grid-cols-2 gap-2">
      <ChartSection title={t("stats_daily_orders")}>
        {dailyOrdersChart.length > 0 ? (
          <div
            className={chartContainerClass}
            style={{ height: "100%", minHeight: 200 }}
          >
            <Line
              data={{
                labels: dailyOrdersChart.map((r) => r.name),
                datasets: [
                  {
                    label: t("stats_orders"),
                    data: dailyOrdersChart.map((r) => r.totalOrders),
                    borderColor: CHART_COLORS.line,
                    backgroundColor: CHART_COLORS.areaFill,
                    fill: true,
                    tension: 0.3,
                  },
                ],
              }}
              options={{
                ...lineBaseOptions,
                scales: {
                  x: { grid: { display: false } },
                  y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
                },
                plugins: {
                  ...lineBaseOptions.plugins,
                  tooltip: {
                    callbacks: {
                      title: (items) => items[0]?.label ?? "",
                      label: (ctx) => {
                        const d = dailyOrdersChart[ctx.dataIndex];
                        return `${t("stats_orders")}: ${d?.totalOrders ?? 0}`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        ) : (
          <NoDataPlaceholder message={noData} />
        )}
      </ChartSection>

      <ChartSection title={t("stats_by_supplier")}>
        {ordersByPromShopCharts.bySupplier.length > 0 ? (
          <div
            className={chartContainerClass}
            style={{ height: "100%", minHeight: 200 }}
          >
            <Bar
              data={{
                labels: ordersByPromShopCharts.bySupplier.map((r) => r.name),
                datasets: [
                  {
                    label: t("stats_quantity"),
                    data: ordersByPromShopCharts.bySupplier.map(
                      (r) => r.quantity,
                    ),
                    backgroundColor: CHART_COLORS.bar2,
                  },
                ],
              }}
              options={{
                ...barBaseOptions,
                scales: {
                  x: { grid: { display: false } },
                  y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
                },
                plugins: {
                  ...barBaseOptions.plugins,
                  tooltip: {
                    callbacks: {
                      title: (items) => items[0]?.label ?? "",
                      label: (ctx) => {
                        const p =
                          ordersByPromShopCharts.bySupplier[ctx.dataIndex];
                        return [
                          `${t("stats_quantity")}: ${p?.quantity}`,
                          `${t("stats_orders")}: ${p?.orders ?? 0}`,
                        ];
                      },
                    },
                  },
                },
              }}
            />
          </div>
        ) : (
          <NoDataPlaceholder message={noData} />
        )}
      </ChartSection>

      <ChartSection title={t("stats_weekly_trend")}>
        {trendData.length > 0 ? (
          <div
            className={chartContainerClass}
            style={{ height: "100%", minHeight: 200 }}
          >
            <Line
              data={{
                labels: trendData.map((r) => t(r.weekKey)),
                datasets: [
                  {
                    label: "value",
                    data: trendData.map((r) => r.value),
                    borderColor: CHART_COLORS.line,
                    backgroundColor: CHART_COLORS.areaFill,
                    fill: true,
                    tension: 0.3,
                  },
                ],
              }}
              options={{
                ...lineBaseOptions,
                scales: {
                  x: { grid: { display: false } },
                  y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
                },
              }}
            />
          </div>
        ) : (
          <NoDataPlaceholder message={noData} />
        )}
      </ChartSection>

      <ChartSection title={`${t("stats_forecast_next_week")}`}>
        {forecastCharts.topForecast.length > 0 ? (
          <HorizontalBarChart
            data={forecastCharts.topForecast}
            barColor={CHART_COLORS.bar3}
            maxLabelWidth={isMobile ? 90 : 130}
            t={t}
            tooltipFn={(p) => `${t("stats_forecast_next_week")}: ${p.quantity}`}
          />
        ) : (
          <NoDataPlaceholder message={noData} />
        )}
      </ChartSection>

      <ChartSection title={`${t("stats_forecast_top_products")}`}>
        {forecastCharts.topByTotal.length > 0 ? (
          <HorizontalBarChart
            data={forecastCharts.topByTotal}
            barColor={CHART_COLORS.bar1}
            maxLabelWidth={isMobile ? 90 : 130}
            t={t}
            tooltipFn={(p) => [
              `${t("stats_total")}: ${p.quantity}`,
              `${t("stats_forecast_next_week")}: ${p.forecast ?? 0}`,
            ]}
          />
        ) : (
          <NoDataPlaceholder message={noData} />
        )}
      </ChartSection>

      <ChartSection title={t("stats_top_products")}>
        {topProducts.length > 0 ? (
          <HorizontalBarChart
            data={topProducts}
            barColor={CHART_COLORS.bar1}
            maxLabelWidth={isMobile ? 90 : 130}
            t={t}
            tooltipFn={(p) => [
              `${t("stats_total")}: ${p.quantity}`,
              `${t("stats_w2")}: ${p.WeekMinus2 ?? 0} · ${t("stats_w1")}: ${p.WeekMinus1 ?? 0} · ${t("stats_this_week")}: ${p.CurrentWeekQty ?? 0}`,
            ]}
          />
        ) : (
          <NoDataPlaceholder message={noData} />
        )}
      </ChartSection>

      {byStore.length > 1 && (
        <ChartSection title={t("stats_by_store")}>
          <div
            className={chartContainerClass}
            style={{ height: "100%", minHeight: 200 }}
          >
            <Line
              data={{
                labels: byStore.map((r) => r.name),
                datasets: [
                  {
                    label: t("stats_quantity"),
                    data: byStore.map((r) => r.quantity),
                    borderColor: CHART_COLORS.line,
                    backgroundColor: CHART_COLORS.areaFill,
                    fill: true,
                    tension: 0.3,
                  },
                ],
              }}
              options={{
                ...lineBaseOptions,
                scales: {
                  x: { grid: { display: false } },
                  y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
                },
                plugins: {
                  ...lineBaseOptions.plugins,
                  tooltip: {
                    callbacks: {
                      title: (items) => items[0]?.label ?? "",
                      label: (ctx) => `${t("stats_quantity")}: ${ctx.raw}`,
                    },
                  },
                },
              }}
            />
          </div>
        </ChartSection>
      )}

      {ordersByPromShopCharts.byShop.length > 1 && (
        <ChartSection title={`${t("stats_by_store")}`}>
          {ordersByPromShopCharts.byShop.length > 0 ? (
            <div
              className={chartContainerClass}
              style={{ minHeight: 200, height: "100%" }}
            >
              <Bar
                data={{
                  labels: ordersByPromShopCharts.byShop.map((r) => r.name),
                  datasets: [
                    {
                      label: t("stats_quantity"),
                      data: ordersByPromShopCharts.byShop.map(
                        (r) => r.quantity,
                      ),
                      backgroundColor: CHART_COLORS.bar1,
                    },
                  ],
                }}
                options={{
                  ...barBaseOptions,
                  scales: {
                    x: { grid: { display: false } },
                    y: {
                      beginAtZero: true,
                      grid: { color: "rgba(0,0,0,0.05)" },
                    },
                  },
                  plugins: {
                    ...barBaseOptions.plugins,
                    tooltip: {
                      callbacks: {
                        title: (items) => items[0]?.label ?? "",
                        label: (ctx) => {
                          const p =
                            ordersByPromShopCharts.byShop[ctx.dataIndex];
                          return [
                            `${t("stats_quantity")}: ${p?.quantity}`,
                            `${t("stats_orders")}: ${p?.orders ?? 0}`,
                          ];
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <NoDataPlaceholder message={noData} />
          )}
        </ChartSection>
      )}
    </div>
  );
}

type HorizontalBarChartProps = {
  data: ChartDataPoint[];
  barColor: string;
  maxLabelWidth: number;
  t: (key: string) => string;
  tooltipFn: (p: ChartDataPoint) => string | string[];
};

function HorizontalBarChart({
  data,
  barColor,
  maxLabelWidth,
  t,
  tooltipFn,
}: HorizontalBarChartProps) {
  return (
    <div
      className={chartContainerClass}
      style={{ minHeight: 240, height: "100%" }}
    >
      <Bar
        data={{
          labels: data.map((r) => r.name),
          datasets: [
            {
              label: t("stats_quantity"),
              data: data.map((r) => r.quantity),
              backgroundColor: barColor,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: "y" as const,
          layout: { padding: { left: maxLabelWidth } },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: (items) =>
                  data[items[0]?.dataIndex ?? 0]?.fullName ?? "",
                label: (ctx) => {
                  const p = data[ctx.dataIndex];
                  const result = tooltipFn(p);
                  return Array.isArray(result) ? result : [result];
                },
              },
            },
          },
          scales: {
            x: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
            y: {
              grid: { display: false },
              ticks: {
                maxRotation: 0,
                autoSkip: false,
                maxTicksLimit: 10,
                font: { size: 10 },
              },
            },
          },
        }}
      />
    </div>
  );
}
