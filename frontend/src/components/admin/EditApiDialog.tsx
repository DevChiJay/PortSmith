'use client';

import { useState, useEffect } from 'react';
import { useApiClient } from '@/hooks/use-api-client';
import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Api {
  id: string;
  name: string;
  slug: string;
  description: string;
  baseUrl?: string;
  documentation?: string;
  mode?: string;
  category?: string;
  icon?: string;
  color?: string;
  featured?: boolean;
  externalSource?: any;
}

interface EditApiDialogProps {
  api: Api;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function EditApiDialog({ api, onSuccess, trigger }: EditApiDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { request } = useApiClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: api.name,
    slug: api.slug,
    description: api.description,
    baseUrl: api.baseUrl || '',
    documentation: api.documentation || '',
    visibility: (api as any).visibility || 'public',
    mode: api.mode || 'openapi',
    category: api.category || 'General',
    icon: api.icon || '🔌',
    color: api.color || '#3B82F6',
    featured: api.featured || false,
  });

  const isExternalApi = !!api.externalSource;

  useEffect(() => {
    if (open) {
      setFormData({
        name: api.name,
        slug: api.slug,
        description: api.description,
        baseUrl: api.baseUrl || '',
        documentation: api.documentation || '',
        visibility: (api as any).visibility || 'public',
        mode: api.mode || 'openapi',
        category: api.category || 'General',
        icon: api.icon || '🔌',
        color: api.color || '#3B82F6',
        featured: api.featured || false,
      });
    }
  }, [open, api]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await request(`/api/admin/apis/${api.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      toast({
        title: 'Success',
        description: 'API updated successfully',
      });

      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update API',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit API</DialogTitle>
            <DialogDescription>
              {isExternalApi 
                ? '⚠️ This is an external API. Some fields are auto-synced and cannot be edited.'
                : 'Update API details'}
            </DialogDescription>
          </DialogHeader>
          {isExternalApi && (
            <div className="rounded-md bg-amber-50 dark:bg-amber-950 p-3 mb-4">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                ⚠️ This API is managed by <code>externalApiSources.js</code>. Changes here may be overwritten on next sync.
              </p>
            </div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">API Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-slug">Slug *</Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                Used in gateway URL: /gateway/{formData.slug || 'slug'}/
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                required
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-baseUrl">Base URL *</Label>
              <Input
                id="edit-baseUrl"
                value={formData.baseUrl}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, baseUrl: e.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-documentation">Documentation URL</Label>
              <Input
                id="edit-documentation"
                value={formData.documentation}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, documentation: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category *</Label>
              <select
                id="edit-category"
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
                disabled={isExternalApi}
              >
                <option value="General">General</option>
                <option value="Data & Analytics">Data & Analytics</option>
                <option value="AI & ML">AI & ML</option>
                <option value="Communication">Communication</option>
                <option value="Financial">Financial</option>
                <option value="Authentication">Authentication</option>
                <option value="Utilities">Utilities</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-icon">Icon</Label>
                <Input
                  id="edit-icon"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, icon: e.target.value }))
                  }
                  placeholder="🔌"
                  maxLength={2}
                  disabled={isExternalApi}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-color">Color</Label>
                <Input
                  id="edit-color"
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, color: e.target.value }))
                  }
                  disabled={isExternalApi}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-visibility">Visibility *</Label>
              <select
                id="edit-visibility"
                value={formData.visibility}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, visibility: e.target.value }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Public APIs are accessible via gateway.portsmith.dev, Private APIs via privatesmith.dev
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="edit-featured"
                type="checkbox"
                checked={formData.featured}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, featured: e.target.checked }))
                }
                className="h-4 w-4 rounded border-gray-300"
                disabled={isExternalApi}
              />
              <Label htmlFor="edit-featured" className="text-sm font-normal">
                Featured API (show on homepage)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update API'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
