import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopProduct {
  name: string;
  units: number;
  revenue: number;
  trend: string;
}

export function TopProducts({ products }: { products: TopProduct[] }) {
  // Cap at top 5 list
  const displayProducts = products.slice(0, 5);

  const getRankBadgeStyles = (index: number) => {
    switch (index) {
      case 0: // 1st Place
        return "bg-amber-500/10 text-amber-500 border-amber-500/30 shadow-amber-500/5";
      case 1: // 2nd Place
        return "bg-slate-400/15 text-slate-300 border-slate-400/30 shadow-slate-400/5";
      case 2: // 3rd Place
        return "bg-amber-800/15 text-amber-600 border-amber-800/30 shadow-amber-800/5";
      default:
        return "bg-bg-elevated text-text-secondary border-border-subtle";
    }
  };

  return (
    <Card className="p-6 h-[400px] flex flex-col bg-bg-surface border border-border-subtle rounded-2xl shadow-sm overflow-hidden">
      <div className="mb-6">
        <h3 className="text-lg font-bold tracking-tight text-text-primary">Top Products</h3>
        <p className="text-sm font-medium text-text-secondary">Best performing items this week</p>
      </div>

      <div className="flex-1 flex flex-col gap-3 justify-center">
        {displayProducts.map((product, i) => (
          <div 
            key={i} 
            className="flex items-center justify-between group transition-all duration-150 hover:translate-x-0.5 min-w-0"
          >
            <div className="flex items-center gap-3 min-w-0 mr-4">
              <div className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold border transition-all duration-200 shadow-sm",
                getRankBadgeStyles(i),
                "group-hover:scale-105"
              )}>
                {i + 1}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate" title={product.name}>
                  {product.name}
                </p>
                <p className="text-xs font-medium text-text-tertiary">{product.units} units sold</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5 shrink-0 ml-auto">
              <span className="text-xs font-mono font-bold text-text-secondary">
                {new Intl.NumberFormat('en-UG', { 
                  style: 'currency', 
                  currency: 'UGX', 
                  maximumFractionDigits: 0 
                }).format(product.revenue)}
              </span>
              <div className={cn(
                "flex items-center justify-center h-6 w-6 rounded-lg shadow-sm border shrink-0",
                product.trend === "up" 
                  ? "bg-success-muted/50 border-success/20 text-success-text" 
                  : "bg-danger-muted/50 border-danger/20 text-danger-text"
              )}>
                {product.trend === "up" 
                  ? <TrendingUp className="w-3.5 h-3.5" /> 
                  : <TrendingDown className="w-3.5 h-3.5" />}
              </div>
            </div>
          </div>
        ))}
        
        {displayProducts.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-sm text-text-tertiary">
            No product sales recorded yet.
          </div>
        )}
      </div>
    </Card>
  );
}
