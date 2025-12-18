'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Main dashboard grid layout with responsive design
 * Provides consistent spacing and responsive grid for dashboard content
 */
export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {children}
    </div>
  );
}

interface DashboardSectionProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
}

/**
 * Dashboard section component with optional title and action buttons
 */
export function DashboardSection({
  children,
  className,
  title,
  description,
  action,
}: DashboardSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description || action) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

interface DashboardGridProps {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
}

/**
 * Responsive grid for dashboard cards and metrics
 */
export function DashboardGrid({ children, className, cols = 4 }: DashboardGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridClasses[cols], className)}>
      {children}
    </div>
  );
}

interface DashboardContentProps {
  children: ReactNode;
  className?: string;
}

/**
 * Content wrapper for dashboard pages
 */
export function DashboardContent({ children, className }: DashboardContentProps) {
  return (
    <div className={cn('flex-1 space-y-6 p-4 md:p-6 lg:p-8', className)}>
      {children}
    </div>
  );
}

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * Dashboard page header with title, subtitle, and action buttons
 */
export function DashboardHeader({
  title,
  subtitle,
  actions,
  className,
}: DashboardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between space-y-2', className)}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center space-x-2">{actions}</div>}
    </div>
  );
}
