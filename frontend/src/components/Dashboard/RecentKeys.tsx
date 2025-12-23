import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Plus } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface RecentKeysProps {
  keys: any[];
  isLoading: boolean;
}

export function RecentKeys({ keys, isLoading }: RecentKeysProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
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
        </CardContent>
      </Card>
    );
  }

  if (!keys || keys.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {keys.slice(0, 5).map((key: any) => (
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
      </CardContent>
    </Card>
  );
}
