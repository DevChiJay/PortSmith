'use client';

import useSWR from 'swr';
import { useApiClient } from './use-api-client';

export interface AdminOverview {
  totalUsers: number;
  totalKeys: number;
  activeKeys: number;
  totalRequests: number;
  activeUsers: number;
  successRate: number;
  errorRate: string;
  avgResponseTime: number;
}

export interface GrowthData {
  date: string;
  users: number;
  keys: number;
}

export interface TopApi {
  apiId: string;
  apiName: string;
  requestCount: number;
}

export interface AdminDashboardMetrics {
  overview: AdminOverview;
  growth: GrowthData[];
  topApis: TopApi[];
}

export interface UserAnalytics {
  id: string;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
  avatarUrl?: string;
  joinDate: string;
  apiKeyCount: number;
  activeKeyCount: number;
  totalRequests: number;
  lastActivity: string | null;
}

export interface UsersAnalyticsResponse {
  users: UserAnalytics[];
  pagination: {
    page: number;
    limit: number;
    totalUsers: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface ApiAnalytics {
  id: string;
  name: string;
  slug: string;
  description: string;
  activeKeys: number;
  totalKeys: number;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  errorRate: number;
  successRate: number;
  avgResponseTime: number;
}

interface UseAdminMetricsOptions {
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
}

/**
 * Hook for fetching admin dashboard overview metrics
 */
export function useAdminMetrics(options: UseAdminMetricsOptions = {}) {
  const { request } = useApiClient();
  const {
    refreshInterval = 30000, // 30 seconds default
    revalidateOnFocus = true,
  } = options;

  const fetcher = async () => {
    return await request<AdminDashboardMetrics>('/api/admin/analytics/overview');
  };

  const { data, error, isLoading, isValidating, mutate } = useSWR<AdminDashboardMetrics>(
    '/api/admin/analytics/overview',
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return {
    metrics: data,
    isLoading,
    isValidating,
    error: error?.message || null,
    refresh: mutate,
  };
}

/**
 * Hook for fetching paginated user analytics
 */
export function useUsersAnalytics(
  page = 1,
  limit = 25,
  search = '',
  role = '',
  status = ''
) {
  const { request } = useApiClient();

  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (search) params.append('search', search);
  if (role) params.append('role', role);
  if (status) params.append('status', status);

  const endpoint = `/api/admin/analytics/users?${params.toString()}`;

  const fetcher = async () => {
    return await request<UsersAnalyticsResponse>(endpoint);
  };

  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  return {
    users: data?.users || [],
    pagination: data?.pagination,
    isLoading,
    error: error?.message || null,
    refresh: mutate,
  };
}

/**
 * Hook for fetching API analytics
 */
export function useApisAnalytics(startDate?: string, endDate?: string) {
  const { request } = useApiClient();

  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const queryString = params.toString();
  const endpoint = queryString
    ? `/api/admin/analytics/apis?${queryString}`
    : '/api/admin/analytics/apis';

  const fetcher = async () => {
    return await request<{
      apis: ApiAnalytics[];
      period: {
        startDate: string;
        endDate: string;
      };
    }>(endpoint);
  };

  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });

  return {
    apis: data?.apis || [],
    period: data?.period,
    isLoading,
    error: error?.message || null,
    refresh: mutate,
  };
}
