import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  BarChart2, 
  Bell, 
  Truck, 
  Users, 
  Store, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "Alerts", href: "/alerts", icon: Bell, badge: 3 },
  { name: "Suppliers", href: "/suppliers", icon: Truck },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Multi-Shop", href: "/multi-shop", icon: Store },
];

export function Sidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname();

  return (
    <aside 
      className={cn(
        "flex flex-col h-full bg-bg-surface border-r border-border-subtle transition-all duration-250 ease-in-out",
        isCollapsed ? "w-[64px]" : "w-[240px]"
      )}
    >
      <div className="h-[60px] flex items-center justify-center border-b border-border-subtle">
        <span className="font-display text-xl tracking-wide text-accent-text">
          {isCollapsed ? "A" : "AIMS"}
        </span>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center h-10 rounded-md transition-colors duration-150 relative group",
                isActive 
                  ? "bg-accent text-text-primary" 
                  : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
                isCollapsed ? "justify-center" : "px-3"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
              {!isCollapsed && (
                <span className="ml-3 text-base truncate font-medium">{item.name}</span>
              )}
              {item.badge && !isCollapsed && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs font-medium text-white">
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-14 px-2 py-1 bg-bg-elevated text-text-primary text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border-subtle">
        <Link 
          href="/settings"
          className={cn(
            "flex items-center h-10 rounded-md transition-colors duration-150 relative group",
            pathname === "/settings" 
              ? "bg-accent text-text-primary" 
              : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
            isCollapsed ? "justify-center" : "px-3"
          )}
        >
          <Settings className="w-5 h-5 shrink-0" strokeWidth={1.5} />
          {!isCollapsed && (
            <span className="ml-3 text-base truncate font-medium">Settings</span>
          )}
          {isCollapsed && (
            <div className="absolute left-14 px-2 py-1 bg-bg-elevated text-text-primary text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
              Settings
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}
