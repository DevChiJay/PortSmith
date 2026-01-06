'use client';

import { useState } from 'react';
import { useApiClient } from '@/hooks/use-api-client';
import { Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface DeleteApiDialogProps {
  apiId: string;
  apiName: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function DeleteApiDialog({
  apiId,
  apiName,
  onSuccess,
  trigger,
}: DeleteApiDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { request } = useApiClient();
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      await request(`/api/admin/apis/${apiId}`, {
        method: 'DELETE',
      });

      toast({
        title: 'Success',
        description: 'API deleted successfully',
      });

      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete API',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete API</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{apiName}</strong>? This will
            also delete all associated API keys and usage logs. This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
