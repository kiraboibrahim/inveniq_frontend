"use client";

import { useCountUp } from "@/hooks/use-count-up";
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
            compactDisplay: "short",
        }).format(animatedValue)
        : new Intl.NumberFormat("en-US", {
            notation: "compact",
            compactDisplay: "short",
            maximumFractionDigits: 1,
        }).format(animatedValue);

    const isPositive = delta > 0;
    const isNegative = delta < 0;
    const isZero = delta === 0;

    const isDanger =
        label.toLowerCase().includes("low") || label.toLowerCase().includes("out");
    const isSuccess =
        label.toLowerCase().includes("sales") || label.toLowerCase().includes("revenue");

    const accentColor = isDanger
        ? "var(--color-danger)"
        : isSuccess
            ? "var(--color-success)"
            : "var(--color-accent)";

    const chartData = sparklineData?.map((val, i) => ({ value: val, index: i })) || [];

    return (
        <div
            className={cn(
                "group relative flex flex-col justify-between gap-5 rounded-xl p-5",
                "bg-bg-surface border border-border-subtle",
                "hover:border-border-strong transition-colors duration-200 cursor-pointer card"
            )}
        >
            {/* Top row: label + icon */}
            <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-medium text-text-tertiary uppercase tracking-widest leading-none pt-0.5">
                    {label}
                </span>
                <div
                    className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        isDanger
                            ? "bg-danger-muted text-danger-text"
                            : isSuccess
                                ? "bg-success-muted text-success-text"
                                : "bg-accent-muted text-accent-text"
                    )}
                >
                    <div className="w-4 h-4 [&>svg]:w-4 [&>svg]:h-4 [&>svg]:stroke-[1.75]">{icon}</div>
                </div>
            </div>

            {/* Value */}
            <div
                className="text-3xl font-display font-semibold tracking-tight text-text-primary tabular-nums"
                title={isCurrency ? `USh ${value.toLocaleString()}` : value.toLocaleString()}
            >
                {formattedValue}
            </div>

            {/* Bottom row: delta + sparkline */}
            <div className="flex items-end justify-between gap-2">
                <div
                    className={cn(
                        "flex items-center gap-1 text-xs font-medium whitespace-nowrap",
                        isPositive && "text-success-text",
                        isNegative && "text-danger-text",
                        isZero && "text-text-tertiary"
                    )}
                >
                    <span className="flex items-center gap-0.5">
                        {isPositive ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                        ) : isZero ? (
                            <Minus className="w-3.5 h-3.5" />
                        ) : (
                            <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        {Math.abs(delta)}%
                    </span>
                    <span className="text-text-tertiary font-normal whitespace-nowrap">vs last week</span>
                </div>

                {chartData.length > 0 && (
                    <div className="h-9 w-20 opacity-70 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke={accentColor}
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

            {/* Accent bottom bar */}
            <div
                className="absolute bottom-0 inset-x-0 h-[2px] rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: accentColor }}
            />
        </div>
    );
}