'use client';

import { useState } from 'react';
import { useApisAnalytics } from '@/hooks/use-admin-metrics';
import { useApiData } from '@/hooks/use-api-data';
import { Plus, MoreVertical, Key, Activity, Users, TrendingUp, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/SearchBar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorState } from '@/components/ErrorState';
import { PageTransition } from '@/components/PageTransition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddApiDialog } from '@/components/admin/AddApiDialog';
import { EditApiDialog } from '@/components/admin/EditApiDialog';
import { DeleteApiDialog } from '@/components/admin/DeleteApiDialog';
import { mutate } from 'swr';

interface Api {
  id: string;
  name: string;
  slug: string;
  description: string;
  baseUrl?: string;
  documentation?: string;
}

interface ApisResponse {
  apis: Api[];
}

export default function ManageApisPage() {
  const [search, setSearch] = useState('');
  const { apis: analyticsApis, isLoading: analyticsLoading, error: analyticsError } = useApisAnalytics();
  const { data: catalogData, isLoading: catalogLoading, error: catalogError } = useApiData<ApisResponse>({
    endpoint: '/api/apis',
    method: 'GET',
  });

  const catalogApis = catalogData?.apis || [];

  const refreshData = () => {
    mutate('/api/apis');
    mutate('/api/admin/analytics/apis');
  };

  // Merge catalog data with analytics
  const apisWithAnalytics = catalogApis.map((api) => {
    const analytics = analyticsApis.find((a) => a.id === api.id);
    return {
      ...api,
      analytics,
    };
  });

  const filteredApis = apisWithAnalytics?.filter((api) =>
    api.name.toLowerCase().includes(search.toLowerCase()) ||
    api.slug.toLowerCase().includes(search.toLowerCase())
  );

  if (catalogError || analyticsError) {
    return (
      <ErrorBoundary>
        <div className="p-6">
          <ErrorState
            variant="network"
            message={catalogError?.message || analyticsError}
            onRetry={refreshData}
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
              <h1 className="text-3xl font-bold tracking-tight">Manage APIs</h1>
              <p className="text-muted-foreground mt-1">
                Configure and monitor API endpoints
              </p>
            </div>
            <AddApiDialog onSuccess={refreshData} />
          </div>

          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search APIs by name or slug..."
              />
            </CardContent>
          </Card>

      {/* APIs Grid */}
      {catalogLoading || analyticsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredApis?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No APIs found
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredApis?.map((api) => (
            <Card key={api.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{api.name}</CardTitle>
                    <CardDescription>/{api.slug}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <EditApiDialog
                        api={api}
                        onSuccess={refreshData}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit API
                          </DropdownMenuItem>
                        }
                      />
                      <DeleteApiDialog
                        apiId={api.id}
                        apiName={api.name}
                        onSuccess={refreshData}
                        trigger={
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete API
                          </DropdownMenuItem>
                        }
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Badge variant="default" className="w-fit">
                  Active
                </Badge>
              </CardHeader>
              <CardContent>
                {api.analytics ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                        <Key className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Keys</p>
                        <p className="text-sm font-semibold">
                          {api.analytics.activeKeys}/{api.analytics.totalKeys}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Requests</p>
                        <p className="text-sm font-semibold">
                          {api.analytics.totalRequests.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                        <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Users</p>
                        <p className="text-sm font-semibold">{api.analytics.uniqueUsers}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                        <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Success</p>
                        <p className="text-sm font-semibold">{api.analytics.successRate}%</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No analytics data available
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
      </PageTransition>
    </ErrorBoundary>
  );
}