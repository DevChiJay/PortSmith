'use client';

import { useState, useMemo } from 'react';
import { useApiData } from '@/hooks/use-api-data';
import { useUser } from '@/hooks/use-user';
import { Plus, Download, Key } from 'lucide-react';
import { toast } from 'sonner';

import {
  DashboardLayout,
  DashboardHeader,
  DashboardSection,
} from '@/components/Dashboard';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorState } from '@/components/ErrorState';
import { PageTransition } from '@/components/PageTransition';
import { exportApiKeys } from '@/utils/export';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateKeyDialog } from '@/components/Dashboard/CreateKeyDialog';
import { RevokeKeyDialog } from '@/components/Dashboard/RevokeKeyDialog';
import { KeyCard } from '@/components/Dashboard/KeyCard';
import { KeyDetailsModal } from '@/components/Dashboard/KeyDetailsModal';
import { KeyFilters } from '@/components/Dashboard/KeyFilters';
import { EmptyState } from '@/components/Dashboard/EmptyState';
import { Pagination } from '@/components/Dashboard/Pagination';
import type { ApiKey, ActiveFilter, ApiInfo } from '../types';

export default function MyApiKeysPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [apiFilter, setApiFilter] = useState<string>('all');
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [revokeKey, setRevokeKey] = useState<ApiKey | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useApiData<{ keys: ApiKey[] }>({
    endpoint: '/api/keys',
    dependencies: [user?.id],
  });

  const {
    data: apisData,
    isLoading: apisLoading,
  } = useApiData<{ apis: any[] }>({
    endpoint: '/api/apis',
    dependencies: [user?.id],
  });

  const apiKeys = data?.keys || [];
  const availableApis = (apisData?.apis || []) as ApiInfo[];

  // Build active filters for FilterChips
  const activeFilters: ActiveFilter[] = useMemo(() => {
    const filters: ActiveFilter[] = [];
    if (statusFilter && statusFilter !== 'all') {
      filters.push({ key: 'status', label: 'Status', value: statusFilter });
    }
    if (apiFilter && apiFilter !== 'all') {
      const apiName = availableApis.find(api => api.id === apiFilter)?.name || apiFilter;
      filters.push({ key: 'api', label: 'API', value: apiName });
    }
    return filters;
  }, [statusFilter, apiFilter, availableApis]);

  const removeFilter = (key: string) => {
    if (key === 'status') setStatusFilter('all');
    if (key === 'api') setApiFilter('all');
  };

  const clearAllFilters = () => {
    setStatusFilter('all');
    setApiFilter('all');
    setSearchQuery('');
  };

  const handleExport = () => {
    exportApiKeys(filteredKeys);
    toast.success('API keys exported successfully');
  };

  // Filter and search logic
  const filteredKeys = useMemo(() => {
    return apiKeys.filter((key) => {
      const matchesSearch =
        key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        key.apiName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || key.status === statusFilter;
      const matchesApi = apiFilter === 'all' || key.apiId === apiFilter;
      return matchesSearch && matchesStatus && matchesApi;
    });
  }, [apiKeys, searchQuery, statusFilter, apiFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredKeys.length / perPage);
  const paginatedKeys = filteredKeys.slice((page - 1) * perPage, page * perPage);

  const handleCopyKey = (keyValue: string, keyName: string) => {
    navigator.clipboard.writeText(keyValue);
    toast.success(`API key "${keyName}" copied to clipboard`);
  };

  const handleViewDetails = (key: ApiKey) => {
    setSelectedKey(key);
    setShowDetails(true);
  };

  const handleRevoke = (key: ApiKey) => {
    setRevokeKey(key);
  };

  if (error) {
    return (
      <ErrorBoundary>
        <DashboardLayout>
          <ErrorState
            variant="network"
            message={error.message}
            onRetry={refetch}
          />
        </DashboardLayout>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <PageTransition>
        <DashboardLayout>
      <DashboardHeader
        title="My API Keys"
        description="Manage and monitor your API keys"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={filteredKeys.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Key
            </Button>
          </div>
        }
      />

      {/* Filters Section */}
      <Card>
        <CardContent className="pt-6">
          <KeyFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            apiFilter={apiFilter}
            onApiChange={setApiFilter}
            availableApis={availableApis}
            activeFilters={activeFilters}
            onRemoveFilter={removeFilter}
            onClearAll={clearAllFilters}
          />
        </CardContent>
      </Card>

      {/* Keys Grid */}
      <DashboardSection
        title={`${filteredKeys.length} ${filteredKeys.length === 1 ? 'Key' : 'Keys'}`}
        description="Click on a key to view details and usage statistics"
      >
        {isLoading || apisLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : paginatedKeys.length === 0 ? (
          <EmptyState
            icon={Key}
            title={searchQuery || statusFilter !== 'all' || apiFilter !== 'all' ? 'No keys found' : 'No API keys yet'}
            description={searchQuery || statusFilter !== 'all' || apiFilter !== 'all'
              ? 'Try adjusting your filters or search query'
              : 'Create your first API key to start using our services'}
            actionLabel={!searchQuery && statusFilter === 'all' && apiFilter === 'all' ? 'Create Your First Key' : undefined}
            onAction={!searchQuery && statusFilter === 'all' && apiFilter === 'all' ? () => setCreateDialogOpen(true) : undefined}
          />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paginatedKeys.map((key) => (
                <KeyCard
                  key={key.id}
                  apiKey={key}
                  onViewDetails={handleViewDetails}
                  onCopyKey={handleCopyKey}
                  onRevoke={handleRevoke}
                />
              ))}
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </DashboardSection>

      {/* Key Details Modal */}
      <KeyDetailsModal
        apiKey={selectedKey}
        open={showDetails}
        onOpenChange={setShowDetails}
        onCopyKey={handleCopyKey}
      />

      {/* Create Key Dialog */}
      {createDialogOpen && (
        <CreateKeyDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={() => {
            refetch();
            setCreateDialogOpen(false);
          }}
        />
      )}

      {/* Revoke Key Dialog */}
      {revokeKey && (
        <RevokeKeyDialog
          open={!!revokeKey}
          onOpenChange={(open) => !open && setRevokeKey(null)}
          apiKey={revokeKey}
          onSuccess={() => {
            refetch();
            setRevokeKey(null);
          }}
        />
      )}
    </DashboardLayout>
      </PageTransition>
    </ErrorBoundary>
  );
}
