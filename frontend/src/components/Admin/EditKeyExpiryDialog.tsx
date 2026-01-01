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
import { useToast } from '@/hooks/use-toast';

interface EditKeyDialogProps {
  keyId: string;
  keyName: string;
  currentExpiry: string;
  currentStatus: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditKeyDialog({
  keyId,
  keyName,
  currentExpiry,
  currentStatus,
  onSuccess,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: EditKeyDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const [isLoading, setIsLoading] = useState(false);
  const { request } = useApiClient();
  const { toast } = useToast();

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const [expiryDate, setExpiryDate] = useState(formatDateForInput(currentExpiry));
  const [status, setStatus] = useState(currentStatus);

  useEffect(() => {
    if (open) {
      setExpiryDate(formatDateForInput(currentExpiry));
      setStatus(currentStatus);
    }
  }, [open, currentExpiry, currentStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const selectedDate = new Date(expiryDate);
      if (selectedDate < new Date()) {
        toast({
          title: 'Invalid Date',
          description: 'Expiry date cannot be in the past',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      await request(`/api/admin/keys/${keyId}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          status,
          expiresAt: selectedDate.toISOString() 
        }),
      });

      toast({
        title: 'Success',
        description: 'API key updated successfully',
      });

      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update API key',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit API Key</DialogTitle>
            <DialogDescription>
              Update settings for <strong>{keyName}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expiry-date">Expiry Date</Label>
              <Input
                id="expiry-date"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
              <p className="text-xs text-muted-foreground">
                Current expiry: {new Date(currentExpiry).toLocaleDateString()}
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
              {isLoading ? 'Updating...' : 'Update Key'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
