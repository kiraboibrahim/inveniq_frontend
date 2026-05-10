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
  return (
    <Card className="p-6 h-[400px] flex flex-col bg-bg-surface border-border-subtle card" style={{ animationDelay: '360ms' }}>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-text-primary">Top Products</h3>
        <p className="text-sm text-text-secondary">Best performing items this week</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-5">
        {products.map((product, i) => (
          <div key={i} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-elevated text-sm font-semibold text-text-secondary border border-border-subtle group-hover:border-accent group-hover:text-accent transition-colors">
                {i + 1}
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{product.name}</p>
                <p className="text-xs text-text-tertiary">{product.units} units sold</p>
              </div>
            </div>
            
            <div className="text-right flex items-center gap-3">
              <span className="text-sm font-mono text-text-secondary">
                {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(product.revenue)}
              </span>
              <div className={cn(
                "flex items-center justify-center h-6 w-6 rounded-md",
                product.trend === "up" ? "bg-success-muted text-success-text" : "bg-danger-muted text-danger-text"
              )}>
                {product.trend === "up" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
