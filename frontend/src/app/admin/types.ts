// Shared types for admin pages

export interface AdminMetrics {
  totalUsers: number;
  newUsers: number;
  totalApiKeys: number;
  activeApiKeys: number;
  totalRequests: number;
  activeUsers: number;
  successRate: number;
  avgResponseTime: number;
}

export interface ApiAnalytics {
  id: string;
  name: string;
  slug: string;
  totalKeys: number;
  activeKeys: number;
  uniqueUsers: number;
  totalRequests: number;
  successRate: number;
  errorRate: number;
  avgResponseTime: number;
}

export interface ActivityLog {
  type: string;
  description: string;
  timestamp: string;
  user?: {
    email: string;
    name?: string;
  };
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  status: 'active' | 'inactive' | 'revoked';
  requestCount: number;
  createdAt: string;
  lastUsed?: string;
  expiresAt: string;
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  api?: {
    name: string;
    slug: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isVerified: boolean;
  avatarUrl?: string;
  apiKeyCount: number;
  activeKeyCount: number;
  totalRequests: number;
  joinDate: string;
  lastActivity?: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface Api {
  id: string;
  name: string;
  slug: string;
  description: string;
  baseUrl?: string;
  documentation?: string;
  analytics?: ApiAnalytics;
}
