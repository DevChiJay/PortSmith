'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useApiData } from '@/hooks/use-api-data';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Copy, Check, AlertTriangle } from 'lucide-react';

interface CreateKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedApiId?: string;
  onSuccess?: () => void;
}

export function CreateKeyDialog({ open, onOpenChange, preSelectedApiId, onSuccess }: CreateKeyDialogProps) {
  const { axiosInstance } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [selectedApiId, setSelectedApiId] = useState(preSelectedApiId || '');
  const [scope, setScope] = useState('read');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: apisData, isLoading: apisLoading } = useApiData<{ apis: any[] }>({
    endpoint: '/api/apis',
  });

  const availableApis = apisData?.apis || [];

  useEffect(() => {
    if (preSelectedApiId) {
      setSelectedApiId(preSelectedApiId);
    }
  }, [preSelectedApiId]);

  const handleCreateKey = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post('/api/keys', {
        name: keyName,
        apiId: selectedApiId,
        permissions: scope === 'read_write' ? ['read', 'write'] : [scope],
      });

      // Backend returns the key data directly (not wrapped in success object)
      if (response.data && response.data.key) {
        // Show the API key in a success dialog
        setCreatedKey(response.data.key);
        toast.success('API key created successfully!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create API key');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setKeyName('');
    setSelectedApiId(preSelectedApiId || '');
    setScope('read');
    setCreatedKey(null);
    setCopied(false);
    onOpenChange(false);
    if (createdKey) {
      onSuccess?.();
    }
  };

  const handleCopyKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      toast.success('API key copied to clipboard');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        {!createdKey ? (
          <form onSubmit={handleCreateKey}>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key to access our services. Keep your keys secure - they grant access to your account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="name">
                  Key Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="My Project API Key"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="apiId">
                  API <span className="text-red-500">*</span>
                </Label>
                {apisLoading ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <Select value={selectedApiId} onValueChange={setSelectedApiId} required disabled={isSubmitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an API" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableApis
                        .map((api) => (
                          <SelectItem key={api.id} value={api.id}>
                            {api.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="scope">
                  Permissions <span className="text-red-500">*</span>
                </Label>
                <Select value={scope} onValueChange={setScope} required disabled={isSubmitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select permissions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">Read Only</SelectItem>
                    <SelectItem value="write">Write Only</SelectItem>
                    <SelectItem value="read_write">Read & Write</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !selectedApiId}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Key'
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>API Key Created Successfully!</DialogTitle>
              <DialogDescription>
                Copy your API key now - you won't be able to see it again.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Alert variant="default" className="border-amber-500 bg-amber-50 dark:bg-amber-950">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-600 dark:text-amber-400">
                  <strong>Important:</strong> This is the only time you'll see this key. Store it securely - if you lose it, you'll need to generate a new one.
                </AlertDescription>
              </Alert>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="generated-key">Your API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="generated-key"
                    value={createdKey}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyKey}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleClose} disabled={!copied}>
                {copied ? 'Done' : 'Copy Key First'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

