import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import type { ApiAnalytics } from '@/app/admin/types';

interface ApiPerformanceProps {
  apis: ApiAnalytics[];
  dateRange: string;
  isLoading: boolean;
}

export function ApiPerformance({ apis, dateRange, isLoading }: ApiPerformanceProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Performance</CardTitle>
          <CardDescription>Performance metrics for all APIs in the last {dateRange} days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (apis.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Performance</CardTitle>
          <CardDescription>Performance metrics for all APIs in the last {dateRange} days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            No API data available for selected period
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Performance</CardTitle>
        <CardDescription>Performance metrics for all APIs in the last {dateRange} days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {apis.map((api) => (
            <div key={api.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{api.name}</h4>
                  <p className="text-sm text-muted-foreground">/{api.slug}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={api.successRate >= 95 ? 'default' : 'secondary'}>
                    {api.successRate}% Success
                  </Badge>
                  <Badge variant="outline">{api.totalRequests.toLocaleString()} Requests</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Keys</p>
                  <p className="font-semibold">{api.totalKeys}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Active Keys</p>
                  <p className="font-semibold">{api.activeKeys}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Unique Users</p>
                  <p className="font-semibold">{api.uniqueUsers}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg Response</p>
                  <p className="font-semibold">{api.avgResponseTime}ms</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Error Rate</p>
                  <p className="font-semibold text-red-600">{api.errorRate}%</p>
                </div>
              </div>

              <div className="mt-3">
                <Progress value={api.successRate} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
