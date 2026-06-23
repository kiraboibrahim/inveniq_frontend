import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center p-12 text-center",
                "min-h-[400px] w-full rounded-xl",
                "border border-dashed border-border-strong bg-bg-surface",
                className
            )}
        >
            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-bg-elevated border border-border-subtle text-text-tertiary mb-5">
                {icon}
            </div>

            {/* Text */}
            <h3 className="text-base font-semibold text-text-primary mb-1.5">{title}</h3>
            <p className="text-sm text-text-secondary max-w-xs leading-relaxed mb-6">
                {description}
            </p>

            {/* Action */}
            {action && <div>{action}</div>}
        </div>
    );
}