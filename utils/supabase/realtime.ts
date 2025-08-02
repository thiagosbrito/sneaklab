"use client";

import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Create a separate client for realtime subscriptions
// This ensures realtime works independently of other client operations
export const realtimeClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

export type RealtimeNotification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order' | 'message' | 'system';
  status: 'unread' | 'read';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  related_id?: string;
  related_type?: string;
  metadata?: any;
  created_at: string;
  read_at?: string;
  expires_at?: string;
};