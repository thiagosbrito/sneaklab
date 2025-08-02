"use client";

import { useConversationManager } from '@/contexts/messaging';
import { MessageComposer } from './MessageComposer';
import { MessagesList } from './MessagesList';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Package, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Conversation, Message } from '@/db/schema/messaging';

interface ConversationViewProps {
  conversation: Conversation & {
    customer?: { id: string; fullName: string | null; phone: string | null };
    relatedOrder?: { id: string; status: string; totalAmount: string };
  };
  messages: Message[];
}

export function ConversationView({ conversation, messages }: ConversationViewProps) {
  const { sendMessage, isSending } = useConversationManager(conversation.id);

  const statusConfig = getStatusConfig(conversation.status);
  const typeConfig = getTypeConfig(conversation.type);
  const priorityConfig = getPriorityConfig(conversation.priority);

  const customerName = conversation.customer?.fullName || 'Cliente';
  const customerInitials = customerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const isConversationActive = conversation.status !== 'closed';

  return (
    <div className="flex flex-col h-full p-4">
      {/* Compact Conversation Info */}
      {conversation.relatedOrder && (
        <div className="mb-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Pedido #{conversation.relatedOrder.id.slice(-8)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {conversation.relatedOrder.status}
              </Badge>
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                €{parseFloat(conversation.relatedOrder.totalAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Status Badge */}
      <div className="mb-3 flex items-center justify-center">
        <Badge variant={statusConfig.variant} className={statusConfig.className}>
          {statusConfig.label}
        </Badge>
      </div>

      {/* Messages - Scrollable Area */}
      <div className="flex-1 overflow-hidden min-h-0">
        <MessagesList 
          messages={messages}
          conversationId={conversation.id}
        />
      </div>

      {/* Message Composer - Fixed at Bottom */}
      <div className="pt-4 pb-6">
        {isConversationActive ? (
          <MessageComposer
            onSendMessage={sendMessage}
            isLoading={isSending}
            disabled={false}
          />
        ) : (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
            <MessageCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Conversa Fechada
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Esta conversa foi fechada.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'open':
      return {
        variant: 'default' as const,
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        label: 'Aberta'
      };
    case 'waiting_admin':
      return {
        variant: 'secondary' as const,
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        label: 'Aguardando Resposta'
      };
    case 'waiting_customer':
      return {
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        label: 'Sua Vez de Responder'
      };
    case 'closed':
      return {
        variant: 'outline' as const,
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        label: 'Fechada'
      };
    default:
      return {
        variant: 'outline' as const,
        className: '',
        label: status
      };
  }
}

function getTypeConfig(type: string) {
  switch (type) {
    case 'support':
      return {
        icon: <MessageCircle className="w-3 h-3 mr-1" />,
        label: 'Suporte',
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      };
    case 'order_inquiry':
      return {
        icon: <Package className="w-3 h-3 mr-1" />,
        label: 'Pedido',
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      };
    case 'complaint':
      return {
        icon: <MessageCircle className="w-3 h-3 mr-1" />,
        label: 'Reclamação',
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      };
    case 'general':
      return {
        icon: <MessageCircle className="w-3 h-3 mr-1" />,
        label: 'Geral',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      };
    case 'order_update':
      return {
        icon: <Package className="w-3 h-3 mr-1" />,
        label: 'Atualização',
        className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      };
    default:
      return {
        icon: <MessageCircle className="w-3 h-3 mr-1" />,
        label: type,
        className: ''
      };
  }
}

function getPriorityConfig(priority: string) {
  switch (priority) {
    case 'urgent':
      return {
        label: 'Urgente',
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      };
    case 'high':
      return {
        label: 'Alta',
        className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      };
    case 'low':
      return {
        label: 'Baixa',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      };
    default:
      return {
        label: 'Média',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      };
  }
}