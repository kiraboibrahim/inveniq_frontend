import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center p-12 text-center bg-bg-surface border-dashed border-border-strong min-h-[400px]">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-bg-elevated text-text-tertiary mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-medium text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary max-w-sm mb-8 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </Card>
  );
}
