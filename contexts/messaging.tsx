"use client";

import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { realtimeClient } from '@/utils/supabase/realtime';
import { useAuth } from './auth';
import { 
  useConversationsState,
  useCreateConversation,
  useUpdateConversationStatus,
  useMessageComposition
} from '@/hooks/queries/useMessaging';
import { useQueryClient } from '@tanstack/react-query';
import type { Conversation, Message, ConversationType, ConversationStatus } from '@/db/schema/messaging';

interface MessagingContextType {
  // Conversations
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  
  // Actions
  createConversation: (params: {
    type: ConversationType;
    subject: string;
    initialMessage: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    relatedOrderId?: string;
  }) => Promise<void>;
  
  updateConversationStatus: (
    conversationId: string,
    status: ConversationStatus,
    assignedAdminId?: string | null
  ) => Promise<void>;
  
  // State
  isCreatingConversation: boolean;
  isUpdatingStatus: boolean;
  
  // Admin functions
  isAdmin: boolean;
  refreshConversations: () => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Determine if user is admin (you might want to get this from user profile)
  const isAdmin = false; // TODO: Get from user profile context
  
  // Use conversation state
  const { 
    conversations, 
    loading, 
    error, 
    refetch: refreshConversations 
  } = useConversationsState(undefined, isAdmin);
  
  // Mutations
  const createConversationMutation = useCreateConversation();
  const updateStatusMutation = useUpdateConversationStatus();

  // Set up realtime subscription for conversations
  useEffect(() => {
    if (!user) return;

    const conversationsChannel = realtimeClient
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          // Filter based on user role - customers see their own, admins see all
          filter: isAdmin ? undefined : `customer_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Conversation realtime update:', payload);
          
          // Invalidate conversations queries to refetch
          queryClient.invalidateQueries({ 
            queryKey: ['conversations'] 
          });
        }
      )
      .subscribe((status) => {
        console.log('Conversations realtime status:', status);
      });

    return () => {
      conversationsChannel.unsubscribe();
    };
  }, [user, isAdmin, queryClient]);

  // Set up realtime subscription for messages
  useEffect(() => {
    if (!user) return;

    const messagesChannel = realtimeClient
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('Message realtime update:', payload);
          
          // Invalidate specific conversation and conversations list
          const newMessage = payload.new as Message;
          if (newMessage.conversationId) {
            queryClient.invalidateQueries({ 
              queryKey: ['conversation', newMessage.conversationId] 
            });
            queryClient.invalidateQueries({ 
              queryKey: ['conversations'] 
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Messages realtime status:', status);
      });

    return () => {
      messagesChannel.unsubscribe();
    };
  }, [user, queryClient]);

  // Wrapper functions for mutations
  const createConversation = useCallback(async (params: {
    type: ConversationType;
    subject: string;
    initialMessage: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    relatedOrderId?: string;
  }) => {
    await createConversationMutation.mutateAsync(params);
  }, [createConversationMutation]);

  const updateConversationStatus = useCallback(async (
    conversationId: string,
    status: ConversationStatus,
    assignedAdminId?: string | null
  ) => {
    await updateStatusMutation.mutateAsync({
      conversationId,
      status,
      assignedAdminId
    });
  }, [updateStatusMutation]);

  const value: MessagingContextType = {
    // Data
    conversations,
    loading,
    error,
    
    // Actions
    createConversation,
    updateConversationStatus,
    
    // State
    isCreatingConversation: createConversationMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    
    // Admin
    isAdmin,
    refreshConversations,
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
}

// Helper hook for individual conversation management
export function useConversationManager(conversationId: string | null) {
  const messageComposition = useMessageComposition(conversationId || '');
  
  return {
    // Message sending
    sendMessage: messageComposition.sendMessage,
    isSending: messageComposition.isSending,
    sendError: messageComposition.error,
    resetSendError: messageComposition.reset,
  };
}