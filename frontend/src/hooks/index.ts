/**
 * Dashboard Data Hooks
 * Phase 2 Implementation - SWR-based data fetching with caching
 */

// User Dashboard Hooks
export {
  useDashboardMetrics,
  useDashboardTimeline,
  type DashboardMetrics,
  type TimelineData,
} from './use-dashboard-metrics';

// Admin Dashboard Hooks
export {
  useAdminMetrics,
  useUsersAnalytics,
  useApisAnalytics,
  type AdminMetrics,
  type UsersAnalyticsData,
  type ApisAnalyticsData,
} from './use-admin-metrics';

// Activity & Notifications Hooks
export {
  useActivityLog,
  type ActivityLogItem,
} from './use-activity-log';

export {
  useNotifications,
  type Notification,
} from './use-notifications';
