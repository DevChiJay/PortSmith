import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Copy } from 'lucide-react';
import { format } from 'date-fns';
import type { ApiKey, StatusBadgeVariant } from '@/app/(portal)/dashboard/types';

interface KeyDetailsModalProps {
  apiKey: ApiKey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCopyKey: (keyValue: string, keyName: string) => void;
}

const getStatusVariant = (status: string): StatusBadgeVariant => {
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

export function KeyDetailsModal({ apiKey, open, onOpenChange, onCopyKey }: KeyDetailsModalProps) {
  if (!apiKey) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{apiKey.name}</DialogTitle>
          <DialogDescription>
            Detailed information and usage statistics
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">API</p>
              <p className="text-sm text-muted-foreground">
                {apiKey.apiName || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Status</p>
              <Badge variant={getStatusVariant(apiKey.status)}>
                {apiKey.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Created</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(apiKey.createdAt), 'PPP')}
              </p>
            </div>
            {apiKey.expiresAt && (
              <div>
                <p className="text-sm font-medium mb-1">Expires</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(apiKey.expiresAt), 'PPP')}
                </p>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Permissions</p>
            <div className="flex gap-2">
              {apiKey.permissions?.map((permission) => (
                <Badge key={permission} variant="secondary">
                  {permission}
                </Badge>
              ))}
            </div>
          </div>

          {apiKey.key && (
            <div>
              <p className="text-sm font-medium mb-2">API Key</p>
              <div className="flex items-center gap-2">
                <Input
                  value={apiKey.key}
                  readOnly
                  type="password"
                  className="font-mono text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCopyKey(apiKey.key || '', apiKey.name)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {apiKey.usage && (
            <div>
              <p className="text-sm font-medium mb-2">Usage Statistics</p>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total Requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {apiKey.usage.totalRequests || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Success Rate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {apiKey.usage.successRate || 0}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Last 7 Days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {apiKey.usage.last7Days || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Avg Response Time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {apiKey.usage.avgResponseTime || 0}ms
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {apiKey.lastUsed && (
            <div>
              <p className="text-sm font-medium mb-1">Last Used</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(apiKey.lastUsed), 'PPP')}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
