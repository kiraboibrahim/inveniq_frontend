"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/features/dashboard/kpi-card";
import { AlertRibbon } from "@/components/features/dashboard/alert-ribbon";
import { SalesTrendChart } from "@/components/features/dashboard/sales-trend-chart";
import { TopProducts } from "@/components/features/dashboard/top-products";
import { useQuery } from "@tanstack/react-query";
import { alertService, analyticsService, inventoryService } from "@/services/api";
import { useShopStore } from "@/store/branch-store";
import { Package, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";
import type { Product, Alert, SalesDataPoint, TopProduct } from "@/types";

export default function Dashboard() {
  const { user } = useAuthStore();
  const { activeBranch } = useShopStore();
  const [greeting, setGreeting] = useState("Good morning");
  const [mounted, setMounted] = useState(false);

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ["alerts", activeBranch],
    queryFn: () => alertService.getAlerts(activeBranch as string),
  });

  const { data: salesTrend = [] } = useQuery<SalesDataPoint[]>({
    queryKey: ["salesTrend"],
    queryFn: analyticsService.getSalesTrend,
  });

  const { data: topProducts = [] } = useQuery<TopProduct[]>({
    queryKey: ["topProducts"],
    queryFn: analyticsService.getTopProducts,
  });

  const { data: summary } = useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: analyticsService.getDashboardSummary,
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products", activeBranch],
    queryFn: () => inventoryService.getProducts(activeBranch as string),
  });

  useEffect(() => {
    const mountTimer = setTimeout(() => setMounted(true), 0);

    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreeting("Good morning");
      } else if (hour < 17) {
        setGreeting("Good afternoon");
      } else {
        setGreeting("Good evening");
      }
    };

    updateGreeting();
    const timer = setInterval(updateGreeting, 60_000);
    return () => {
      clearInterval(timer);
      clearTimeout(mountTimer);
    };
  }, []);

  const today = new Intl.DateTimeFormat('en-UG', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  const userName = user?.name || user?.display_name || "User";
  const displayGreeting = mounted ? `${greeting}, ${userName}` : `Good morning, User`;

  const totalProducts = summary?.totalProducts ?? products.length;
  const stockValue = summary?.stockValue ?? products.reduce((acc, p) => acc + (p.price * p.stockQty), 0);
  const lowStockItems = summary?.lowStockItems ?? products.filter(p => p.status === 'Low stock' || p.status === 'Out of stock').length;
  const todaySales = summary?.todaySales ?? (salesTrend.length > 0 ? salesTrend[salesTrend.length - 1].revenue : 0);
  const salesTrendDelta = summary?.salesTrend ?? 0;

  const canSeeFinancials = user?.role === "admin" || user?.role === "manager";

  return (
    <>
      <PageHeader
        title={displayGreeting}
        breadcrumbs={[{ label: today }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        <KpiCard
          label="Total Products"
          value={totalProducts}
          delta={0}
          icon={<Package />}
          sparklineData={[0, 0, 0, 0, 0, 0, totalProducts]}
        />
        {canSeeFinancials && (
          <KpiCard
            label="Stock Value"
            value={stockValue}
            delta={0}
            isCurrency={true}
            icon={<DollarSign />}
            sparklineData={[0, 0, 0, 0, 0, 0, stockValue / 1000000]}
          />
        )}
        <KpiCard
          label="Items Low/Out"
          value={lowStockItems}
          delta={0}
          icon={<AlertTriangle />}
          sparklineData={[0, 0, 0, 0, 0, 0, lowStockItems]}
        />
        {canSeeFinancials && (
          <KpiCard
            label="Today's Sales"
            value={todaySales}
            delta={salesTrendDelta}
            isCurrency={true}
            icon={<TrendingUp />}
            sparklineData={[0, 0, 0, 0, 0, 0, todaySales / 10000]}
          />
        )}
      </div>

      <div className="mb-6">
        <AlertRibbon alerts={alerts} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {canSeeFinancials ? (
          <>
            <div className="xl:col-span-8">
              <SalesTrendChart data={salesTrend} />
            </div>
            <div className="xl:col-span-4">
              <TopProducts products={topProducts} />
            </div>
          </>
        ) : (
          <div className="xl:col-span-12">
            <div className="bg-bg-surface border border-border-subtle rounded-md p-12 text-center">
              <Package className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary">Inventory Overview</h3>
              <p className="text-text-secondary max-w-md mx-auto">You have access to stock levels and basic alerts. Contact your manager for full analytics access.</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
