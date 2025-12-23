'use client';

import { useState } from 'react';
import { useAdminMetrics, useApisAnalytics } from '@/hooks/use-admin-metrics';
import { useActivityLog } from '@/hooks/use-activity-log';
import { Activity, Clock, CheckCircle, XCircle, Download, Calendar } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorState } from '@/components/ErrorState';
import { PageTransition } from '@/components/PageTransition';
import { exportAnalytics } from '@/utils/export';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/admin/StatCard';
import { ActivityStats } from '@/components/admin/ActivityStats';
import { ApiPerformance } from '@/components/admin/ApiPerformance';

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30');
  const startDate = format(subDays(new Date(), parseInt(dateRange)), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');

  const { data: overview, isLoading: metricsLoading, error: metricsError } = useAdminMetrics();
  const { apis, isLoading: apisLoading, error: apisError } = useApisAnalytics(startDate, endDate);
  const { activities, isLoading: activityLoading } = useActivityLog(100);

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

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Requests"
              value={overview?.totalRequests.toLocaleString() || '0'}
              icon={Activity}
              description={`${overview?.activeUsers || 0} active users`}
              isLoading={metricsLoading}
            />
            <StatCard
              title="Success Rate"
              value={`${overview?.successRate || 0}%`}
              icon={CheckCircle}
              isLoading={metricsLoading}
            />
            <StatCard
              title="Avg Response Time"
              value={`${overview?.avgResponseTime || 0}ms`}
              icon={Clock}
              description="Across all API calls"
              isLoading={metricsLoading}
            />
            <StatCard
              title="Error Rate"
              value={`${overview ? (100 - overview.successRate).toFixed(1) : 0}%`}
              icon={XCircle}
              isLoading={metricsLoading}
            />
          </div>

          <ActivityStats stats={activityStats} dateRange={dateRange} isLoading={activityLoading} />
          <ApiPerformance apis={apis} dateRange={dateRange} isLoading={apisLoading} />
        </div>
      </PageTransition>
    </ErrorBoundary>
  );
}
