'use client';

import { useActivityLog, type ActivityItem } from '@/hooks/use-activity-log';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Activity,
  Key,
  UserPlus,
  CheckCircle,
  XCircle,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActivityFeedProps {
  limit?: number;
  showRefresh?: boolean;
  className?: string;
}

/**
 * Real-time activity feed component
 * Displays recent system activities with auto-refresh
 */
export function ActivityFeed({ limit = 20, showRefresh = true, className }: ActivityFeedProps) {
  const { activities, isLoading, error, refresh, isValidating } = useActivityLog({
    limit,
    refreshInterval: 15000, // Refresh every 15 seconds
  });

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'api_request':
        return Activity;
      case 'key_created':
        return Key;
      case 'user_registered':
        return UserPlus;
      default:
        return Activity;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'success') {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Success
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Error
      </Badge>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Real-time system events and user actions
          </CardDescription>
        </div>
        {showRefresh && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refresh()}
            disabled={isValidating}
          >
            <RefreshCw className={cn('h-4 w-4', isValidating && 'animate-spin')} />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading && <ActivityFeedSkeleton />}
          {error && (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              Failed to load activities. Please try again.
            </div>
          )}
          {!isLoading && !error && activities.length === 0 && (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              No recent activity found.
            </div>
          )}
          {!isLoading && !error && activities.length > 0 && (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <ActivityItem key={`${activity.timestamp}-${index}`} activity={activity} />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/**
 * Individual activity item component
 */
function ActivityItem({ activity }: { activity: ActivityItem }) {
  const iconMap: Record<string, LucideIcon> = {
    api_request: Activity,
    key_created: Key,
    user_registered: UserPlus,
  };
  
  const Icon = iconMap[activity.type] || Activity;

  return (
    <div className="flex items-start space-x-3 pb-4 border-b last:border-0">
      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg',
          activity.status === 'success'
            ? 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400'
            : 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium leading-none">{activity.description}</p>
          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">
            {activity.user.name} ({activity.user.email})
          </p>
          {activity.status && (
            <Badge
              variant={activity.status === 'success' ? 'default' : 'destructive'}
              className="text-[10px] px-1.5 py-0"
            >
              {activity.status}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for activity feed
 */
function ActivityFeedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start space-x-3 pb-4">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface CompactActivityFeedProps {
  limit?: number;
  className?: string;
}

/**
 * Compact version of activity feed for smaller spaces
 */
export function CompactActivityFeed({ limit = 5, className }: CompactActivityFeedProps) {
  const { activities, isLoading } = useActivityLog({ limit, refreshInterval: 30000 });

  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {activities.slice(0, limit).map((activity, index) => (
        <div
          key={`${activity.timestamp}-${index}`}
          className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-muted/50"
        >
          <span className="truncate">{activity.description}</span>
          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
          </span>
        </div>
      ))}
    </div>
  );
}
