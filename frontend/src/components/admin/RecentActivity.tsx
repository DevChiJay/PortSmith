import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from 'lucide-react';
import { format } from 'date-fns';
import type { ActivityLog } from '@/app/admin/types';

interface RecentActivityProps {
  activities: ActivityLog[];
  isLoading: boolean;
  maxItems?: number;
}

export function RecentActivity({ activities, isLoading, maxItems = 10 }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events and actions</CardDescription>
          </div>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No recent activity
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {activities.slice(0, maxItems).map((activity, index) => (
              <div key={`${activity.timestamp}-${index}`} className="border-b last:border-0 pb-3 last:pb-0">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {activity.type === 'user_registered' && (
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    )}
                    {activity.type === 'key_created' && (
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    )}
                    {activity.type === 'key_revoked' && (
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                    )}
                    {activity.type === 'api_request' && (
                      <div className="h-2 w-2 rounded-full bg-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(activity.timestamp), 'MMM d, HH:mm')}
                      </p>
                      {activity.user?.email && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <p className="text-xs text-muted-foreground truncate">
                            {activity.user.email}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
