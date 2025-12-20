'use client';

import { useState } from 'react';
import { useAdminMetrics, useApisAnalytics } from '@/hooks/use-admin-metrics';
import { useActivityLog } from '@/hooks/use-activity-log';
import {
  TrendingUp,
  Activity,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Calendar,
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorState } from '@/components/ErrorState';
import { PageTransition } from '@/components/PageTransition';
import { exportAnalytics } from '@/utils/export';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30');
  const startDate = format(subDays(new Date(), parseInt(dateRange)), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');

  const { data: overview, isLoading: metricsLoading, error: metricsError } = useAdminMetrics();
  const { apis, isLoading: apisLoading, error: apisError } = useApisAnalytics(startDate, endDate);
  const { activities, isLoading: activityLoading } = useActivityLog(100);

  // Calculate activity stats from activity log
  const activityStats = {
    userRegistrations: activities.filter((a) => a.type === 'user_registered').length,
    keysCreated: activities.filter((a) => a.type === 'key_created').length,
    keysRevoked: activities.filter((a) => a.type === 'key_revoked').length,
    apiRequests: activities.filter((a) => a.type === 'api_request').length,
  };

  const handleExport = () => {
    exportAnalytics({ apis, overview }, 'apis');
    toast.success('Analytics data exported successfully');
  };

  if (metricsError || apisError) {
    return (
      <ErrorBoundary>
        <div className="p-6">
          <ErrorState
            variant="network"
            message={metricsError || apisError}
            onRetry={() => window.location.reload()}
          />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <PageTransition>
        <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Detailed insights into platform usage and performance
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} disabled={apisLoading}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      {metricsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview?.totalRequests.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {overview?.activeUsers} active users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.successRate}%</div>
              <Progress value={overview?.successRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.avgResponseTime}ms</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all API calls
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview ? (100 - overview.successRate).toFixed(1) : 0}%
              </div>
              <Progress
                value={overview ? 100 - overview.successRate : 0}
                className="mt-2"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activity Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Overview</CardTitle>
          <CardDescription>Recent platform activity in last {dateRange} days</CardDescription>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User Registrations</p>
                  <p className="text-2xl font-bold">{activityStats.userRegistrations}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Keys Created</p>
                  <p className="text-2xl font-bold">{activityStats.keysCreated}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Keys Revoked</p>
                  <p className="text-2xl font-bold">{activityStats.keysRevoked}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">API Requests</p>
                  <p className="text-2xl font-bold">{activityStats.apiRequests}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Performance</CardTitle>
              <CardDescription>
                Performance metrics for all APIs in the last {dateRange} days
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {apisLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : apis.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No API data available for selected period
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
      </PageTransition>
    </ErrorBoundary>
  );
}
