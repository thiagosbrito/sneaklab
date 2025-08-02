export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'message' | 'system';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  relatedId?: string;
  relatedType?: string;
  metadata?: any;
  expiresAt?: Date;
}