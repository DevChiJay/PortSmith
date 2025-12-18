'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  Shield,
  Bell,
  Key,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

import { DashboardLayout, DashboardHeader } from '@/components/Dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { AvatarUpload } from '@/components/avatar-upload';

export default function SettingsPage() {
  const router = useRouter();
  const { user, refreshUser, axiosInstance, isAuthenticated, logout } = useAuth();

  // Profile state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [defaultKeyExpiry, setDefaultKeyExpiry] = useState('30');
  const [isPreferencesLoading, setIsPreferencesLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if OAuth user (can't change password)
  const isOAuthUser = user?.google_id || user?.github_id;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      setAvatarUrl(user.avatar_url || '');
      // Load preferences from user object if available
      setEmailNotifications(user.preferences?.email_notifications ?? true);
      setWebhookUrl(user.preferences?.webhook_url || '');
      setDefaultKeyExpiry(user.preferences?.default_key_expiry || '30');
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim() || fullName.trim().length < 2) {
      toast.error('Full name must be at least 2 characters long');
      return;
    }

    setIsProfileLoading(true);

    try {
      const response = await axiosInstance.put('/api/auth/profile', {
        full_name: fullName.trim(),
        phone: phone.trim(),
        avatar_url: avatarUrl,
      });

      if (response.data.success) {
        toast.success('Profile updated successfully!');
        await refreshUser();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsPasswordLoading(true);

    try {
      const response = await axiosInstance.put('/api/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      if (response.data.success) {
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPreferencesLoading(true);

    try {
      const response = await axiosInstance.put('/api/auth/preferences', {
        email_notifications: emailNotifications,
        webhook_url: webhookUrl.trim(),
        default_key_expiry: parseInt(defaultKeyExpiry),
      });

      if (response.data.success) {
        toast.success('Preferences updated successfully!');
        await refreshUser();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update preferences');
    } finally {
      setIsPreferencesLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await axiosInstance.delete('/api/auth/account');
      if (response.data.success) {
        toast.success('Account deleted successfully');
        logout();
        router.push('/');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    }
  };

  const handleAvatarChange = (newAvatarUrl: string) => {
    setAvatarUrl(newAvatarUrl);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <DashboardHeader title="Settings" description="Manage your account settings and preferences" />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="danger">Account</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Picture
              </CardTitle>
              <CardDescription>Upload a profile picture to personalize your account</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <AvatarUpload
                currentAvatar={avatarUrl}
                fullName={fullName || user.full_name}
                onAvatarChange={handleAvatarChange}
                size="xl"
              />
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card>
            <form onSubmit={handleProfileSubmit}>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and contact information</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isProfileLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input id="email" type="email" value={user.email} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isProfileLoading}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Account Status
                  </Label>
                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Role:</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded capitalize">
                        {user.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Verification:</span>
                      {user.is_verified ? (
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isProfileLoading}>
                  {isProfileLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                {isOAuthUser
                  ? 'You signed in with OAuth. Password management is handled by your provider.'
                  : 'Update your password to keep your account secure'}
              </CardDescription>
            </CardHeader>

            {!isOAuthUser && (
              <form onSubmit={handlePasswordSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={isPasswordLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isPasswordLoading}
                    />
                    <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isPasswordLoading}
                    />
                  </div>
                </CardContent>

                <CardFooter className="flex justify-end">
                  <Button type="submit" disabled={isPasswordLoading}>
                    {isPasswordLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </CardFooter>
              </form>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Read-only information about your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Account ID</p>
                  <p className="font-mono text-xs mt-1 break-all">{user.id}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Member Since</p>
                  <p className="mt-1">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                {user.google_id && (
                  <div>
                    <p className="font-medium text-muted-foreground">Login Method</p>
                    <p className="mt-1">Google OAuth</p>
                  </div>
                )}
                {user.github_id && (
                  <div>
                    <p className="font-medium text-muted-foreground">Login Method</p>
                    <p className="mt-1">GitHub OAuth</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <form onSubmit={handlePreferencesSubmit}>
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
                    onCheckedChange={setEmailNotifications}
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
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    disabled={isPreferencesLoading}
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
                    onChange={(e) => setDefaultKeyExpiry(e.target.value)}
                    disabled={isPreferencesLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    New API keys will expire after this many days (1-365)
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isPreferencesLoading}>
                  {isPreferencesLoading ? (
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
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger" className="space-y-6">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions that affect your account</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Deleting your account is permanent and cannot be undone. All your API keys will be
                  revoked and your data will be deleted.
                </AlertDescription>
              </Alert>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and
                      remove all your data from our servers, including all API keys.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
