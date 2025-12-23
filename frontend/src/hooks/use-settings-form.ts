import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export function useSettingsForm() {
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
      setEmailNotifications(user.preferences?.email_notifications ?? true);
      setWebhookUrl(user.preferences?.webhook_url || '');
      setDefaultKeyExpiry(user.preferences?.default_key_expiry || '30');
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return {
    user,
    // Profile
    fullName,
    setFullName,
    phone,
    setPhone,
    avatarUrl,
    isProfileLoading,
    handleAvatarChange,
    handleProfileSubmit,
    // Password
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isPasswordLoading,
    handlePasswordSubmit,
    // Preferences
    emailNotifications,
    setEmailNotifications,
    webhookUrl,
    setWebhookUrl,
    defaultKeyExpiry,
    setDefaultKeyExpiry,
    isPreferencesLoading,
    handlePreferencesSubmit,
    // Account
    handleDeleteAccount,
  };
}
