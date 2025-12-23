import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Bell, Key, Loader2 } from 'lucide-react';

interface PreferencesTabProps {
  emailNotifications: boolean;
  webhookUrl: string;
  defaultKeyExpiry: string;
  isLoading: boolean;
  onEmailNotificationsChange: (value: boolean) => void;
  onWebhookUrlChange: (value: string) => void;
  onDefaultKeyExpiryChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function PreferencesTab({
  emailNotifications,
  webhookUrl,
  defaultKeyExpiry,
  isLoading,
  onEmailNotificationsChange,
  onWebhookUrlChange,
  onDefaultKeyExpiryChange,
  onSubmit,
}: PreferencesTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={onSubmit}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email alerts for key events and updates
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={emailNotifications}
                onCheckedChange={onEmailNotificationsChange}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL (Optional)</Label>
              <Input
                id="webhookUrl"
                type="url"
                placeholder="https://example.com/webhook"
                value={webhookUrl}
                onChange={(e) => onWebhookUrlChange(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Receive real-time notifications for key events via webhook
              </p>
            </div>
          </CardContent>

          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Key Preferences
            </CardTitle>
            <CardDescription>Default settings for new API keys</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="defaultKeyExpiry">Default Key Expiry (days)</Label>
              <Input
                id="defaultKeyExpiry"
                type="number"
                min="1"
                max="365"
                value={defaultKeyExpiry}
                onChange={(e) => onDefaultKeyExpiryChange(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                New API keys will expire after this many days (1-365)
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Preferences'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
