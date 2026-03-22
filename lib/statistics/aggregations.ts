import type {
  BiOrder,
  ItemStatsForecast,
  OrdersByPromShop,
  OrdersDailySummary,
  WeeklyCompProjection,
} from "@/hooks/useStoreStatistics";

export type ChartDataPoint = {
  name: string;
  fullName: string;
  quantity: number;
  WeekMinus2?: number;
  WeekMinus1?: number;
  CurrentWeekQty?: number;
  forecast?: number;
  orders?: number;
};

export type WeeklyTotals = {
  weekKey: string;
  WeekMinus2: number;
  WeekMinus1: number;
  CurrentWeekQty: number;
};

export function aggregateWeeklyCompProjection(data: WeeklyCompProjection[]) {
  if (!data?.length) {
    return { totals: [] as WeeklyTotals[], trendData: [], topProducts: [] as ChartDataPoint[], byStore: [] as ChartDataPoint[] };
  }

  const weekMinus2Total = data.reduce((sum, r) => sum + (r.weekMinus2 ?? 0), 0);
  const weekMinus1Total = data.reduce((sum, r) => sum + (r.weekMinus1 ?? 0), 0);
  const currentWeekTotal = data.reduce((sum, r) => sum + (r.currentWeekQty ?? 0), 0);

  const totals: WeeklyTotals[] = [
    { weekKey: "stats_week_minus_2", WeekMinus2: weekMinus2Total, WeekMinus1: 0, CurrentWeekQty: 0 },
    { weekKey: "stats_week_minus_1", WeekMinus2: 0, WeekMinus1: weekMinus1Total, CurrentWeekQty: 0 },
    { weekKey: "stats_this_week", WeekMinus2: 0, WeekMinus1: 0, CurrentWeekQty: currentWeekTotal },
  ];

  const trendData = totals.map((t) => ({ weekKey: t.weekKey, value: t.WeekMinus2 || t.WeekMinus1 || t.CurrentWeekQty }));

  const byProduct = new Map<string, { eidos: string; weekMinus2: number; weekMinus1: number; currentWeekQty: number }>();
  for (const r of data) {
    const key = r.eidos || r.code || "Unknown";
    const existing = byProduct.get(key);
    const row = { eidos: key, weekMinus2: r.weekMinus2 ?? 0, weekMinus1: r.weekMinus1 ?? 0, currentWeekQty: r.currentWeekQty ?? 0 };
    if (existing) {
      existing.weekMinus2 += row.weekMinus2;
      existing.weekMinus1 += row.weekMinus1;
      existing.currentWeekQty += row.currentWeekQty;
    } else {
      byProduct.set(key, { ...row });
    }
  }
  const topProducts: ChartDataPoint[] = Array.from(byProduct.values())
    .map((p) => ({ ...p, total: p.weekMinus2 + p.weekMinus1 + p.currentWeekQty }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map((p) => ({
      name: p.eidos,
      fullName: p.eidos,
      quantity: p.total,
      WeekMinus2: p.weekMinus2,
      WeekMinus1: p.weekMinus1,
      CurrentWeekQty: p.currentWeekQty,
    }));

  const byStoreMap = new Map<string, number>();
  for (const r of data) {
    const shop = r.shop || "Unknown";
    byStoreMap.set(shop, (byStoreMap.get(shop) ?? 0) + (r.weekMinus2 ?? 0) + (r.weekMinus1 ?? 0) + (r.currentWeekQty ?? 0));
  }
  const byStore: ChartDataPoint[] = Array.from(byStoreMap.entries())
    .map(([name, quantity]) => ({ name, fullName: name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 8);

  return { totals, trendData, topProducts, byStore };
}

export function aggregateBiOrders(orders: BiOrder[]) {
  if (!orders?.length) return { byProduct: [] as ChartDataPoint[], byShop: [] as ChartDataPoint[] };
  const byProductMap = new Map<string, number>();
  const byShopMap = new Map<string, number>();
  for (const o of orders) {
    const key = o.eidos || o.code || "Unknown";
    byProductMap.set(key, (byProductMap.get(key) ?? 0) + (o.qty ?? 0));
    const shop = o.shop || "Unknown";
    byShopMap.set(shop, (byShopMap.get(shop) ?? 0) + (o.qty ?? 0));
  }
  const byProduct: ChartDataPoint[] = Array.from(byProductMap.entries())
    .map(([name, quantity]) => ({ name, fullName: name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);
  const byShop: ChartDataPoint[] = Array.from(byShopMap.entries())
    .map(([name, quantity]) => ({ name, fullName: name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 8);
  return { byProduct, byShop };
}

export function aggregateItemForecast(items: ItemStatsForecast[]) {
  if (!items?.length) return { topByTotal: [] as ChartDataPoint[], topForecast: [] as ChartDataPoint[] };
  const topByTotal: ChartDataPoint[] = [...items]
    .sort((a, b) => (b.totalQty ?? 0) - (a.totalQty ?? 0))
    .slice(0, 10)
    .map((i) => ({
      name: i.eidos || i.code || "Unknown",
      fullName: i.eidos || i.code || "Unknown",
      quantity: i.totalQty ?? 0,
      forecast: i.nextWeekForecast ?? 0,
    }));
  const topForecast: ChartDataPoint[] = [...items]
    .sort((a, b) => (b.nextWeekForecast ?? 0) - (a.nextWeekForecast ?? 0))
    .slice(0, 10)
    .map((i) => ({
      name: i.eidos || i.code || "Unknown",
      fullName: i.eidos || i.code || "Unknown",
      quantity: i.nextWeekForecast ?? 0,
    }));
  return { topByTotal, topForecast };
}

export function aggregateOrdersByPromShop(rows: OrdersByPromShop[]) {
  if (!rows?.length) return { byShop: [] as (ChartDataPoint & { orders: number })[], bySupplier: [] as (ChartDataPoint & { orders: number })[] };
  const byShopMap = new Map<string, { quantity: number; orders: number }>();
  const bySupplierMap = new Map<string, { quantity: number; orders: number }>();
  for (const r of rows) {
    const qty = r.totalQuantity ?? 0;
    const ord = r.totalOrders ?? 0;
    for (const [map, key] of [[byShopMap, r.shop || "Unknown"], [bySupplierMap, r.prom || "Unknown"]] as const) {
      const existing = map.get(key);
      if (existing) {
        existing.quantity += qty;
        existing.orders += ord;
      } else {
        map.set(key, { quantity: qty, orders: ord });
      }
    }
  }
  const toChartData = (entries: [string, { quantity: number; orders: number }][]) =>
    entries
      .map(([name, v]) => ({ name, fullName: name, quantity: v.quantity, orders: v.orders }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);
  return { byShop: toChartData(Array.from(byShopMap.entries())), bySupplier: toChartData(Array.from(bySupplierMap.entries())) };
}

export function aggregateDailyOrders(rows: OrdersDailySummary[]) {
  if (!rows?.length) return [] as { date: string; totalOrders: number; name: string }[];
  const byDate = new Map<string, number>();
  for (const r of rows) {
    const date = r.dateOfOrder?.split("T")[0] ?? "";
    if (date) byDate.set(date, (byDate.get(date) ?? 0) + (r.totalOrders ?? 0));
  }
  return Array.from(byDate.entries())
    .map(([date, totalOrders]) => ({ date, totalOrders, name: date.slice(5) }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14);
}
