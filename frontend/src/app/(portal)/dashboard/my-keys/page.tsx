'use client';

import { useState, useMemo } from 'react';
import { useApiData } from '@/hooks/use-api-data';
import { useUser } from '@/hooks/use-user';
import { Plus, Search, Filter, Key, Copy, Eye, Calendar, TrendingUp, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

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
import { RevokeKeyDialog } from '@/components/Dashboard/RevokeKeyDialog';

interface ApiKey {
  id: string;
  name: string;
  key?: string;
  apiId: string;
  apiName: string;
  status: 'active' | 'inactive' | 'revoked';
  permissions: string[];
  rateLimit?: {
    requests: number;
    per: number;
  };
  expiresAt?: string;
  createdAt: string;
  lastUsed?: string;
  usage?: {
    totalRequests: number;
    last7Days: number;
    last30Days: number;
    successRate: number;
    avgResponseTime: number;
    trend: Array<{ date: string; requests: number }>;
  };
}

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
  const availableApis = apisData?.apis || [];

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

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
      case 'active':
        return 'default';
      case 'revoked':
        return 'destructive';
      case 'inactive':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error loading API keys: {error.message}</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardHeader
        title="My API Keys"
        description="Manage and monitor your API keys"
        action={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Key
          </Button>
        }
      />

      {/* Filters Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by key name or API..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={apiFilter} onValueChange={setApiFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by API" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All APIs</SelectItem>
                {availableApis.map((api) => (
                  <SelectItem key={api.id || api._id} value={api.id || api._id}>
                    {api.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Key className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || statusFilter !== 'all' || apiFilter !== 'all'
                  ? 'No keys found'
                  : 'No API keys yet'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                {searchQuery || statusFilter !== 'all' || apiFilter !== 'all'
                  ? 'Try adjusting your filters or search query'
                  : 'Create your first API key to start using our services'}
              </p>
              {!searchQuery && statusFilter === 'all' && apiFilter === 'all' && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Key
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paginatedKeys.map((key) => (
                <Card key={key.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{key.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {key.apiName || 'Unknown API'}
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusVariant(key.status)} className="ml-2">
                        {key.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Usage Stats */}
                    {key.usage && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Total Requests</p>
                          <p className="font-semibold">{key.usage.totalRequests || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Success Rate</p>
                          <p className="font-semibold">{key.usage.successRate || 0}%</p>
                        </div>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>Created {format(new Date(key.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                      {key.lastUsed && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3 w-3" />
                          <span>Last used {format(new Date(key.lastUsed), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleViewDetails(key)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyKey(key.key || '', key.name)}
                        disabled={key.status !== 'active' || !key.key}
                        title={!key.key ? 'Key value not available for security' : 'Copy API key'}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      {key.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRevokeKey(key)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </DashboardSection>

      {/* Key Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedKey?.name}</DialogTitle>
            <DialogDescription>
              Detailed information and usage statistics
            </DialogDescription>
          </DialogHeader>
          {selectedKey && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">API</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedKey.apiName || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Status</p>
                  <Badge variant={getStatusVariant(selectedKey.status)}>
                    {selectedKey.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedKey.createdAt), 'PPP')}
                  </p>
                </div>
                {selectedKey.expiresAt && (
                  <div>
                    <p className="text-sm font-medium mb-1">Expires</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedKey.expiresAt), 'PPP')}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Permissions</p>
                <div className="flex gap-2">
                  {selectedKey.permissions?.map((permission) => (
                    <Badge key={permission} variant="secondary">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedKey.key && (
                <div>
                  <p className="text-sm font-medium mb-2">API Key</p>
                  <div className="flex items-center gap-2">
                    <Input
                      value={selectedKey.key}
                      readOnly
                      type="password"
                      className="font-mono text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyKey(selectedKey.key || '', selectedKey.name)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {selectedKey.usage && (
                <div>
                  <p className="text-sm font-medium mb-2">Usage Statistics</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardDescription>Total Requests</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {selectedKey.usage.totalRequests || 0}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardDescription>Success Rate</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {selectedKey.usage.successRate || 0}%
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardDescription>Last 7 Days</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {selectedKey.usage.last7Days || 0}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardDescription>Avg Response Time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {selectedKey.usage.avgResponseTime || 0}ms
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {selectedKey.lastUsed && (
                <div>
                  <p className="text-sm font-medium mb-1">Last Used</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedKey.lastUsed), 'PPP')}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

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
  );
}
