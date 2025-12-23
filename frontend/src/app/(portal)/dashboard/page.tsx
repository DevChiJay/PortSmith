'use client';

import { useUser } from '@/hooks/use-user';
import { useDashboardMetrics, useDashboardTimeline } from '@/hooks';
import { useApiData } from '@/hooks/use-api-data';
import { Activity, Key, TrendingUp, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { staggerContainer } from '@/utils/animations';

import {
  DashboardLayout,
  DashboardHeader,
  DashboardSection,
  AnimatedMetricCard,
  LineChart,
  ChartContainer,
} from '@/components/Dashboard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorState } from '@/components/ErrorState';
import { PageTransition } from '@/components/PageTransition';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RecentKeys } from '@/components/Dashboard/RecentKeys';
import { QuickActions } from '@/components/Dashboard/QuickActions';

export default function Dashboard() {
  const { user } = useUser();
  const { data: metrics, isLoading: metricsLoading, error: metricsError, refresh } = useDashboardMetrics();
  const { timeline, isLoading: timelineLoading, error: timelineError } = useDashboardTimeline();
  
  // Fetch user's API keys
  const { data: keysData, isLoading: keysLoading } = useApiData<{ keys: any[] }>({
    endpoint: '/api/keys',
    dependencies: [user?.id],
  });

  const firstName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Developer';
  const memberSince = user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'recently';

  return (
    <ErrorBoundary>
      <PageTransition>
        <DashboardLayout>
      {/* Welcome Section */}
      <DashboardHeader
        title={`Welcome back, ${firstName}!`}
        description={`Member since ${memberSince}`}
      />

      {/* Metrics Row */}
      {metricsError ? (
        <ErrorState
          variant="network"
          message="Unable to load dashboard metrics"
          onRetry={() => refresh()}
        />
      ) : metricsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        </div>
      ) : (
        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <AnimatedMetricCard
            title="Total API Keys"
            value={metrics?.overview?.totalKeys || 0}
            icon={Key}
          />
          <AnimatedMetricCard
            title="Active Keys"
            value={metrics?.overview?.activeKeys || 0}
            icon={Activity}
          />
          <AnimatedMetricCard
            title="Requests (30d)"
            value={metrics?.overview?.totalRequests || 0}
            icon={TrendingUp}
          />
          <AnimatedMetricCard
            title="Success Rate"
            value={`${metrics?.overview?.successRate || 0}%`}
            icon={CheckCircle2}
          />
        </motion.div>
      )}
      

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent API Keys */}
        <DashboardSection title="Recent API Keys" description="Your most recently created keys">
          <RecentKeys keys={keysData?.keys} isLoading={keysLoading} />
        </DashboardSection>

        {/* Quick Actions */}
        <DashboardSection title="Quick Actions" description="Common tasks and shortcuts">
          <QuickActions />
        </DashboardSection>
      </div>

      {/* Usage Chart Section */}
      <DashboardSection
        title="Usage Overview"
        description="Daily API requests over the last 30 days"
      >
        <ChartContainer 
          title="API Requests Timeline"
          loading={timelineLoading} 
          error={timelineError ? 'Failed to load chart data' : undefined}
        >
          {timeline && timeline.length > 0 ? (
            <LineChart
              data={timeline}
              xAxisKey="date"
              lines={[
                { dataKey: 'totalRequests', name: 'Requests', color: 'hsl(var(--primary))' },
              ]}
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <p>No usage data available yet</p>
            </div>
          )}
        </ChartContainer>
      </DashboardSection>
    </DashboardLayout>
      </PageTransition>
    </ErrorBoundary>
  );
}
