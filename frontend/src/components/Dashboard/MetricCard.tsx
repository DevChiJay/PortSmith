'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
  loading?: boolean;
}

/**
 * Reusable metric card component with icon, title, value, and optional trend indicator
 * Shows loading state when data is being fetched
 */
export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  loading = false,
}: MetricCardProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground pt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center pt-1">
            <span
              className={cn(
                'text-xs font-medium',
                trend.isPositive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              )}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconClassName?: string;
  valueClassName?: string;
  loading?: boolean;
}

/**
 * Simple stat card for displaying a single metric
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  valueClassName,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="flex items-center space-x-3">
        {Icon && <Skeleton className="h-10 w-10 rounded-lg" />}
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {Icon && (
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10',
            iconClassName
          )}
        >
          <Icon className="h-5 w-5 text-primary" />
        </div>
      )}
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={cn('text-xl font-semibold', valueClassName)}>{value}</p>
      </div>
    </div>
  );
}

interface MetricCardListProps {
  children: ReactNode;
  className?: string;
}

/**
 * Container for multiple metric cards
 */
export function MetricCardList({ children, className }: MetricCardListProps) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
      {children}
    </div>
  );
}
