"use client";

import { useCountUp } from "@/hooks/use-count-up";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

export interface KpiCardProps {
  label: string;
  value: number;
  delta: number;
  isCurrency?: boolean;
  sparklineData?: number[];
  icon: React.ReactNode;
}

export function KpiCard({ label, value, delta, isCurrency = false, sparklineData, icon }: KpiCardProps) {
  const animatedValue = useCountUp(value, 800);
  
  const formattedValue = isCurrency 
    ? new Intl.NumberFormat("en-UG", { 
        style: "currency", 
        currency: "UGX", 
        maximumFractionDigits: 1,
        notation: "compact",
        compactDisplay: "short"
      }).format(animatedValue)
    : new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1
      }).format(animatedValue);

  const isPositive = delta > 0;
  const isZero = delta === 0;
  
  const chartData = sparklineData?.map((val, i) => ({ value: val, index: i })) || [];

  return (
    <Card className="p-6 flex flex-col gap-4 relative overflow-hidden bg-bg-surface border-border-subtle hover:border-border-strong transition-colors duration-250 ease-out card cursor-default">
      <div className="flex items-center gap-3 text-text-secondary">
        <div className="w-5 h-5 [&>svg]:w-5 [&>svg]:h-5 [&>svg]:stroke-[1.5]">{icon}</div>
        <span className="text-md font-medium">{label}</span>
      </div>

      <div className="text-3xl font-display tracking-tight text-text-primary truncate" title={isCurrency ? `USh ${value.toLocaleString()}` : value.toLocaleString()}>
        {formattedValue}
      </div>

      <div className="flex items-end justify-between mt-2">
        <div className={cn(
          "flex items-center gap-1.5 text-sm font-medium",
          isPositive && "text-success-text",
          !isPositive && !isZero && "text-danger-text",
          isZero && "text-text-secondary"
        )}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : isZero ? <Minus className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{Math.abs(delta)}%</span>
          <span className="text-text-tertiary font-normal ml-1">vs last week</span>
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="h-8 w-24 opacity-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={isPositive ? "var(--color-success)" : isZero ? "var(--color-text-tertiary)" : "var(--color-danger)"} 
                  strokeWidth={2} 
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
}
