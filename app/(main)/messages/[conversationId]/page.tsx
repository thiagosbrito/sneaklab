"use client";

import { use } from 'react';
import { ConversationPage } from '@/components/messaging/ConversationPage';

interface ConversationPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default function Conversation({ params }: ConversationPageProps) {
  const { conversationId } = use(params);
  return <ConversationPage conversationId={conversationId} />;
}