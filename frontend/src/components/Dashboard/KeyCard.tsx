import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp, Eye, Copy, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { ApiKey, StatusBadgeVariant } from '@/app/(portal)/dashboard/types';

interface KeyCardProps {
  apiKey: ApiKey;
  onViewDetails: (key: ApiKey) => void;
  onCopyKey: (keyValue: string, keyName: string) => void;
  onRevoke: (key: ApiKey) => void;
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

export function KeyCard({ apiKey, onViewDetails, onCopyKey, onRevoke }: KeyCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{apiKey.name}</CardTitle>
            <CardDescription className="mt-1">
              {apiKey.apiName || 'Unknown API'}
            </CardDescription>
          </div>
          <Badge variant={getStatusVariant(apiKey.status)} className="ml-2">
            {apiKey.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Usage Stats */}
        {apiKey.usage && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Total Requests</p>
              <p className="font-semibold">{apiKey.usage.totalRequests || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Success Rate</p>
              <p className="font-semibold">{apiKey.usage.successRate || 0}%</p>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>Created {format(new Date(apiKey.createdAt), 'MMM d, yyyy')}</span>
          </div>
          {apiKey.lastUsed && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3" />
              <span>Last used {format(new Date(apiKey.lastUsed), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onViewDetails(apiKey)}
          >
            <Eye className="h-3 w-3 mr-1" />
            Details
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCopyKey(apiKey.key || '', apiKey.name)}
            disabled={apiKey.status !== 'active' || !apiKey.key}
            title={!apiKey.key ? 'Key value not available for security' : 'Copy API key'}
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
          {apiKey.status === 'active' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRevoke(apiKey)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
