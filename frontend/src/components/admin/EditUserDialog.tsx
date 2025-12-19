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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_verified: boolean;
}

interface EditUserDialogProps {
  user: User;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function EditUserDialog({ user, onSuccess, trigger }: EditUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { request } = useApiClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    full_name: user.full_name,
    role: user.role,
    is_verified: user.is_verified,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        full_name: user.full_name,
        role: user.role,
        is_verified: user.is_verified,
      });
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await request(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      toast({
        title: 'Success',
        description: 'User updated successfully',
      });

      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user',
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
          <Button variant="ghost" size="sm">
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information for {user.email}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-full-name">Full Name</Label>
              <Input
                id="edit-full-name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-verified" className="cursor-pointer">
                Email Verified
              </Label>
              <Switch
                id="edit-verified"
                checked={formData.is_verified}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_verified: checked }))
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
              {isLoading ? 'Updating...' : 'Update User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
