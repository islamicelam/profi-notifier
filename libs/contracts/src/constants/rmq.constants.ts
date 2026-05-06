export const EXCHANGES = {
  EVENTS: 'events-exchange',
} as const;

export const QUEUES = {
  NOTIFICATIONS: 'notifications-queue',
  NOTIFICATIONS_DLQ: 'notifications-dlq', // dead letter queue
} as const;

export const ROUTING_KEYS = {
  NOTIFICATION_TELEGRAM: 'notification.telegram',
  // could be added other routing keys in the future
} as const;

export const BINDING_PATTERNS = {
  ALL_NOTIFICATIONS: 'notification.*',
} as const;
