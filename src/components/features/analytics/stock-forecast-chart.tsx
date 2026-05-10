"use client";

import { Card } from "@/components/ui/card";
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const data = [
  { day: "Day 1", actual: 120, predicted: 120 },
  { day: "Day 2", actual: 110, predicted: 112 },
  { day: "Day 3", actual: 95, predicted: 100 },
  { day: "Day 4", actual: 85, predicted: 90 },
  { day: "Day 5", actual: 70, predicted: 80 },
  { day: "Day 6", actual: 60, predicted: 70 },
  { day: "Day 7", actual: 45, predicted: 62 },
  { day: "Day 8", predicted: 50 },
  { day: "Day 9", predicted: 40 },
  { day: "Day 10", predicted: 30 },
  { day: "Day 11", predicted: 22 },
  { day: "Day 12", predicted: 15 },
  { day: "Day 13", predicted: 8 },
  { day: "Day 14", predicted: 0 },
];

export function StockForecastChart() {
  return (
    <Card className="p-6 h-[450px] flex flex-col bg-bg-surface border-border-subtle card">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-text-primary">Stock Depletion Forecast</h3>
          <p className="text-sm text-text-secondary">AI prediction for "Maize Flour 2kg" over the next 14 days</p>
        </div>
        <div className="px-3 py-1 bg-danger-muted text-danger-text text-sm font-medium rounded-full">
          Est. Out of Stock: Day 14
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
      </div>
    </Card>
  );
}
