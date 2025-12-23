import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { ApiAnalytics } from '@/app/admin/types';

interface TopApisProps {
  apis: ApiAnalytics[];
  isLoading: boolean;
  onViewAll?: () => void;
}

export function TopApis({ apis, isLoading, onViewAll }: TopApisProps) {
  const topApis = [...apis].sort((a, b) => b.totalRequests - a.totalRequests).slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Top APIs</CardTitle>
            <CardDescription>Most requested APIs in the last 30 days</CardDescription>
          </div>
          {onViewAll && (
            <button onClick={onViewAll} className="text-sm text-primary hover:underline">
              View All
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : topApis.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No API data available
          </div>
        ) : (
          <div className="space-y-4">
            {topApis.map((api, index) => (
              <div key={api.id} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{api.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {api.activeKeys} active keys • {api.uniqueUsers} users
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">{api.totalRequests.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">requests</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
