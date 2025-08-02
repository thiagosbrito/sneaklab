"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import type { 
  Conversation, 
  Message,
  ConversationType,
  ConversationStatus 
} from '@/db/schema/messaging';
import {
  createConversationAction,
  getUserConversationsAction,
  getConversationWithMessagesAction,
  updateConversationStatusAction,
  sendMessageAction,
  getAdminConversationsAction
} from '@/lib/actions/messaging-actions';

// Server Action result types
interface ServerActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ===============================================
// CONVERSATION HOOKS
// ===============================================

/**
 * Create a new conversation
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      type: ConversationType;
      subject: string;
      initialMessage: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      relatedOrderId?: string;
    }) => {
      const result = await createConversationAction(
        params.type,
        params.subject,
        params.initialMessage,
        params.priority,
        params.relatedOrderId
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create conversation');
      }
      
      return result;
    },
    onSuccess: (data) => {
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      // Add new conversation to cache optimistically
      if (data.data) {
        queryClient.setQueryData(
          ['conversation', data.data.id],
          data
        );
      }
    },
    onError: (error: Error) => {
      console.error('Create conversation failed:', error);
    }
  });
}

/**
 * Get user conversations
 */
export function useUserConversations(
  limit: number = 20,
  status?: ConversationStatus
) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversations', 'user', user?.id, status, limit],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const result = await getUserConversationsAction(limit, status);
      if (!result.success) {
        throw new Error(result.error || 'Failed to get conversations');
      }
      return result;
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: Error) => {
      if (error.message.includes('not authenticated')) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Get conversation with messages
 */
export function useConversationWithMessages(conversationId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      if (!user || !conversationId) throw new Error('User not authenticated or conversation ID missing');
      
      const result = await getConversationWithMessagesAction(conversationId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to get conversation');
      }
      return result;
    },
    enabled: !!user && !!conversationId,
    staleTime: 10 * 1000, // 10 seconds (messages update frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: Error) => {
      if (error.message.includes('not authenticated') || error.message.includes('Access denied')) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Update conversation status (admin only)
 */
export function useUpdateConversationStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      conversationId: string;
      status: ConversationStatus;
      assignedAdminId?: string | null;
    }) => {
      const result = await updateConversationStatusAction(
        params.conversationId,
        params.status,
        params.assignedAdminId
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update conversation');
      }
      
      return result;
    },
    onSuccess: (data, variables) => {
      // Update conversation in cache
      queryClient.setQueryData(
        ['conversation', variables.conversationId],
        (oldData: ServerActionResult<Conversation & { messages: Message[] }> | undefined) => {
          if (!oldData?.data || !data.data) return oldData;
          
          return {
            ...oldData,
            data: {
              ...oldData.data,
              ...data.data
            }
          };
        }
      );
      
      // Invalidate conversations list to refresh
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: Error) => {
      console.error('Update conversation status failed:', error);
    }
  });
}

// ===============================================
// MESSAGE HOOKS
// ===============================================

/**
 * Send a message
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      conversationId: string;
      content: string;
      isInternal?: boolean;
    }) => {
      const result = await sendMessageAction(
        params.conversationId,
        params.content,
        params.isInternal || false
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to send message');
      }
      
      return result;
    },
    onSuccess: (data, variables) => {
      // Add message to conversation cache optimistically
      queryClient.setQueryData(
        ['conversation', variables.conversationId],
        (oldData: ServerActionResult<Conversation & { messages: Message[] }> | undefined) => {
          if (!oldData?.data || !data.data) return oldData;
          
          return {
            ...oldData,
            data: {
              ...oldData.data,
              lastMessageAt: new Date().toISOString(),
              messages: [data.data, ...oldData.data.messages]
            }
          };
        }
      );
      
      // Update conversations list to reflect last message time
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: Error) => {
      console.error('Send message failed:', error);
    }
  });
}

// ===============================================
// ADMIN HOOKS
// ===============================================

/**
 * Get admin conversations with filtering
 */
export function useAdminConversations(
  status?: ConversationStatus,
  type?: ConversationType,
  search?: string,
  limit: number = 50
) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversations', 'admin', status, type, search, limit],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const result = await getAdminConversationsAction(status, type, search, limit);
      if (!result.success) {
        throw new Error(result.error || 'Failed to get admin conversations');
      }
      return result;
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: Error) => {
      if (error.message.includes('not authenticated') || error.message.includes('Admin access required')) return false;
      return failureCount < 2;
    },
  });
}

// ===============================================
// HELPER HOOKS
// ===============================================

/**
 * Get conversation state for UI
 */
export function useConversationState(conversationId: string | null) {
  const { data, isLoading, error } = useConversationWithMessages(conversationId);
  
  const conversation = data?.data;
  const messages = conversation?.messages || [];
  const unreadCount = 0; // TODO: Calculate based on last read timestamps
  
  return {
    conversation,
    messages,
    unreadCount,
    loading: isLoading,
    error: error?.message || null,
    unauthorized: error?.message?.includes('not authenticated') || error?.message?.includes('Access denied') || false,
  };
}

/**
 * Get conversations list state for UI
 */
export function useConversationsState(
  status?: ConversationStatus,
  isAdmin: boolean = false
) {
  const userQuery = useUserConversations(20, status);
  const adminQuery = useAdminConversations(status, undefined, undefined, 50);
  
  const query = isAdmin ? adminQuery : userQuery;
  
  return {
    conversations: query.data?.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    unauthorized: query.error?.message?.includes('not authenticated') || query.error?.message?.includes('Admin access required') || false,
    refetch: query.refetch
  };
}

/**
 * Message composition state
 */
export function useMessageComposition(conversationId: string) {
  const sendMessageMutation = useSendMessage();
  
  const sendMessage = async (content: string, isInternal: boolean = false) => {
    if (!content.trim()) return;
    
    try {
      await sendMessageMutation.mutateAsync({
        conversationId,
        content: content.trim(),
        isInternal
      });
    } catch (error) {
      throw error;
    }
  };
  
  return {
    sendMessage,
    isSending: sendMessageMutation.isPending,
    error: sendMessageMutation.error?.message || null,
    reset: sendMessageMutation.reset
  };
}