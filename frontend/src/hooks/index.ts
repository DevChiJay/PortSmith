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
  type NotificationType,
  type NotificationCategory,
} from './use-notifications';

// Service Worker & PWA Hooks
export {
  useServiceWorker,
  useOnlineStatus,
} from './use-service-worker';

// Other Utility Hooks
export { useMobile, useIsMobile } from './use-mobile';
export { useUser } from './use-user';
export { useApiClient } from './use-api-client';
export { useApiData } from './use-api-data';
export { useToast } from './use-toast';
