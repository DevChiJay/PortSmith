import useSWR from 'swr';
import { useApiClient } from './use-api-client';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  status: 'active' | 'inactive' | 'revoked';
  createdAt: string;
  expiresAt: string;
  lastUsed: string | null;
  requestCount: number;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
  } | null;
  api: {
    id: string;
    name: string;
    slug: string;
  } | null;
  rateLimit: {
    requests: number;
    per: number;
  };
}

interface ApiKeysResponse {
  keys: ApiKey[];
  pagination: {
    page: number;
    limit: number;
    totalKeys: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export function useApiKeys(
  page: number = 1,
  limit: number = 50,
  search: string = '',
  status: string = '',
  apiId: string = ''
) {
  const { request } = useApiClient();

  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (apiId) params.append('apiId', apiId);

  const { data, error, isLoading, mutate } = useSWR<ApiKeysResponse>(
    `/api/admin/keys?${params.toString()}`,
    (url: string) => request(url, { method: 'GET' })
  );

  return {
    keys: data?.keys || [],
    pagination: data?.pagination,
    isLoading,
    error: error?.message,
    mutate,
  };
}
