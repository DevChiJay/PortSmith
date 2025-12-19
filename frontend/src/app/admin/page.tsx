'use client';

import { useAdminMetrics, useApisAnalytics } from '@/hooks/use-admin-metrics';
import { useActivityLog } from '@/hooks/use-activity-log';
import { Users, Key, TrendingUp, CheckCircle2, Activity, Plus, Settings } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/Dashboard';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useAdminMetrics();
  const { apis, isLoading: apisLoading } = useApisAnalytics();
  const { activities, isLoading: activitiesLoading } = useActivityLog(20);

  // Get top 5 APIs by request count
  const topApis = [...apis]
    .sort((a, b) => b.totalRequests - a.totalRequests)
    .slice(0, 5);

  if (metricsError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error loading admin metrics: {metricsError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Platform overview and system management
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/users">
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/manage-apis">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add API
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricsLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <MetricCard
              title="Total Users"
              value={metrics?.totalUsers || 0}
              icon={Users}
              description={`${metrics?.newUsers || 0} new this month`}
            />
            <MetricCard
              title="Total API Keys"
              value={metrics?.totalApiKeys || 0}
              icon={Key}
              description={`${metrics?.activeApiKeys || 0} active`}
            />
            <MetricCard
              title="Requests (30d)"
              value={metrics?.totalRequests || 0}
              icon={TrendingUp}
              description={`${metrics?.activeUsers || 0} active users`}
            />
            <MetricCard
              title="Success Rate"
              value={`${metrics?.successRate || 0}%`}
              icon={CheckCircle2}
              description={`${metrics?.avgResponseTime || 0}ms avg response`}
            />
          </>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top APIs Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top APIs</CardTitle>
                <CardDescription>Most requested APIs in the last 30 days</CardDescription>
              </div>
              <Link href="/admin/manage-apis">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {apisLoading ? (
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

        {/* Recent Activity Feed */}
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
            {activitiesLoading ? (
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
                {activities.slice(0, 10).map((activity, index) => (
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
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Platform health and performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="text-sm font-medium">Database</p>
                <p className="text-xs text-muted-foreground mt-1">MongoDB Atlas</p>
              </div>
              <Badge variant="default" className="bg-green-500">
                Operational
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="text-sm font-medium">API Gateway</p>
                <p className="text-xs text-muted-foreground mt-1">Request routing</p>
              </div>
              <Badge variant="default" className="bg-green-500">
                Operational
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="text-sm font-medium">Authentication</p>
                <p className="text-xs text-muted-foreground mt-1">JWT + OAuth</p>
              </div>
              <Badge variant="default" className="bg-green-500">
                Operational
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Link href="/admin/users" className="block">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Users className="h-4 w-4 mr-2" />
                View All Users
              </Button>
            </Link>
            <Link href="/admin/manage-apis" className="block">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Settings className="h-4 w-4 mr-2" />
                Manage APIs
              </Button>
            </Link>
            <Link href="/admin/analytics" className="block">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Activity className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
