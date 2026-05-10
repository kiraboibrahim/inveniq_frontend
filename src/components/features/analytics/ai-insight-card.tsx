import { Card } from "@/components/ui/card";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AiInsightCardProps {
  title: string;
  description: string;
  actionText: string;
  delay?: string;
}

export function AiInsightCard({ title, description, actionText, delay = "0ms" }: AiInsightCardProps) {
  return (
    <Card className="p-5 flex flex-col bg-bg-surface border-border-subtle relative overflow-hidden group card" style={{ animationDelay: delay }}>
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-all duration-500"></div>
      
      <div className="flex items-start gap-4 z-10 relative">
        <div className="p-2 bg-accent-muted rounded-md text-accent">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-text-primary font-medium mb-1">{title}</h4>
          <p className="text-sm text-text-secondary mb-4 leading-relaxed">
            {description}
          </p>
          <Button variant="link" className="p-0 h-auto text-accent hover:text-accent-hover font-medium">
            {actionText} <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
