"use server";

import { createClient } from '@/utils/supabase/server';
import { db } from '@/db';
import { conversations, messages, messageAttachments, profiles, orders } from '@/db/schema';
import { eq, desc, and, or, ilike, isNull, sql } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';
import { sendMessageNotification, sendAdminNotification } from '@/lib/notifications';
import { getOrCreateUserProfile } from './auth-actions';

// Import Drizzle-generated types
import type { 
  Conversation, 
  NewConversation, 
  Message, 
  NewMessage,
  MessageAttachment,
  NewMessageAttachment,
  ConversationType,
  ConversationStatus,
  SenderType
} from '@/db/schema/messaging';

interface ServerActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ===============================================
// CONVERSATION ACTIONS
// ===============================================

/**
 * Create a new conversation (for customers)
 */
export async function createConversationAction(
  type: ConversationType,
  subject: string,
  initialMessage: string,
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
  relatedOrderId?: string
): Promise<ServerActionResult<Conversation & { messages: Message[] }>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Get or create user profile
    const profile = await getOrCreateUserProfile(user.id, user.email || undefined);
    if (!profile) {
      return { success: false, error: 'Failed to get user profile' };
    }

    // Only customers can create conversations (admins can respond)
    if (profile.role !== 'CUSTOMER') {
      return { success: false, error: 'Only customers can create conversations' };
    }

    // Validate related order if provided
    if (relatedOrderId) {
      const relatedOrder = await db.query.orders.findFirst({
        where: and(
          eq(orders.id, relatedOrderId),
          eq(orders.userId, user.id)
        )
      });
      
      if (!relatedOrder) {
        return { success: false, error: 'Related order not found or access denied' };
      }
    }

    const now = new Date();

    // Create conversation
    const [newConversation] = await db
      .insert(conversations)
      .values({
        customerId: user.id,
        type,
        subject: subject.trim(),
        priority,
        relatedOrderId: relatedOrderId || null,
        status: 'open',
        lastMessageAt: now,
        customerLastReadAt: now,
      })
      .returning();

    // Create initial message
    const [initialMsg] = await db
      .insert(messages)
      .values({
        conversationId: newConversation.id,
        senderId: user.id,
        content: initialMessage.trim(),
        senderType: 'customer',
        status: 'sent',
      })
      .returning();

    // Send admin notification about new conversation
    await sendAdminNotification(
      'New Customer Message',
      `${profile.fullName || user.email} started a new ${type.replace('_', ' ')} conversation: "${subject}"`,
      'message',
      priority,
      newConversation.id,
      'conversation',
      {
        conversationType: type,
        customerName: profile.fullName,
        subject,
        hasRelatedOrder: !!relatedOrderId
      }
    );

    // Revalidate cache
    revalidateTag('conversations');
    revalidateTag(`conversation-${newConversation.id}`);

    return {
      success: true,
      data: {
        ...newConversation,
        messages: [initialMsg]
      }
    };

  } catch (error) {
    console.error('Create conversation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create conversation'
    };
  }
}

/**
 * Create a new conversation with a customer (for admins)
 */
export async function createAdminConversationAction(
  customerId: string,
  type: ConversationType,
  subject: string,
  initialMessage: string,
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
  relatedOrderId?: string
): Promise<ServerActionResult<Conversation & { messages: Message[] }>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Get admin profile
    const profile = await getOrCreateUserProfile(user.id, user.email || undefined);
    if (!profile) {
      return { success: false, error: 'Failed to get user profile' };
    }

    // Only admins can create conversations for customers
    if (profile.role !== 'ADMIN') {
      return { success: false, error: 'Admin access required' };
    }

    // Verify the customer exists and is actually a customer
    const customer = await db.query.profiles.findFirst({
      where: eq(profiles.id, customerId)
    });

    if (!customer) {
      return { success: false, error: 'Customer not found' };
    }

    if (customer.role !== 'CUSTOMER') {
      return { success: false, error: 'Selected user is not a customer' };
    }

    // Validate related order if provided
    if (relatedOrderId) {
      const relatedOrder = await db.query.orders.findFirst({
        where: eq(orders.id, relatedOrderId)
      });
      
      if (!relatedOrder) {
        return { success: false, error: 'Related order not found' };
      }
    }

    const now = new Date();

    // Create conversation with customer as the customer_id
    const [newConversation] = await db
      .insert(conversations)
      .values({
        customerId, // The selected customer
        assignedAdminId: user.id, // Admin who created it
        type,
        subject: subject.trim(),
        priority,
        relatedOrderId: relatedOrderId || null,
        status: 'waiting_customer', // Admin initiated, waiting for customer response
        lastMessageAt: now,
        adminLastReadAt: now,
      })
      .returning();

    // Create initial message from admin
    const [initialMsg] = await db
      .insert(messages)
      .values({
        conversationId: newConversation.id,
        senderId: user.id, // Admin sending the message
        content: initialMessage.trim(),
        senderType: 'admin',
        status: 'sent',
      })
      .returning();

    // Send notification to customer about new conversation
    await sendMessageNotification(
      customerId,
      'New Message from Support',
      `You have a new ${type.replace('_', ' ')} message: "${subject}"`,
      priority,
      newConversation.id
    );

    // Revalidate cache
    revalidateTag('conversations');
    revalidateTag(`conversation-${newConversation.id}`);

    return {
      success: true,
      data: {
        ...newConversation,
        messages: [initialMsg]
      }
    };

  } catch (error) {
    console.error('Create admin conversation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create conversation'
    };
  }
}

/**
 * Get conversations for current user
 */
export async function getUserConversationsAction(
  limit: number = 20,
  status?: ConversationStatus
): Promise<ServerActionResult<Conversation[]>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    const profile = await getOrCreateUserProfile(user.id, user.email || undefined);
    if (!profile) {
      return { success: false, error: 'Failed to get user profile' };
    }

    let whereCondition;
    
    if (profile.role === 'ADMIN') {
      // Admins can see all conversations
      whereCondition = status ? eq(conversations.status, status) : undefined;
    } else {
      // Customers only see their own conversations
      whereCondition = status 
        ? and(eq(conversations.customerId, sql`${user.id}::uuid`), eq(conversations.status, status))
        : eq(conversations.customerId, sql`${user.id}::uuid`);
    }

    const userConversations = await db.query.conversations.findMany({
      where: whereCondition,
      orderBy: [desc(conversations.lastMessageAt)],
      limit,
      with: {
        customer: {
          columns: { id: true, fullName: true, phone: true }
        },
        assignedAdmin: {
          columns: { id: true, fullName: true }
        },
        relatedOrder: {
          columns: { id: true, status: true, totalAmount: true }
        }
      }
    });

    return { success: true, data: userConversations };

  } catch (error) {
    console.error('Get user conversations error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get conversations'
    };
  }
}

/**
 * Get conversation with messages
 */
export async function getConversationWithMessagesAction(
  conversationId: string
): Promise<ServerActionResult<Conversation & { messages: Message[] }>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    const profile = await getOrCreateUserProfile(user.id, user.email || undefined);
    if (!profile) {
      return { success: false, error: 'Failed to get user profile' };
    }

    const conversation = await db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
      with: {
        customer: {
          columns: { id: true, fullName: true, phone: true }
        },
        assignedAdmin: {
          columns: { id: true, fullName: true }
        },
        relatedOrder: {
          columns: { id: true, status: true, totalAmount: true }
        },
        messages: {
          orderBy: [desc(messages.createdAt)],
          with: {
            sender: {
              columns: { id: true, fullName: true, role: true }
            },
            attachments: true
          }
        }
      }
    });

    if (!conversation) {
      return { success: false, error: 'Conversation not found' };
    }

    // Check access permissions
    const hasAccess = profile.role === 'ADMIN' || 
                     conversation.customerId === user.id || 
                     conversation.assignedAdminId === user.id;

    if (!hasAccess) {
      return { success: false, error: 'Access denied' };
    }

    // Filter internal messages for customers
    if (profile.role !== 'ADMIN') {
      conversation.messages = conversation.messages.filter(msg => !msg.isInternal);
    }

    // Update last read timestamp
    const updateField = profile.role === 'ADMIN' ? 'adminLastReadAt' : 'customerLastReadAt';
    await db
      .update(conversations)
      .set({ [updateField]: new Date() })
      .where(eq(conversations.id, conversationId));

    return { success: true, data: conversation };

  } catch (error) {
    console.error('Get conversation with messages error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get conversation'
    };
  }
}

/**
 * Update conversation status (admin only)
 */
export async function updateConversationStatusAction(
  conversationId: string,
  status: ConversationStatus,
  assignedAdminId?: string | null
): Promise<ServerActionResult<Conversation>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    const profile = await getOrCreateUserProfile(user.id, user.email || undefined);
    if (!profile || profile.role !== 'ADMIN') {
      return { success: false, error: 'Admin access required' };
    }

    const updateData: Partial<Conversation> = {
      status,
      updatedAt: new Date(),
    };

    if (assignedAdminId !== undefined) {
      updateData.assignedAdminId = assignedAdminId;
    }

    if (status === 'closed') {
      updateData.closedAt = new Date();
    }

    const [updatedConversation] = await db
      .update(conversations)
      .set(updateData)
      .where(eq(conversations.id, conversationId))
      .returning();

    if (!updatedConversation) {
      return { success: false, error: 'Conversation not found' };
    }

    // Revalidate cache
    revalidateTag('conversations');
    revalidateTag(`conversation-${conversationId}`);

    return { success: true, data: updatedConversation };

  } catch (error) {
    console.error('Update conversation status error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update conversation'
    };
  }
}

// ===============================================
// MESSAGE ACTIONS
// ===============================================

/**
 * Send a message in a conversation
 */
export async function sendMessageAction(
  conversationId: string,
  content: string,
  isInternal: boolean = false
): Promise<ServerActionResult<Message>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    const profile = await getOrCreateUserProfile(user.id, user.email || undefined);
    if (!profile) {
      return { success: false, error: 'Failed to get user profile' };
    }

    // Get conversation and check access
    const conversation = await db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
      with: {
        customer: {
          columns: { id: true, fullName: true }
        }
      }
    });

    if (!conversation) {
      return { success: false, error: 'Conversation not found' };
    }

    // Check access permissions
    const hasAccess = profile.role === 'ADMIN' || 
                     conversation.customerId === user.id || 
                     conversation.assignedAdminId === user.id;

    if (!hasAccess) {
      return { success: false, error: 'Access denied' };
    }

    // Only admins can send internal messages
    if (isInternal && profile.role !== 'ADMIN') {
      return { success: false, error: 'Only admins can send internal messages' };
    }

    const senderType: SenderType = profile.role === 'ADMIN' ? 'admin' : 'customer';
    const now = new Date();

    // Create message
    const [newMessage] = await db
      .insert(messages)
      .values({
        conversationId,
        senderId: user.id,
        content: content.trim(),
        senderType,
        isInternal,
        status: 'sent',
      })
      .returning();

    // Update conversation last message timestamp and status
    const updateData: Partial<Conversation> = {
      lastMessageAt: now,
      updatedAt: now,
    };

    // Update read timestamps and status based on sender
    if (profile.role === 'ADMIN') {
      updateData.adminLastReadAt = now;
      updateData.status = isInternal ? conversation.status : 'waiting_customer';
    } else {
      updateData.customerLastReadAt = now;
      updateData.status = 'waiting_admin';
    }

    await db
      .update(conversations)
      .set(updateData)
      .where(eq(conversations.id, conversationId));

    // Send notifications (only for non-internal messages)
    if (!isInternal) {
      if (profile.role === 'ADMIN') {
        // Admin replied to customer
        await sendMessageNotification(
          conversation.customerId,
          'New Reply from Support',
          `You have a new reply in your ${conversation.type.replace('_', ' ')} conversation: "${conversation.subject}"`,
          'medium',
          conversationId
        );
      } else {
        // Customer sent message to admin
        await sendAdminNotification(
          'New Customer Reply',
          `${conversation.customer?.fullName || 'Customer'} replied in conversation: "${conversation.subject}"`,
          'message',
          'medium',
          conversationId,
          'conversation',
          {
            customerName: conversation.customer?.fullName,
            conversationType: conversation.type
          }
        );
      }
    }

    // Revalidate cache
    revalidateTag('conversations');
    revalidateTag(`conversation-${conversationId}`);
    revalidateTag(`messages-${conversationId}`);

    return { success: true, data: newMessage };

  } catch (error) {
    console.error('Send message error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message'
    };
  }
}

/**
 * Get admin conversations with filtering
 */
export async function getAdminConversationsAction(
  status?: ConversationStatus,
  type?: ConversationType,
  search?: string,
  limit: number = 50
): Promise<ServerActionResult<Conversation[]>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    const profile = await getOrCreateUserProfile(user.id, user.email || undefined);
    if (!profile || profile.role !== 'ADMIN') {
      return { success: false, error: 'Admin access required' };
    }

    // Build where conditions
    const conditions = [];
    if (status) conditions.push(eq(conversations.status, status));
    if (type) conditions.push(eq(conversations.type, type));

    let whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const adminConversations = await db.query.conversations.findMany({
      where: whereCondition,
      orderBy: [desc(conversations.lastMessageAt)],
      limit,
      with: {
        customer: {
          columns: { id: true, fullName: true, phone: true }
        },
        assignedAdmin: {
          columns: { id: true, fullName: true }
        },
        relatedOrder: {
          columns: { id: true, status: true, totalAmount: true }
        }
      }
    });

    // Apply search filter if provided
    let filteredConversations = adminConversations;
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      filteredConversations = adminConversations.filter(conv =>
        conv.subject.toLowerCase().includes(searchLower) ||
        conv.customer?.fullName?.toLowerCase().includes(searchLower) ||
        conv.customer?.phone?.includes(search)
      );
    }

    return { success: true, data: filteredConversations };

  } catch (error) {
    console.error('Get admin conversations error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get admin conversations'
    };
  }
}