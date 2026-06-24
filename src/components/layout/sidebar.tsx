"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    Bell,
    Truck,
    Users,
    Store,
    Settings,
    ShoppingCart,
    ClipboardList,
    Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { alertService } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
    roles: string[];
    badge?: number;
}

interface NavSection {
    label: string;
    items: NavItem[];
}

// ─── Tooltip (collapsed state) ────────────────────────────────────────────────

function NavTooltip({ label, badge }: { label: string; badge?: number }) {
    return (
        <div
            className={cn(
                "absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 z-50",
                "px-2.5 py-1.5 rounded-lg pointer-events-none",
                "bg-bg-elevated border border-border-strong",
                "text-xs font-medium text-text-primary whitespace-nowrap",
                "shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150",
                "flex items-center gap-1.5",
                // Arrow
                "before:content-[''] before:absolute before:-left-1 before:top-1/2 before:-translate-y-1/2",
                "before:rotate-45 before:w-2 before:h-2",
                "before:bg-bg-elevated before:border-l before:border-b before:border-border-strong"
            )}
        >
            {label}
            {badge !== undefined && (
                <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-danger text-[9px] font-bold text-white">
                    {badge}
                </span>
            )}
        </div>
    );
}

// ─── Single nav link ──────────────────────────────────────────────────────────

function NavLink({
    item,
    isActive,
    isCollapsed,
}: {
    item: NavItem;
    isActive: boolean;
    isCollapsed: boolean;
}) {
    return (
        <Link
            href={item.href}
            className={cn(
                "relative flex items-center h-10 rounded-lg gap-2.5 group",
                "transition-all duration-150 ease-out",
                isCollapsed ? "mx-1.5 px-0 justify-center" : "mx-2 px-2.5",
                isActive
                    ? "bg-accent-muted"
                    : "hover:bg-bg-elevated hover:translate-x-0.5"
            )}
        >
            {/* Left accent bar */}
            {isActive && !isCollapsed && (
                <span className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent rounded-r-full" />
            )}

            {/* Icon */}
            <item.icon
                className={cn(
                    "w-[18px] h-[18px] shrink-0 transition-all duration-150",
                    "group-hover:scale-110",
                    isActive
                        ? "text-accent-text"
                        : "text-text-secondary group-hover:text-text-primary"
                )}
                strokeWidth={1.75}
            />

            {/* Label */}
            {!isCollapsed && (
                <span
                    className={cn(
                        "text-sm flex-1 truncate transition-colors duration-150",
                        isActive
                            ? "text-accent-text font-semibold"
                            : "text-text-secondary font-medium group-hover:text-text-primary"
                    )}
                >
                    {item.name}
                </span>
            )}

            {/* Badge */}
            {item.badge !== undefined && !isCollapsed && (
                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-danger text-[10px] font-bold text-white animate-pulse">
                    {item.badge}
                </span>
            )}

            {/* Collapsed tooltip */}
            {isCollapsed && <NavTooltip label={item.name} badge={item.badge} />}
        </Link>
    );
}

// ─── Section group ────────────────────────────────────────────────────────────

function NavSection({
    section,
    pathname,
    isCollapsed,
}: {
    section: NavSection;
    pathname: string;
    isCollapsed: boolean;
}) {
    return (
        <div className="flex flex-col gap-0.5">
            {/* Section label — fades out when collapsed */}
            <p
                className={cn(
                    "px-4 pt-3 pb-1 text-[10px] font-semibold tracking-widest uppercase text-text-tertiary",
                    "transition-all duration-200 overflow-hidden",
                    isCollapsed ? "opacity-0 h-0 pt-0 pb-0" : "opacity-100"
                )}
            >
                {section.label}
            </p>

            {section.items.map((item) => (
                <NavLink
                    key={item.href}
                    item={item}
                    isActive={pathname === item.href}
                    isCollapsed={isCollapsed}
                />
            ))}
        </div>
    );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar({ isCollapsed }: { isCollapsed: boolean; onToggle: () => void }) {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const role = user?.role ?? "staff";
    const initials = user?.name
        ? user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
        : "IQ";

    const { data: alerts = [] } = useQuery({
        queryKey: ["alerts"],
        queryFn: () => alertService.getAlerts(),
        refetchInterval: 10000,
    });

    const alertCount = alerts.filter((a: { resolved: boolean }) => !a.resolved).length;

    // ── Nav structure ────────────────────────────────────────────────────────
    const sections: NavSection[] = [
        {
            label: "Main",
            items: [
                { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["admin", "manager", "staff"] },
                { name: "POS Checkout", href: "/pos", icon: ShoppingCart, roles: ["admin", "manager", "staff"] },
                { name: "Sales Ledger", href: "/sales", icon: Receipt, roles: ["admin", "manager", "staff"] },
                { name: "Inventory", href: "/inventory", icon: Package, roles: ["admin", "manager", "staff"] },
                { name: "Orders", href: "/orders", icon: ClipboardList, roles: ["admin", "manager", "staff"] },
                {
                    name: "Alerts",
                    href: "/alerts",
                    icon: Bell,
                    roles: ["admin", "manager", "staff"],
                    badge: alertCount > 0 ? alertCount : undefined,
                },
            ],
        },
        {
            label: "Management",
            items: [
                { name: "Suppliers", href: "/suppliers", icon: Truck, roles: ["admin", "manager"] },
                { name: "Customers", href: "/customers", icon: Users, roles: ["admin", "manager"] },
                { name: "Multi-Shop", href: "/multi-shop", icon: Store, roles: ["admin"] },
            ],
        },
    ];

    const filteredSections: NavSection[] = sections.map((section) => ({
        ...section,
        items: section.items.filter((item) => item.roles.includes(role)),
    })).filter((section) => section.items.length > 0);

    return (
        <aside
            className={cn(
                "flex flex-col h-full bg-bg-surface border-r border-border-subtle",
                "transition-[width] duration-[220ms] ease-out overflow-hidden",
                isCollapsed ? "w-16" : "w-60"
            )}
        >
            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between h-14 px-4 border-b border-border-subtle shrink-0">
                {/* Logo */}
                <span className="font-display text-xl font-bold bg-gradient-to-r from-accent to-info bg-clip-text text-transparent tracking-tight shrink-0">
                    {isCollapsed ? "IQ" : "InvenIQ"}
                </span>
            </div>

            {/* ── Nav ──────────────────────────────────────────────────────── */}
            <nav
                className="flex-1 py-3 flex flex-col gap-0 overflow-y-auto scrollbar-none"
                aria-label="Main navigation"
            >
                {filteredSections.map((section) => (
                    <NavSection
                        key={section.label}
                        section={section}
                        pathname={pathname}
                        isCollapsed={isCollapsed}
                    />
                ))}
            </nav>

            {/* ── Footer — user card ────────────────────────────────────────── */}
            <div className="border-t border-border-subtle p-2">
                <Link
                    href="/settings/profile"
                    className={cn(
                        "relative flex items-center gap-2.5 p-2 rounded-lg group",
                        "transition-all duration-150",
                        pathname === "/settings/profile"
                            ? "bg-accent-muted"
                            : "hover:bg-bg-elevated",
                        isCollapsed && "justify-center"
                    )}
                >
                    {/* Avatar */}
                    <div
                        className={cn(
                            "flex items-center justify-center w-7 h-7 rounded-lg shrink-0",
                            "bg-gradient-to-br from-accent to-info",
                            "text-[11px] font-bold text-white tracking-wide"
                        )}
                    >
                        {initials}
                    </div>

                    {/* Name + role */}
                    {!isCollapsed && (
                        <>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-text-primary truncate leading-tight">
                                    {user?.name ?? "Admin User"}
                                </p>
                                <p className="text-[11px] text-text-tertiary truncate leading-tight capitalize">
                                    {role}
                                </p>
                            </div>
                            <Settings
                                className={cn(
                                    "w-4 h-4 shrink-0 transition-colors duration-150",
                                    pathname === "/settings/profile"
                                        ? "text-accent-text"
                                        : "text-text-tertiary group-hover:text-text-secondary"
                                )}
                                strokeWidth={1.75}
                            />
                        </>
                    )}

                    {/* Tooltip in collapsed state */}
                    {isCollapsed && (
                        <div
                            className={cn(
                                "absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 z-50",
                                "px-2.5 py-1.5 rounded-lg pointer-events-none",
                                "bg-bg-elevated border border-border-strong",
                                "text-xs font-medium text-text-primary whitespace-nowrap",
                                "shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150",
                                "before:content-[''] before:absolute before:-left-1 before:top-1/2 before:-translate-y-1/2",
                                "before:rotate-45 before:w-2 before:h-2",
                                "before:bg-bg-elevated before:border-l before:border-b before:border-border-strong"
                            )}
                        >
                            Profile
                        </div>
                    )}
                </Link>
            </div>
        </aside>
    );
}