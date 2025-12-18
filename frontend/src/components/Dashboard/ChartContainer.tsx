'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChartContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
  actions?: ReactNode;
  height?: string | number;
}

/**
 * Wrapper for charts with loading states and error handling
 * Provides consistent styling and behavior for all chart components
 */
export function ChartContainer({
  title,
  description,
  children,
  loading = false,
  error = null,
  onRetry,
  className,
  actions,
  height = 350,
}: ChartContainerProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {actions && <div>{actions}</div>}
      </CardHeader>
      <CardContent>
        <div style={{ height: typeof height === 'number' ? `${height}px` : height }}>
          {loading && <ChartLoadingSkeleton />}
          {error && !loading && (
            <ChartErrorState error={error} onRetry={onRetry} />
          )}
          {!loading && !error && children}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for charts
 */
function ChartLoadingSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="space-y-3 w-full">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

/**
 * Error state for charts with retry option
 */
function ChartErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Chart</AlertTitle>
        <AlertDescription className="flex flex-col gap-3">
          <p>{error}</p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="w-fit"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}

interface ChartWrapperProps {
  children: ReactNode;
  className?: string;
  loading?: boolean;
}

/**
 * Simple wrapper for responsive charts without the card container
 */
export function ChartWrapper({ children, className, loading = false }: ChartWrapperProps) {
  if (loading) {
    return <ChartLoadingSkeleton />;
  }

  return (
    <div className={cn('w-full h-full', className)}>
      {children}
    </div>
  );
}

interface EmptyChartStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
}

/**
 * Empty state for charts with no data
 */
export function EmptyChartState({
  title = 'No Data Available',
  description = 'There is no data to display at this time.',
  icon,
}: EmptyChartStateProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center text-center">
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
