// Shared types for dashboard pages

export interface ApiInfo {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: 'active' | 'inactive' | 'beta';
  category?: string;
  base_url?: string;
  baseUrl?: string;
  documentation_url?: string;
  endpoints?: Array<{
    path: string;
    method: string;
    description: string;
  }>;
  rate_limit?: {
    requests_per_minute?: number;
    requests_per_day?: number;
  };
  user_key_count?: number;
  createdAt?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key?: string;
  apiId: string;
  apiName: string;
  status: 'active' | 'inactive' | 'revoked';
  permissions: string[];
  rateLimit?: {
    requests: number;
    per: number;
  };
  expiresAt?: string;
  createdAt: string;
  lastUsed?: string;
  usage?: {
    totalRequests: number;
    last7Days: number;
    last30Days: number;
    successRate: number;
    avgResponseTime: number;
    trend: Array<{ date: string; requests: number }>;
  };
}

export interface DashboardMetrics {
  overview?: {
    totalKeys: number;
    activeKeys: number;
    totalRequests: number;
    successRate: number;
  };
}

export interface TimelineData {
  date: string;
  totalRequests: number;
}

export type StatusBadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

export type SortBy = 'name' | 'newest' | 'popular';

export interface ActiveFilter {
  key: string;
  label: string;
  value: string;
}
