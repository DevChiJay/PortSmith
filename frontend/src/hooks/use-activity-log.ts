'use client';

import useSWR from 'swr';
import { useApiClient } from './use-api-client';

export interface ActivityItem {
  type: 'user_registered' | 'key_created' | 'key_revoked' | 'api_request' | 'user_updated' | 'api_created' | 'api_updated';
  timestamp: string;
  description: string;
  status: 'success' | 'error';
  user?: {
    id: string;
    email: string;
    name: string;
  };
  metadata?: Record<string, any>;
}

export interface ActivityLogResponse {
  activities: ActivityItem[];
}

/**
 * Hook for fetching recent activity
 */
export function useActivityLog(limit = 20) {
  const { request } = useApiClient();

  const endpoint = `/api/admin/analytics/activity?limit=${limit}`;

  const fetcher = async () => {
    return await request<ActivityLogResponse>(endpoint);
  };

  const { data, error, isLoading, mutate } = useSWR(
    endpoint,
    fetcher,
    {
      refreshInterval: 10000, // 10 seconds for activity feed
      revalidateOnFocus: true,
    }
  );

  return {
    activities: data?.activities || [],
    isLoading,
    error: error?.message || null,
    refresh: mutate,
  };
}
