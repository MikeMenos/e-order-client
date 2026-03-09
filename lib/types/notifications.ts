export type NotificationsCountUnreadResponse = {
  statusCode?: number;
  message?: string;
  detailedMessage?: string;
  message2?: string;
  message3?: string;
  extraActions?: string;
  unreadCounter?: number;
};

export type NotificationItem = {
  notificationID: number;
  notificationUID: string;
  title: string;
  message: string;
  dateCreated: string;
  dateRead?: string;
  isRead: boolean;
};

export type NotificationsGetItemsResponse = {
  statusCode?: number;
  message?: string;
  detailedMessage?: string;
  message2?: string;
  message3?: string;
  extraActions?: string;
  listNotifications?: NotificationItem[];
  totalPages?: number;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
};
