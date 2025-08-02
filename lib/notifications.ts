"use server";

import { db } from '@/db';
import { notifications, profiles } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

import type { CreateNotificationParams } from '@/types/notifications';

/**
 * Create a new notification
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const [notification] = await db
      .insert(notifications)
      .values({
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        priority: params.priority || 'medium',
        relatedId: params.relatedId,
        relatedType: params.relatedType,
        metadata: params.metadata,
        expiresAt: params.expiresAt,
      })
      .returning();

    return { success: true, data: notification };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create notification' 
    };
  }
}

/**
 * Send order-related notifications
 */
export async function sendOrderNotification(
  orderId: string, 
  userId: string, 
  status: string, 
  previousStatus?: string
) {
  const statusMessages = {
    pending: {
      title: 'Order Received',
      message: 'Your order has been received and is pending review.',
      priority: 'medium' as const,
    },
    reviewing: {
      title: 'Order Under Review',
      message: 'We are reviewing your order for feasibility and will confirm soon.',
      priority: 'medium' as const,
    },
    confirmed: {
      title: 'Order Confirmed ✅',
      message: 'Great news! Your order has been confirmed and we will start working on it.',
      priority: 'high' as const,
    },
    rejected: {
      title: 'Order Could Not Be Processed',
      message: 'Unfortunately, we cannot process your order at this time. Please contact us for details.',
      priority: 'high' as const,
    },
    in_progress: {
      title: 'Order In Progress',
      message: 'Your order is now being worked on. We will notify you when it\'s ready.',
      priority: 'medium' as const,
    },
    ready: {
      title: 'Order Ready for Pickup! 🎉',
      message: 'Your order is ready! Please contact us to arrange pickup.',
      priority: 'high' as const,
    },
    delivered: {
      title: 'Order Delivered',
      message: 'Your order has been delivered successfully.',
      priority: 'medium' as const,
    },
    completed: {
      title: 'Order Completed',
      message: 'Thank you! Your order has been completed.',
      priority: 'low' as const,
    },
  };

  const config = statusMessages[status as keyof typeof statusMessages];
  if (!config) return { success: false, error: 'Invalid order status' };

  return createNotification({
    userId,
    title: config.title,
    message: config.message,
    type: 'order',
    priority: config.priority,
    relatedId: orderId,
    relatedType: 'order',
    metadata: {
      orderId,
      status,
      previousStatus,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Send message notifications
 */
export async function sendMessageNotification(
  userId: string,
  messageTitle: string,
  messageContent: string,
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
  relatedId?: string
) {
  return createNotification({
    userId,
    title: messageTitle,
    message: messageContent,
    type: 'message',
    priority,
    relatedId,
    relatedType: 'message',
    metadata: {
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Send system notifications
 */
export async function sendSystemNotification(
  userId: string,
  title: string,
  message: string,
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
  metadata?: any
) {
  return createNotification({
    userId,
    title,
    message,
    type: 'system',
    priority,
    relatedType: 'system',
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata,
    },
  });
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(userId: string, limit: number = 50) {
  try {
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    return { success: true, data: userNotifications };
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch notifications' 
    };
  }
}

/**
 * Get all notifications for admin (with user profile data)
 */
export async function getAdminNotifications(filter?: string, search?: string, limit: number = 100) {
  try {
    const adminNotifications = await db
      .select({
        id: notifications.id,
        userId: notifications.userId,
        title: notifications.title,
        message: notifications.message,
        type: notifications.type,
        status: notifications.status,
        priority: notifications.priority,
        relatedId: notifications.relatedId,
        relatedType: notifications.relatedType,
        metadata: notifications.metadata,
        createdAt: notifications.createdAt,
        readAt: notifications.readAt,
        expiresAt: notifications.expiresAt,
        profile: {
          fullName: profiles.fullName,
          phone: profiles.phone,
        },
      })
      .from(notifications)
      .leftJoin(profiles, eq(notifications.userId, profiles.id))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    // Apply client-side filtering for now
    let filteredData = adminNotifications;
    
    if (filter && filter !== 'all') {
      filteredData = filteredData.filter(item => item.type === filter);
    }
    
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter(item => 
        item.title.toLowerCase().includes(searchLower) || 
        item.message.toLowerCase().includes(searchLower)
      );
    }

    return { success: true, data: filteredData };
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch admin notifications' 
    };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string, userId: string) {
  try {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ 
        status: 'read',
        readAt: new Date()
      })
      .where(eq(notifications.id, notificationId))
      .returning();

    return { success: true, data: updatedNotification };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to mark notification as read' 
    };
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    await db
      .update(notifications)
      .set({ 
        status: 'read',
        readAt: new Date()
      })
      .where(eq(notifications.userId, userId));

    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to mark all notifications as read' 
    };
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string, userId: string) {
  try {
    await db
      .delete(notifications)
      .where(eq(notifications.id, notificationId));

    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete notification' 
    };
  }
}

/**
 * Send notification to all admin users
 */
export async function sendAdminNotification(
  title: string,
  message: string,
  type: 'order' | 'message' | 'system' = 'system',
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
  relatedId?: string,
  relatedType?: string,
  metadata?: any
) {
  try {
    // Get all admin users using Drizzle
    const adminProfiles = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.role, 'ADMIN'));

    if (!adminProfiles || adminProfiles.length === 0) {
      console.warn('No admin users found to send notifications to');
      return { success: false, error: 'No admin users found' };
    }

    // Send notification to each admin
    const results = await Promise.all(
      adminProfiles.map(admin =>
        createNotification({
          userId: admin.id,
          title,
          message,
          type,
          priority,
          relatedId,
          relatedType,
          metadata: {
            timestamp: new Date().toISOString(),
            isAdminNotification: true,
            ...metadata,
          },
        })
      )
    );

    const successCount = results.filter(r => r.success).length;
    
    return { 
      success: successCount > 0, 
      data: { sent: successCount, total: adminProfiles.length }
    };
  } catch (error) {
    console.error('Error sending admin notifications:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send admin notifications' 
    };
  }
}