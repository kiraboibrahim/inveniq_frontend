"use client";

import { Card } from "@/components/ui/card";
import { SalesDataPoint } from "@/types";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface SalesTrendChartProps {
    data: SalesDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        // Filter out categories with 0 or negative values
        const activeItems = payload.filter((item: any) => Number(item.value) > 0);
        if (activeItems.length === 0) return null;

        return (
            <div className="bg-bg-surface/90 border border-border-subtle p-3 rounded-2xl shadow-xl backdrop-blur-md min-w-[200px]">
                <p className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">{label}</p>
                <div className="space-y-1.5">
                    {activeItems.map((item: any) => (
                        <div key={item.name} className="flex items-center gap-4 justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.stroke }} />
                                <span className="text-text-primary font-medium">{item.name}</span>
                            </div>
                            <span className="font-mono font-bold text-text-primary">
                                {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(item.value)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export function SalesTrendChart({ data }: SalesTrendChartProps) {
    const categoryKeys = data.length > 0
        ? Object.keys(data[0]).filter(key => key !== "date" && key !== "revenue")
        : [];

    // Filter categories to only those with sales > 0 in at least one data point to avoid layout clutter
    const activeCategoryKeys = categoryKeys.filter(key => 
        data.some(point => Number(point[key as keyof SalesDataPoint] || 0) > 0)
    );

    const chartColors = [
        "#6366f1", // Indigo
        "#10b981", // Emerald
        "#f59e0b", // Amber
        "#ef4444", // Red
        "#ec4899", // Pink
        "#3b82f6", // Blue
        "#8b5cf6", // Purple
    ];

    return (
        <Card className="p-6 h-[400px] flex flex-col bg-bg-surface border border-border-subtle rounded-2xl shadow-sm overflow-hidden">
            <div className="mb-6">
                <h3 className="text-lg font-bold tracking-tight text-text-primary">Sales Trend</h3>
                <p className="text-sm font-medium text-text-secondary">Revenue across top categories over the last 7 days</p>
            </div>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
                            dy={8}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
                            tickFormatter={(value) => {
                                if (value >= 1000000) {
                                    return `${(value / 1000000).toFixed(1)}M`;
                                }
                                return `${value / 1000}k`;
                            }}
                            width={50}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                            iconType="circle" 
                            wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }}
                            verticalAlign="bottom"
                        />

                        {activeCategoryKeys.map((category, idx) => (
                            <Line
                                key={category}
                                type="monotone"
                                dataKey={category}
                                stroke={chartColors[idx % chartColors.length]}
                                strokeWidth={2.5}
                                dot={{ r: 3, fill: 'var(--color-bg-surface)', strokeWidth: 2 }}
                                activeDot={{ r: 5, strokeWidth: 0 }}
                                animationDuration={1000}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
