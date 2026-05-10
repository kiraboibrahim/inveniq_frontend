"use client";

import { Card } from "@/components/ui/card";
import { SalesDataPoint } from "@/types";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface SalesTrendChartProps {
  data: SalesDataPoint[];
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  return (
    <Card className="p-6 h-[400px] flex flex-col bg-bg-surface border-border-subtle card" style={{ animationDelay: '300ms' }}>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-text-primary">Sales Trend</h3>
        <p className="text-sm text-text-secondary">Revenue across top categories over the last 7 days</p>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 13 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 13 }}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--color-bg-elevated)', 
                borderColor: 'var(--color-border-subtle)',
                borderRadius: '8px',
                color: 'var(--color-text-primary)'
              }}
              itemStyle={{ color: 'var(--color-text-primary)' }}
              formatter={(value: any) => new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(Number(value) || 0)}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} />
            
            <Line 
              type="monotone" 
              dataKey="Electronics" 
              stroke="var(--color-chart-1)" 
              strokeWidth={3} 
              dot={{ r: 4, fill: 'var(--color-bg-surface)', strokeWidth: 2 }} 
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1500}
            />
            <Line 
              type="monotone" 
              dataKey="Groceries" 
              stroke="var(--color-chart-2)" 
              strokeWidth={3} 
              dot={{ r: 4, fill: 'var(--color-bg-surface)', strokeWidth: 2 }} 
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1500}
            />
            <Line 
              type="monotone" 
              dataKey="Hardware" 
              stroke="var(--color-chart-3)" 
              strokeWidth={3} 
              dot={{ r: 4, fill: 'var(--color-bg-surface)', strokeWidth: 2 }} 
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
