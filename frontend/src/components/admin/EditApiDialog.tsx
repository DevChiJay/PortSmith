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
  });

  useEffect(() => {
    if (open) {
      setFormData({
        name: api.name,
        slug: api.slug,
        description: api.description,
        baseUrl: api.baseUrl || '',
        documentation: api.documentation || '',
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
            <DialogDescription>Update API details</DialogDescription>
          </DialogHeader>
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
