import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  action?: React.ReactNode;
}

export function PageHeader({ title, breadcrumbs, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center text-xs text-text-tertiary mb-1">
            {breadcrumbs.map((bc, index) => (
              <div key={bc.label} className="flex items-center">
                {bc.href ? (
                  <Link href={bc.href} className="hover:text-text-primary transition-colors">
                    {bc.label}
                  </Link>
                ) : (
                  <span>{bc.label}</span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight className="w-3 h-3 mx-1" />
                )}
              </div>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-bold tracking-tight font-display text-text-primary">{title}</h1>
      </div>
      
      {action && (
        <div className="flex items-center mt-3 sm:mt-0">
          {action}
        </div>
      )}
    </div>
  );
}
