import { Alert } from "@/types";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertRibbonProps {
  alerts: Alert[];
}

export function AlertRibbon({ alerts }: AlertRibbonProps) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-hide card" style={{ animationDelay: '200ms' }}>
      <div className="flex gap-4 min-w-max">
        {alerts.map((alert) => {
          const isCritical = alert.severity === 'critical';
          const isWarning = alert.severity === 'warning';
          
          return (
            <div 
              key={alert.id}
              className={cn(
                "flex items-center gap-3 py-2.5 px-5 bg-bg-surface/50 border rounded-full whitespace-nowrap shadow-sm hover:bg-bg-elevated cursor-pointer transition-all duration-200 ease-out hover:-translate-y-[2px]",
                isCritical && "border-danger/30 hover:border-danger/60 bg-danger-muted/5",
                isWarning && "border-warning/30 hover:border-warning/60 bg-warning-muted/5",
                !isCritical && !isWarning && "border-info/30 hover:border-info/60 bg-info-muted/5"
              )}
            >
              <div className={cn(
                "flex items-center justify-center p-1 rounded-full",
                isCritical && "bg-danger-muted text-danger-text",
                isWarning && "bg-warning-muted text-warning-text",
                !isCritical && !isWarning && "bg-info-muted text-info-text"
              )}>
                {isCritical && <AlertCircle className="w-4 h-4 animate-bounce" strokeWidth={2} />}
                {isWarning && <AlertTriangle className="w-4 h-4" strokeWidth={2} />}
                {!isCritical && !isWarning && <Info className="w-4 h-4" strokeWidth={2} />}
              </div>
              <span className="text-sm font-semibold text-text-primary">{alert.title}</span>
              <span className="text-text-tertiary">·</span>
              <span className="text-sm text-text-secondary font-medium">{alert.description}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
