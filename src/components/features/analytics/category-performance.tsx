"use client";

import { Card } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/api";

export function CategoryPerformance() {
    const { data = [], isLoading } = useQuery({
        queryKey: ["categoryPerformance"],
        queryFn: analyticsService.getCategoryPerformance,
    });

    return (
        <Card className="p-6 h-[450px] flex flex-col bg-bg-surface border-border-subtle card" style={{ animationDelay: '100ms' }}>
            <div className="mb-6">
                <h3 className="text-lg font-medium text-text-primary">Category Performance</h3>
                <p className="text-sm text-text-secondary">Revenue distribution by top categories</p>
            </div>

            <div className="flex-1 w-full min-h-0">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-text-secondary">Loading...</div>
                ) : (
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
                                formatter={(value) => new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(Number(value) || 0)}
                            />
                            <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={32}>
                                {data.map((entry: { color?: string }, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </Card>
    );
}
