"use client";

import { Card } from "@/components/ui/card";
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/api";

export function StockForecastChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["stockForecast"],
    queryFn: () => analyticsService.getStockForecast(),
  });

  return (
    <Card className="p-6 h-[450px] flex flex-col bg-bg-surface border-border-subtle card">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-text-primary">Stock Depletion Forecast</h3>
          <p className="text-sm text-text-secondary">
            {isLoading ? "Loading predictions..." : (data ? `AI prediction for "${data.product_name || 'Product'}" over the next 14 days` : "No prediction available")}
          </p>
        </div>
        {!isLoading && data?.days_remaining !== null && data?.days_remaining !== undefined && (
          <div className="px-3 py-1 bg-danger-muted text-danger-text text-sm font-medium rounded-full">
            Est. Out of Stock: Day {data.days_remaining}
          </div>
        )}
      </div>
      
      <div className="flex-1 w-full min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-text-secondary">Analyzing stock velocity...</div>
        ) : !data || !data.projection || data.projection.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-secondary">No stock data available for prediction</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.projection} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 13 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 13 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--color-text-primary)' }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              
              <Bar dataKey="actual" name="Actual Stock" fill="var(--color-accent)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Line type="monotone" dataKey="predicted" name="AI Prediction" stroke="var(--color-warning)" strokeWidth={3} strokeDasharray="5 5" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
