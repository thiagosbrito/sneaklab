"use client";

import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { realtimeClient, type RealtimeNotification } from '@/utils/supabase/realtime';
import { useAuth } from './auth';
import { 
  useNotificationState,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useCreateNotification
} from '@/hooks/queries/useNotifications';
import { useQueryClient } from '@tanstack/react-query';
import type { Notification } from '@/db/schema';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  addNotification: (notification: Omit<RealtimeNotification, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Use React Query hooks
  const { notifications, unreadCount, loading, error } = useNotificationState();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const createNotificationMutation = useCreateNotification();

  // Set up realtime subscription only
  // React Query handles the data fetching

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = realtimeClient
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Notification realtime update:', payload);
          
          // Invalidate and refetch notifications when we get realtime updates
          queryClient.invalidateQueries({ 
            queryKey: ['notifications', 'user', user.id] 
          });
        }
      )
      .subscribe((status) => {
        console.log('Notifications realtime status:', status);
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  // Wrapper functions that use React Query mutations
  const markAsRead = useCallback(async (notificationId: string) => {
    await markAsReadMutation.mutateAsync(notificationId);
  }, [markAsReadMutation]);

  const markAllAsRead = useCallback(async () => {
    await markAllAsReadMutation.mutateAsync();
  }, [markAllAsReadMutation]);

  const deleteNotificationWrapper = useCallback(async (notificationId: string) => {
    await deleteNotificationMutation.mutateAsync(notificationId);
  }, [deleteNotificationMutation]);

  const addNotification = useCallback(async (
    notification: Omit<RealtimeNotification, 'id' | 'created_at' | 'user_id'>
  ) => {
    if (!user) return;
    
    await createNotificationMutation.mutateAsync({
      ...notification,
      userId: user.id,
    });
  }, [user, createNotificationMutation]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification: deleteNotificationWrapper,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}