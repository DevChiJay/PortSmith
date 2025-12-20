'use client';

import { useState } from 'react';
import { useApiClient } from '@/hooks/use-api-client';
import { Plus } from 'lucide-react';

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

interface AddApiDialogProps {
  onSuccess?: () => void;
}

export function AddApiDialog({ onSuccess }: AddApiDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { request } = useApiClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    baseUrl: '',
    documentation: '',
    visibility: 'public',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await request('/api/admin/apis', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      toast({
        title: 'Success',
        description: 'API created successfully',
      });

      setOpen(false);
      setFormData({
        name: '',
        slug: '',
        description: '',
        baseUrl: '',
        documentation: '',
        visibility: 'public',
      });
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create API',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: prev.slug || generateSlug(value),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add API
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New API</DialogTitle>
            <DialogDescription>
              Create a new API endpoint in the catalog
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">API Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Weather API"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="weather-api"
                required
              />
              <p className="text-xs text-muted-foreground">
                Used in gateway URL: /gateway/{formData.slug || 'slug'}/
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Get real-time weather data for any location"
                required
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="baseUrl">Base URL *</Label>
              <Input
                id="baseUrl"
                value={formData.baseUrl}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, baseUrl: e.target.value }))
                }
                placeholder="https://api.weatherapi.com/v1"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="documentation">Documentation URL</Label>
              <Input
                id="documentation"
                value={formData.documentation}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, documentation: e.target.value }))
                }
                placeholder="https://weatherapi.com/docs"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="visibility">Visibility *</Label>
              <select
                id="visibility"
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
              {isLoading ? 'Creating...' : 'Create API'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
