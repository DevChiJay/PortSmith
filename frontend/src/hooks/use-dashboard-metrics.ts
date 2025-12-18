'use client';

import useSWR from 'swr';
import { useApiClient } from './use-api-client';

export interface DashboardOverview {
  totalKeys: number;
  activeKeys: number;
  totalRequests: number;
  recentRequests: number;
  successRate: number;
  avgResponseTime: number;
  uniqueApis: number;
}

export interface FavoriteApi {
  apiId: string;
  apiName: string;
  requestCount: number;
}

export interface UsageTrend {
  date: string;
  requests: number;
}

export interface DashboardMetrics {
  overview: DashboardOverview;
  favoriteApis: FavoriteApi[];
  usageTrend: UsageTrend[];
}

interface UseDashboardMetricsOptions {
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
}

/**
 * Hook for fetching user dashboard overview metrics with auto-refresh
 * Uses SWR for caching, auto-revalidation, and optimistic updates
 */
export function useDashboardMetrics(options: UseDashboardMetricsOptions = {}) {
  const { request } = useApiClient();
  const {
    refreshInterval = 30000, // 30 seconds default
    revalidateOnFocus = true,
  } = options;

  const fetcher = async () => {
    return await request<DashboardMetrics>('/api/user/metrics/overview');
  };

  const { data, error, isLoading, isValidating, mutate } = useSWR<DashboardMetrics>(
    '/api/user/metrics/overview',
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
    }
  );

  return {
    data,
    isLoading,
    isValidating,
    error: error?.message || null,
    refresh: mutate,
  };
}

/**
 * Hook for fetching user timeline data
 */
export function useDashboardTimeline(startDate?: string, endDate?: string) {
  const { request } = useApiClient();

  const endpoint = '/api/user/metrics/timeline';
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const queryString = params.toString();
  const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;

  const fetcher = async () => {
    return await request<{
      timeline: Array<{
        date: string;
        totalRequests: number;
        successCount: number;
        errorCount: number;
        avgResponseTime: number;
        successRate: number;
      }>;
      period: {
        startDate: string;
        endDate: string;
      };
    }>(fullEndpoint);
  };

  const { data, error, isLoading, mutate } = useSWR(fullEndpoint, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });

  return {
    timeline: data?.timeline || [],
    period: data?.period,
    isLoading,
    error: error?.message || null,
    refresh: mutate,
  };
}
