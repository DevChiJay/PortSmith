'use client';

import { useAdminMetrics, useApisAnalytics } from '@/hooks/use-admin-metrics';
import { useActivityLog } from '@/hooks/use-activity-log';
import { Users, Key, TrendingUp, CheckCircle2, Activity, Plus, Settings, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StatCard } from '@/components/Admin/StatCard';
import { TopApis } from '@/components/Admin/TopApis';
import { RecentActivity } from '@/components/Admin/RecentActivity';
import { SystemStatus } from '@/components/Admin/SystemStatus';
import { QuickActions } from '@/components/Admin/QuickActions';

export default function AdminDashboard() {
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useAdminMetrics();
  const { apis, isLoading: apisLoading } = useApisAnalytics();
  const { activities, isLoading: activitiesLoading } = useActivityLog(20);

  const quickActions = [
    { label: 'View All Users', icon: Users, href: '/admin/users' },
    { label: 'Manage APIs', icon: Settings, href: '/admin/manage-apis' },
    { label: 'View Analytics', icon: Activity, href: '/admin/analytics' },
  ];

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
          <p className="text-muted-foreground mt-1">Platform overview and system management</p>
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
        <StatCard
          title="Total Users"
          value={metrics?.totalUsers || 0}
          icon={Users}
          description={`${metrics?.newUsers || 0} new this month`}
          isLoading={metricsLoading}
        />
        <StatCard
          title="Total API Keys"
          value={metrics?.totalApiKeys || 0}
          icon={Key}
          description={`${metrics?.activeApiKeys || 0} active`}
          isLoading={metricsLoading}
        />
        <StatCard
          title="Requests (30d)"
          value={metrics?.totalRequests || 0}
          icon={TrendingUp}
          description={`${metrics?.activeUsers || 0} active users`}
          isLoading={metricsLoading}
        />
        <StatCard
          title="Success Rate"
          value={`${metrics?.successRate || 0}%`}
          icon={CheckCircle2}
          description={`${metrics?.avgResponseTime || 0}ms avg response`}
          isLoading={metricsLoading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TopApis apis={apis} isLoading={apisLoading} />
        <RecentActivity activities={activities} isLoading={activitiesLoading} />
      </div>

      <SystemStatus />
      <QuickActions actions={quickActions} />
    </div>
  );
}
