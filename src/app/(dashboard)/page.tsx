"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/features/dashboard/kpi-card";
import { AlertRibbon } from "@/components/features/dashboard/alert-ribbon";
import { SalesTrendChart } from "@/components/features/dashboard/sales-trend-chart";
import { TopProducts } from "@/components/features/dashboard/top-products";
import { mockAlerts, mockSalesData, mockTopProducts } from "@/services/mock-data";
import { Package, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuthStore();
  const [greeting, setGreeting] = useState("Good morning");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 17) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  const today = new Intl.DateTimeFormat('en-UG', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  
  const firstName = user?.name ? user.name.split(" ")[0] : "Bushira";
  const displayGreeting = mounted ? `${greeting}, ${firstName}` : `Good morning, Bushira`;

  return (
    <>
      <PageHeader 
        title={displayGreeting} 
        breadcrumbs={[{ label: today }]}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        <KpiCard 
          label="Total Products" 
          value={1240} 
          delta={5.2} 
          icon={<Package />} 
          sparklineData={[1180, 1190, 1200, 1210, 1225, 1230, 1240]} 
        />
        <KpiCard 
          label="Stock Value" 
          value={45600000} 
          delta={12.4} 
          isCurrency={true}
          icon={<DollarSign />} 
          sparklineData={[41, 42, 42.5, 43, 44.5, 45, 45.6]} 
        />
        <KpiCard 
          label="Items Low/Out" 
          value={24} 
          delta={-8.5} 
          icon={<AlertTriangle />} 
          sparklineData={[28, 27, 26, 26, 25, 24, 24]} 
        />
        <KpiCard 
          label="Today's Sales" 
          value={1250000} 
          delta={-2.1} 
          isCurrency={true}
          icon={<TrendingUp />} 
          sparklineData={[140, 135, 150, 142, 138, 120, 125]} 
        />
      </div>

      <div className="mb-6">
        <AlertRibbon alerts={mockAlerts} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8">
          <SalesTrendChart data={mockSalesData} />
        </div>
        <div className="xl:col-span-4">
          <TopProducts products={mockTopProducts} />
        </div>
      </div>
    </>
  );
}
