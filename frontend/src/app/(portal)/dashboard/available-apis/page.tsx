'use client';

import { useState, useMemo } from 'react';
import { useApiData } from '@/hooks/use-api-data';
import { useUser } from '@/hooks/use-user';
import { Search, Plus, BookOpen, Key, ExternalLink, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

import {
  DashboardLayout,
  DashboardHeader,
  DashboardSection,
} from '@/components/Dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { CreateKeyDialog } from '@/components/Dashboard/CreateKeyDialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ApiInfo {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: 'active' | 'inactive' | 'beta';
  category?: string;
  base_url?: string;
  baseUrl?: string;
  documentation_url?: string;
  endpoints?: Array<{
    path: string;
    method: string;
    description: string;
  }>;
  rate_limit?: {
    requests_per_minute?: number;
    requests_per_day?: number;
  };
  user_key_count?: number;
  createdAt?: string;
}

export default function AvailableApisPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'newest' | 'popular'>('name');
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return `${apiUrl}/gateway/${slug}/`;
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

  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'outline' => {
    switch (status) {
      case 'active':
        return 'default';
      case 'beta':
        return 'secondary';
      case 'inactive':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleViewDocs = (api: ApiInfo) => {
    setSelectedApi(api);
    setShowDetails(true);
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search APIs by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat as string}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Alphabetical</SelectItem>
                <SelectItem value="newest">Recently Added</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No APIs found</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                {searchQuery || categoryFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No APIs are currently available'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredApis.map((api) => {
              const userKeyCount = getUserKeyCount(api.id);
              const hasKeys = userKeyCount > 0;

              return (
                <Card key={api.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg truncate">{api.name}</CardTitle>
                          {!hasKeys && api.status === 'active' && (
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          )}
                        </div>
                        <CardDescription className="line-clamp-2">
                          {api.description || 'No description available'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant={getStatusBadgeVariant(api.status)}>
                        {api.status}
                      </Badge>
                      {api.category && (
                        <span className="text-xs text-muted-foreground">{api.category}</span>
                      )}
                    </div>

                    {hasKeys && (
                      <div className="flex items-center gap-2 text-sm">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {userKeyCount} {userKeyCount === 1 ? 'key' : 'keys'} active
                        </span>
                      </div>
                    )}

                    {api.rate_limit && (
                      <div className="text-xs text-muted-foreground">
                        Rate Limit: {api.rate_limit.requests_per_minute || api.rate_limit.requests_per_day} requests
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleViewDocs(api)}
                      >
                        <BookOpen className="h-3 w-3 mr-1" />
                        View Docs
                      </Button>
                      {api.status === 'active' && (
                        <Button
                          size="sm"
                          onClick={() => setCreateKeyApi(api)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Create Key
                        </Button>
                      )}
                      {hasKeys && (
                        <Link href="/dashboard/my-keys">
                          <Button size="sm" variant="outline">
                            <Key className="h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </DashboardSection>

      {/* API Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedApi?.name}
              <Badge variant={getStatusBadgeVariant(selectedApi?.status || 'active')}>
                {selectedApi?.status}
              </Badge>
            </DialogTitle>
            <DialogDescription>{selectedApi?.description}</DialogDescription>
          </DialogHeader>
          {selectedApi && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">API Information</h4>
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Gateway Base URL</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-x-auto">
                          {getGatewayUrl(selectedApi.slug)}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(getGatewayUrl(selectedApi.slug));
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Use this URL with your API key in the Authorization header
                      </p>
                    </div>
                    {selectedApi.category && (
                      <div>
                        <p className="text-muted-foreground mb-1">Category</p>
                        <p>{selectedApi.category}</p>
                      </div>
                    )}
                    {selectedApi.rate_limit && (
                      <div>
                        <p className="text-muted-foreground mb-1">Rate Limits</p>
                        <p>
                          {selectedApi.rate_limit.requests_per_minute && `${selectedApi.rate_limit.requests_per_minute}/min`}
                          {selectedApi.rate_limit.requests_per_day && ` • ${selectedApi.rate_limit.requests_per_day}/day`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Endpoints */}
                {selectedApi.endpoints && selectedApi.endpoints.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Available Endpoints</h4>
                    <div className="space-y-2">
                      {selectedApi.endpoints.map((endpoint, idx) => (
                        <Card key={idx}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Badge variant="outline" className="mt-0.5">
                                {endpoint.method}
                              </Badge>
                              <div className="flex-1">
                                <code className="text-xs">{endpoint.path}</code>
                                {endpoint.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {endpoint.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  {selectedApi.documentation_url && (
                    <Button variant="outline" asChild>
                      <a href={selectedApi.documentation_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        External Documentation
                      </a>
                    </Button>
                  )}
                  {selectedApi.status === 'active' && (
                    <Button
                      onClick={() => {
                        setCreateKeyApi(selectedApi);
                        setShowDetails(false);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create API Key
                    </Button>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

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

