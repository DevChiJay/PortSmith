'use client';

import { useUser } from '@/hooks/use-user';
import { useDashboardMetrics, useDashboardTimeline } from '@/hooks';
import { useApiData } from '@/hooks/use-api-data';
import { Activity, Key, TrendingUp, CheckCircle2, Plus, BookOpen, Search } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { staggerContainer } from '@/utils/animations';

import { Button } from '@/components/ui/button';
import {
  DashboardLayout,
  DashboardHeader,
  DashboardGrid,
  DashboardSection,
  AnimatedMetricCard,
  LineChart,
  ChartContainer,
} from '@/components/Dashboard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorState } from '@/components/ErrorState';
import { PageTransition } from '@/components/PageTransition';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
        <DashboardGrid cols={4}>
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
        </DashboardGrid>
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
          <Card>
            <CardContent className="pt-6">
              {keysLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : keysData?.keys && keysData.keys.length > 0 ? (
                <div className="space-y-4">
                  {keysData.keys.slice(0, 5).map((key: any) => (
                    <div key={key.id} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{key.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {key.apiName} • Created {format(new Date(key.createdAt), 'MMM d')}
                        </p>
                      </div>
                      <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                        {key.status}
                      </Badge>
                    </div>
                  ))}
                  <Link href="/dashboard/my-keys">
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      View All Keys
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Key className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">No API keys yet</p>
                  <Link href="/dashboard/my-keys">
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Key
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </DashboardSection>

        {/* Quick Actions */}
        <DashboardSection title="Quick Actions" description="Common tasks and shortcuts">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Link href="/dashboard/my-keys" className="block">
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New API Key
                  </Button>
                </Link>
                <Link href="/dashboard/available-apis" className="block">
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <Search className="h-4 w-4 mr-2" />
                    Browse Available APIs
                  </Button>
                </Link>
                <Link href="/dashboard/docs" className="block">
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Documentation
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
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
