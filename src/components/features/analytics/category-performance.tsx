"use client";

import { Card } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

const data = [
  { category: "Groceries", revenue: 8500000, color: "var(--color-chart-1)" },
  { category: "Electronics", revenue: 5200000, color: "var(--color-chart-2)" },
  { category: "Hardware", revenue: 3800000, color: "var(--color-chart-3)" },
  { category: "Apparel", revenue: 2100000, color: "var(--color-chart-4)" },
  { category: "Automotive", revenue: 950000, color: "var(--color-chart-5)" },
];

export function CategoryPerformance() {
  return (
    <Card className="p-6 h-[450px] flex flex-col bg-bg-surface border-border-subtle card" style={{ animationDelay: '100ms' }}>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-text-primary">Category Performance</h3>
        <p className="text-sm text-text-secondary">Revenue distribution by top categories</p>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="category" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--color-text-primary)', fontSize: 13, fontWeight: 500 }} 
            />
            <Tooltip 
              cursor={{ fill: 'var(--color-bg-elevated)' }}
              contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border-subtle)', borderRadius: '8px' }}
              formatter={(value: any) => new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(Number(value) || 0)}
            />
            <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={32}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
