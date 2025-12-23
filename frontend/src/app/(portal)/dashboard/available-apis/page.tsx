'use client';

import { useState, useMemo } from 'react';
import { useApiData } from '@/hooks/use-api-data';
import { useUser } from '@/hooks/use-user';
import { Search } from 'lucide-react';

import {
  DashboardLayout,
  DashboardHeader,
  DashboardSection,
} from '@/components/Dashboard';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { CreateKeyDialog } from '@/components/Dashboard/CreateKeyDialog';
import { ApiCard } from '@/components/Dashboard/ApiCard';
import { ApiDetailsModal } from '@/components/Dashboard/ApiDetailsModal';
import { ApiSearchFilters } from '@/components/Dashboard/ApiSearchFilters';
import { EmptyState } from '@/components/Dashboard/EmptyState';
import type { ApiInfo, SortBy } from '../types';

export default function AvailableApisPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [selectedApi, setSelectedApi] = useState<ApiInfo | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [createKeyApi, setCreateKeyApi] = useState<ApiInfo | null>(null);

  const { data: apisData, isLoading, error, refetch } = useApiData<{ apis: ApiInfo[] }>({
    endpoint: '/api/apis',
    method: 'GET',
    dependencies: [user?.id],
  });

  const { data: keysData } = useApiData<{ keys: any[] }>({
    endpoint: '/api/keys',
    dependencies: [user?.id],
  });

  const apis = apisData?.apis || [];
  const userKeys = keysData?.keys || [];

  // Construct gateway base URL for APIs
  const getGatewayUrl = (slug: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:5001';
    return `${apiUrl}/${slug}/`;
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(apis.map((api) => api.category).filter(Boolean));
    return Array.from(cats);
  }, [apis]);

  // Filter and search logic
  const filteredApis = useMemo(() => {
    let filtered = apis.filter((api) => {
      const matchesSearch =
        api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || api.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'popular':
          return (b.user_key_count || 0) - (a.user_key_count || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [apis, searchQuery, categoryFilter, sortBy]);

  const getUserKeyCount = (apiId: string) => {
    return userKeys.filter((key) => {
      const keyApiId = typeof key.apiId === 'object' ? key.apiId.id : key.apiId;
      return keyApiId === apiId;
    }).length;
  };

  const handleViewDocs = (api: ApiInfo) => {
    setSelectedApi(api);
    setShowDetails(true);
  };

  const handleCreateKey = (api: ApiInfo) => {
    setCreateKeyApi(api);
  };

  if (error) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error loading APIs: {error.message}</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Available APIs"
        description="Browse and connect to available API services"
      />

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <ApiSearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            categories={categories}
          />
        </CardContent>
      </Card>

      {/* APIs Grid */}
      <DashboardSection
        title={`${filteredApis.length} ${filteredApis.length === 1 ? 'API' : 'APIs'}`}
        description="Click on an API to view documentation and create keys"
      >
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredApis.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No APIs found"
            description={searchQuery || categoryFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No APIs are currently available'}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredApis.map((api) => (
              <ApiCard
                key={api.id}
                api={api}
                userKeyCount={getUserKeyCount(api.id)}
                onViewDocs={handleViewDocs}
                onCreateKey={handleCreateKey}
              />
            ))}
          </div>
        )}
      </DashboardSection>

      {/* API Details Modal */}
      <ApiDetailsModal
        api={selectedApi}
        open={showDetails}
        onOpenChange={setShowDetails}
        onCreateKey={handleCreateKey}
        getGatewayUrl={getGatewayUrl}
      />

      {/* Create Key Dialog */}
      {createKeyApi && (
        <CreateKeyDialog
          open={!!createKeyApi}
          onOpenChange={(open) => !open && setCreateKeyApi(null)}
          preSelectedApiId={createKeyApi.id}
          onSuccess={() => {
            refetch();
            setCreateKeyApi(null);
          }}
        />
      )}
    </DashboardLayout>
  );
}

