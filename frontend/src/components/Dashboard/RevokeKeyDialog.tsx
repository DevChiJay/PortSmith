'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

interface RevokeKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: {
    id: string;
    name: string;
  };
  onSuccess?: () => void;
}

export function RevokeKeyDialog({ open, onOpenChange, apiKey, onSuccess }: RevokeKeyDialogProps) {
  const { axiosInstance } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRevokeKey = async () => {
    if (!apiKey?.id) return;
    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post(`/api/keys/${apiKey.id}/revoke`);

      if (response.data.success) {
        toast.success('API key revoked successfully');
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to revoke API key');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revoke API Key</DialogTitle>
          <DialogDescription>
            Are you sure you want to revoke "{apiKey?.name}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Once revoked, this API key will immediately stop working and cannot be restored.
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleRevokeKey} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Revoking...
              </>
            ) : (
              'Revoke Key'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

