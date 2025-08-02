"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  getUserNotifications, 
  getAdminNotifications,
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  createNotification
} from '@/lib/notifications';
import type { CreateNotificationParams } from '@/types/notifications';
import { useAuth } from '@/contexts/auth';
import type { Notification } from '@/db/schema';

// Server Action result types
interface ServerActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Get user notifications query
export function useUserNotifications(limit: number = 50) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notifications', 'user', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const result = await getUserNotifications(user.id, limit);
      if (!result.success) {
        throw new Error(result.error || 'Failed to get notifications');
      }
      return result;
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds - notifications can change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: Error) => {
      // Don't retry on auth errors
      if (error.message.includes('not authenticated')) return false;
      return failureCount < 2;
    },
  });
}

// Mark notification as read mutation
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const result = await markNotificationAsRead(notificationId, user.id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to mark notification as read');
      }
      return result;
    },
    onSuccess: (data, notificationId) => {
      // Update the notification in cache
      queryClient.setQueryData(
        ['notifications', 'user', user?.id],
        (oldData: ServerActionResult<Notification[]> | undefined) => {
          if (!oldData?.data) return oldData;
          
          return {
            ...oldData,
            data: oldData.data.map(notification =>
              notification.id === notificationId
                ? { ...notification, status: 'read' as const, readAt: new Date().toISOString() }
                : notification
            )
          };
        }
      );
    },
    onError: (error: Error) => {
      console.error('Mark notification as read failed:', error);
    }
  });
}

// Mark all notifications as read mutation
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const result = await markAllNotificationsAsRead(user.id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to mark all notifications as read');
      }
      return result;
    },
    onSuccess: () => {
      // Update all unread notifications in cache
      queryClient.setQueryData(
        ['notifications', 'user', user?.id],
        (oldData: ServerActionResult<Notification[]> | undefined) => {
          if (!oldData?.data) return oldData;
          
          return {
            ...oldData,
            data: oldData.data.map(notification => ({
              ...notification,
              status: 'read' as const,
              readAt: notification.status === 'unread' ? new Date().toISOString() : notification.readAt
            }))
          };
        }
      );
    },
    onError: (error: Error) => {
      console.error('Mark all notifications as read failed:', error);
    }
  });
}

// Delete notification mutation
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const result = await deleteNotification(notificationId, user.id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete notification');
      }
      return result;
    },
    onSuccess: (data, notificationId) => {
      // Remove notification from cache
      queryClient.setQueryData(
        ['notifications', 'user', user?.id],
        (oldData: ServerActionResult<Notification[]> | undefined) => {
          if (!oldData?.data) return oldData;
          
          return {
            ...oldData,
            data: oldData.data.filter(notification => notification.id !== notificationId)
          };
        }
      );
    },
    onError: (error: Error) => {
      console.error('Delete notification failed:', error);
    }
  });
}

// Create notification mutation (for admin/system use)
export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateNotificationParams) => {
      const result = await createNotification(params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create notification');
      }
      return result;
    },
    onSuccess: (data) => {
      // Invalidate notifications queries to refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // If we have the created notification, add it to the user's cache optimistically
      if (data.data) {
        const notification = data.data;
        queryClient.setQueryData(
          ['notifications', 'user', notification.userId],
          (oldData: ServerActionResult<Notification[]> | undefined) => {
            if (!oldData?.data) return oldData;
            return {
              ...oldData,
              data: [notification, ...oldData.data]
            };
          }
        );
      }
    },
    onError: (error: Error) => {
      console.error('Create notification failed:', error);
    }
  });
}

// Get admin notifications query
export function useAdminNotifications(filter?: string, search?: string, limit: number = 100) {
  return useQuery({
    queryKey: ['notifications', 'admin', filter, search, limit],
    queryFn: async () => {
      const result = await getAdminNotifications(filter, search, limit);
      if (!result.success) {
        throw new Error(result.error || 'Failed to get admin notifications');
      }
      return result;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: Error) => {
      // Don't retry on auth errors
      if (error.message.includes('not authenticated')) return false;
      return failureCount < 2;
    },
  });
}

// Helper hook to get notification state in a unified way
export function useNotificationState() {
  const { data, isLoading, error, isError } = useUserNotifications();
  
  const notifications = data?.data || [];
  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  
  return {
    notifications,
    unreadCount,
    loading: isLoading,
    error: error?.message || null,
    unauthorized: error?.message?.includes('not authenticated') || false,
  };
}

// Helper hook to get admin notification state
export function useAdminNotificationState(filter?: string, search?: string) {
  const { data, isLoading, error, isError } = useAdminNotifications(filter, search);
  
  return {
    notifications: data?.data || [],
    loading: isLoading,
    error: error?.message || null,
    unauthorized: error?.message?.includes('not authenticated') || false,
  };
}