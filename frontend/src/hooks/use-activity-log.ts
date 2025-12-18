'use client';

import useSWR from 'swr';
import { useApiClient } from './use-api-client';

export interface ActivityItem {
  type: 'api_request' | 'key_created' | 'user_registered';
  timestamp: string;
  description: string;
  status: 'success' | 'error';
  user: {
    id: string;
    email: string;
    name: string;
  };
  metadata: Record<string, any>;
}

export interface ActivityLogResponse {
  activities: ActivityItem[];
  count: number;
}

type ActivityType = 'all' | 'requests' | 'keys' | 'users';

interface UseActivityLogOptions {
  limit?: number;
  type?: ActivityType;
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
}

/**
 * Hook for fetching recent activity with pagination
 * Supports real-time updates and filtering by activity type
 */
export function useActivityLog(options: UseActivityLogOptions = {}) {
  const { request } = useApiClient();
  const {
    limit = 50,
    type = 'all',
    refreshInterval = 15000, // 15 seconds for activity feed
    revalidateOnFocus = true,
  } = options;

  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  if (type !== 'all') {
    params.append('type', type);
  }

  const endpoint = `/api/admin/analytics/activity?${params.toString()}`;

  const fetcher = async () => {
    return await request<ActivityLogResponse>(endpoint);
  };

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    endpoint,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus,
      revalidateOnReconnect: true,
      dedupingInterval: 3000, // Shorter deduping for activity
    }
  );

  return {
    activities: data?.activities || [],
    count: data?.count || 0,
    isLoading,
    isValidating,
    error: error?.message || null,
    refresh: mutate,
  };
}

/**
 * Hook for fetching a single page of activity with manual pagination
 */
export function useActivityLogPaginated(
  page: number,
  limit: number,
  type: ActivityType = 'all'
) {
  const { request } = useApiClient();

  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  params.append('page', page.toString());
  if (type !== 'all') {
    params.append('type', type);
  }

  const endpoint = `/api/admin/analytics/activity?${params.toString()}`;

  const fetcher = async () => {
    return await request<ActivityLogResponse>(endpoint);
  };

  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  return {
    activities: data?.activities || [],
    count: data?.count || 0,
    isLoading,
    error: error?.message || null,
    refresh: mutate,
  };
}
