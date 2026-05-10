"use client";

import { mockAlerts } from "@/services/mock-data";
import { AlertTriangle, Info, Bell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AlertFeedList() {
  return (
    <div className="flex flex-col gap-4">
      {mockAlerts.map((alert) => (
        <div 
          key={alert.id}
          className="flex items-start gap-4 p-5 rounded-md border border-border-subtle bg-bg-surface hover:bg-bg-elevated transition-colors group"
        >
          <div className={cn(
            "p-2.5 rounded-full mt-0.5",
            alert.severity === 'critical' ? "bg-danger-muted text-danger-text" :
            alert.severity === 'warning' ? "bg-warning-muted text-warning-text" :
            "bg-accent-muted text-accent"
          )}>
            {alert.severity === 'critical' ? <AlertTriangle className="w-5 h-5" /> : 
             alert.severity === 'warning' ? <Bell className="w-5 h-5" /> : 
             <Info className="w-5 h-5" />}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-1">
              <h4 className="font-medium text-text-primary text-base">
                {alert.title}
              </h4>
              <span className="text-xs text-text-tertiary whitespace-nowrap">
                {alert.id === "a1" ? "Just now" : alert.id === "a2" ? "2 hrs ago" : "Yesterday"}
              </span>
            </div>
            
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              {alert.description || (
                alert.severity === 'critical' ? "Action is required immediately to prevent stockouts and loss of revenue." : 
                alert.severity === 'warning' ? "Monitor this situation closely as it may impact future fulfillment." : 
                "System notification for your review."
              )}
            </p>
            
            <div className="flex items-center gap-3">
              <Button size="sm" variant="outline" className="h-8 text-xs border-border-strong text-text-primary hover:bg-bg-base">
                View Details
              </Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs text-text-secondary hover:text-success-text hover:bg-success-muted">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Mark Resolved
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
