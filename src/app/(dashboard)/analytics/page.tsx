import { PageHeader } from "@/components/layout/page-header";
import { StockForecastChart } from "@/components/features/analytics/stock-forecast-chart";
import { CategoryPerformance } from "@/components/features/analytics/category-performance";
import { AiInsightCard } from "@/components/features/analytics/ai-insight-card";

export default function Analytics() {
  return (
    <>
      <PageHeader 
        title="Predictive Analytics" 
        breadcrumbs={[{ label: "AIMS" }, { label: "Analytics" }]}
      />
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
        <div className="xl:col-span-8 flex flex-col gap-6">
          <StockForecastChart />
          <CategoryPerformance />
        </div>
        
        <div className="xl:col-span-4 flex flex-col gap-6">
          <h3 className="text-lg font-medium text-text-primary">AI Insights</h3>
          <AiInsightCard 
            title="Stock Depletion Alert" 
            description="Maize Flour 2kg is selling 30% faster than usual. Based on current velocity, it will run out in 14 days." 
            actionText="Create Purchase Order" 
            delay="0ms"
          />
          <AiInsightCard 
            title="Pricing Optimization" 
            description="Solar Lanterns have high demand but low elasticity. Increasing price by 5% could yield a 12% profit margin increase." 
            actionText="Review Pricing" 
            delay="100ms"
          />
          <AiInsightCard 
            title="Dead Stock Identified" 
            description="Portland Cement 50kg has had 0 movement in 60 days. Consider a promotion or redistribution." 
            actionText="View Item" 
            delay="200ms"
          />
        </div>
      </div>
    </>
  );
}
