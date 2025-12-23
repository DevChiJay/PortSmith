import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LucideIcon } from 'lucide-react';

interface ActivityStatItemProps {
  icon: LucideIcon;
  label: string;
  value: number;
  iconBgColor: string;
  iconColor: string;
}

function ActivityStatItem({ icon: Icon, label, value, iconBgColor, iconColor }: ActivityStatItemProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border p-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBgColor}`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

interface ActivityStatsProps {
  stats: {
    userRegistrations: number;
    keysCreated: number;
    keysRevoked: number;
    apiRequests: number;
  };
  dateRange: string;
  isLoading: boolean;
}

export function ActivityStats({ stats, dateRange, isLoading }: ActivityStatsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Overview</CardTitle>
          <CardDescription>Recent platform activity in last {dateRange} days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Overview</CardTitle>
        <CardDescription>Recent platform activity in last {dateRange} days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ActivityStatItem
            icon={require('lucide-react').TrendingUp}
            label="User Registrations"
            value={stats.userRegistrations}
            iconBgColor="bg-blue-100 dark:bg-blue-900"
            iconColor="text-blue-600 dark:text-blue-400"
          />
          <ActivityStatItem
            icon={require('lucide-react').CheckCircle}
            label="Keys Created"
            value={stats.keysCreated}
            iconBgColor="bg-green-100 dark:bg-green-900"
            iconColor="text-green-600 dark:text-green-400"
          />
          <ActivityStatItem
            icon={require('lucide-react').XCircle}
            label="Keys Revoked"
            value={stats.keysRevoked}
            iconBgColor="bg-red-100 dark:bg-red-900"
            iconColor="text-red-600 dark:text-red-400"
          />
          <ActivityStatItem
            icon={require('lucide-react').Activity}
            label="API Requests"
            value={stats.apiRequests}
            iconBgColor="bg-purple-100 dark:bg-purple-900"
            iconColor="text-purple-600 dark:text-purple-400"
          />
        </div>
      </CardContent>
    </Card>
  );
}
