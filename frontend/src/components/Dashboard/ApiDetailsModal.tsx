import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Plus } from 'lucide-react';
import type { ApiInfo, StatusBadgeVariant } from '@/app/(portal)/dashboard/types';

interface ApiDetailsModalProps {
  api: ApiInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateKey: (api: ApiInfo) => void;
  getGatewayUrl: (slug: string) => string;
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

export function ApiDetailsModal({ api, open, onOpenChange, onCreateKey, getGatewayUrl }: ApiDetailsModalProps) {
  if (!api) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {api.name}
            <Badge variant={getStatusBadgeVariant(api.status)}>
              {api.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>{api.description}</DialogDescription>
        </DialogHeader>
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
                      {getGatewayUrl(api.slug)}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(getGatewayUrl(api.slug));
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use this URL with your API key in the Authorization header
                  </p>
                </div>
                {api.category && (
                  <div>
                    <p className="text-muted-foreground mb-1">Category</p>
                    <p>{api.category}</p>
                  </div>
                )}
                {api.rate_limit && (
                  <div>
                    <p className="text-muted-foreground mb-1">Rate Limits</p>
                    <p>
                      {api.rate_limit.requests_per_minute && `${api.rate_limit.requests_per_minute}/min`}
                      {api.rate_limit.requests_per_day && ` • ${api.rate_limit.requests_per_day}/day`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Endpoints */}
            {api.endpoints && api.endpoints.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">Available Endpoints</h4>
                <div className="space-y-2">
                  {api.endpoints.map((endpoint, idx) => (
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
              {api.documentation_url && (
                <Button variant="outline" asChild>
                  <a href={api.documentation_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    External Documentation
                  </a>
                </Button>
              )}
              {api.status === 'active' && (
                <Button
                  onClick={() => {
                    onCreateKey(api);
                    onOpenChange(false);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
