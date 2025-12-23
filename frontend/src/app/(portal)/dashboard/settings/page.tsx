'use client';

import { Loader2 } from 'lucide-react';
import { DashboardLayout, DashboardHeader } from '@/components/Dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileTab } from '@/components/Dashboard/Settings/ProfileTab';
import { SecurityTab } from '@/components/Dashboard/Settings/SecurityTab';
import { PreferencesTab } from '@/components/Dashboard/Settings/PreferencesTab';
import { DangerZoneTab } from '@/components/Dashboard/Settings/DangerZoneTab';
import { useSettingsForm } from '@/hooks/use-settings-form';

export default function SettingsPage() {
  const {
    user,
    fullName,
    setFullName,
    phone,
    setPhone,
    avatarUrl,
    isProfileLoading,
    handleAvatarChange,
    handleProfileSubmit,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isPasswordLoading,
    handlePasswordSubmit,
    emailNotifications,
    setEmailNotifications,
    webhookUrl,
    setWebhookUrl,
    defaultKeyExpiry,
    setDefaultKeyExpiry,
    isPreferencesLoading,
    handlePreferencesSubmit,
    handleDeleteAccount,
  } = useSettingsForm();

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
        <TabsContent value="profile">
          <ProfileTab
            user={user}
            fullName={fullName}
            phone={phone}
            avatarUrl={avatarUrl}
            isLoading={isProfileLoading}
            onFullNameChange={setFullName}
            onPhoneChange={setPhone}
            onAvatarChange={handleAvatarChange}
            onSubmit={handleProfileSubmit}
          />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <SecurityTab
            user={user}
            currentPassword={currentPassword}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            isLoading={isPasswordLoading}
            onCurrentPasswordChange={setCurrentPassword}
            onNewPasswordChange={setNewPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onSubmit={handlePasswordSubmit}
          />
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <PreferencesTab
            emailNotifications={emailNotifications}
            webhookUrl={webhookUrl}
            defaultKeyExpiry={defaultKeyExpiry}
            isLoading={isPreferencesLoading}
            onEmailNotificationsChange={setEmailNotifications}
            onWebhookUrlChange={setWebhookUrl}
            onDefaultKeyExpiryChange={setDefaultKeyExpiry}
            onSubmit={handlePreferencesSubmit}
          />
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger">
          <DangerZoneTab onDeleteAccount={handleDeleteAccount} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
