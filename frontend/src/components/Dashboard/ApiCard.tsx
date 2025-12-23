import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Key, Plus } from 'lucide-react';
import Link from 'next/link';
import type { ApiInfo, StatusBadgeVariant } from '@/app/(portal)/dashboard/types';

interface ApiCardProps {
  api: ApiInfo;
  userKeyCount: number;
  onViewDocs: (api: ApiInfo) => void;
  onCreateKey: (api: ApiInfo) => void;
}

const getStatusBadgeVariant = (status: string): StatusBadgeVariant => {
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

export function ApiCard({ api, userKeyCount, onViewDocs, onCreateKey }: ApiCardProps) {
  const hasKeys = userKeyCount > 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
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
            onClick={() => onViewDocs(api)}
          >
            <BookOpen className="h-3 w-3 mr-1" />
            View Docs
          </Button>
          {api.status === 'active' && (
            <Button size="sm" onClick={() => onCreateKey(api)}>
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
}
