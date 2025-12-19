/**
 * Dashboard Data Hooks
 * Phase 2 Implementation - SWR-based data fetching with caching
 */

// User Dashboard Hooks
export {
  useDashboardMetrics,
  useDashboardTimeline,
  type DashboardMetrics,
} from './use-dashboard-metrics';

// Admin Dashboard Hooks
export {
  useAdminMetrics,
  useUsersAnalytics,
  useApisAnalytics,
} from './use-admin-metrics';

export {
  useApiKeys,
  type ApiKey,
} from './use-api-keys';

// Activity & Notifications Hooks
export {
  useActivityLog,
  type ActivityItem,
} from './use-activity-log';

export {
  useNotifications,
  type Notification,
} from './use-notifications';
