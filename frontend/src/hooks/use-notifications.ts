'use client';

import useSWR from 'swr';
import { useApiClient } from './use-api-client';
import { useCallback } from 'react';

export type NotificationType = 'success' | 'warning' | 'error' | 'info';
export type NotificationCategory =
  | 'key_expiring'
  | 'key_inactive'
  | 'high_error_rate'
  | 'welcome'
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  metadata: Record<string, any>;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

interface UseNotificationsOptions {
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
}

/**
 * Hook for user notifications with real-time updates
 * Provides methods for marking notifications as read
 */
export function useNotifications(options: UseNotificationsOptions = {}) {
  const { request } = useApiClient();
  const {
    refreshInterval = 60000, // 1 minute default for notifications
    revalidateOnFocus = true,
  } = options;

  const fetcher = async () => {
    return await request<NotificationsResponse>('/api/user/notifications');
  };

  const { data, error, isLoading, isValidating, mutate } = useSWR<NotificationsResponse>(
    '/api/user/notifications',
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  /**
   * Mark a notification as read (optimistic update)
   */
  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!data) return;

      // Optimistic update
      const optimisticData: NotificationsResponse = {
        ...data,
        notifications: data.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, data.unreadCount - 1),
      };

      mutate(optimisticData, false);

      // TODO: Implement actual API call when backend endpoint is ready
      // try {
      //   await request(`/api/user/notifications/${notificationId}/read`, {
      //     method: 'POST',
      //   });
      //   mutate();
      // } catch (error) {
      //   // Revert on error
      //   mutate();
      // }
    },
    [data, mutate]
  );

  /**
   * Mark all notifications as read (optimistic update)
   */
  const markAllAsRead = useCallback(async () => {
    if (!data) return;

    // Optimistic update
    const optimisticData: NotificationsResponse = {
      ...data,
      notifications: data.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    };

    mutate(optimisticData, false);

    // TODO: Implement actual API call when backend endpoint is ready
    // try {
    //   await request('/api/user/notifications/read-all', {
    //     method: 'POST',
    //   });
    //   mutate();
    // } catch (error) {
    //   // Revert on error
    //   mutate();
    // }
  }, [data, mutate]);

  /**
   * Dismiss a notification (remove from list)
   */
  const dismissNotification = useCallback(
    async (notificationId: string) => {
      if (!data) return;

      const notification = data.notifications.find((n) => n.id === notificationId);
      const wasUnread = notification && !notification.read;

      // Optimistic update
      const optimisticData: NotificationsResponse = {
        ...data,
        notifications: data.notifications.filter((n) => n.id !== notificationId),
        unreadCount: wasUnread ? Math.max(0, data.unreadCount - 1) : data.unreadCount,
        total: Math.max(0, data.total - 1),
      };

      mutate(optimisticData, false);

      // TODO: Implement actual API call when backend endpoint is ready
      // try {
      //   await request(`/api/user/notifications/${notificationId}`, {
      //     method: 'DELETE',
      //   });
      //   mutate();
      // } catch (error) {
      //   // Revert on error
      //   mutate();
      // }
    },
    [data, mutate]
  );

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    total: data?.total || 0,
    isLoading,
    isValidating,
    error: error?.message || null,
    refresh: mutate,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  };
}

/**
 * Hook for filtering notifications by category
 */
export function useNotificationsByCategory(category?: NotificationCategory) {
  const { notifications, ...rest } = useNotifications();

  const filteredNotifications = category
    ? notifications.filter((n) => n.category === category)
    : notifications;

  return {
    notifications: filteredNotifications,
    ...rest,
  };
}
