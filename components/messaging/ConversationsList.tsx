"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Clock, User, Package } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Conversation } from '@/db/schema/messaging';

interface ConversationsListProps {
  conversations: Conversation[];
  showCustomerInfo?: boolean;
}

export function ConversationsList({ conversations, showCustomerInfo = false }: ConversationsListProps) {
  if (conversations.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <MessageCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Nenhuma conversa encontrada
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Quando você iniciar uma conversa, ela aparecerá aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => (
        <ConversationCard
          key={conversation.id}
          conversation={conversation}
          showCustomerInfo={showCustomerInfo}
        />
      ))}
    </div>
  );
}

interface ConversationCardProps {
  conversation: Conversation & {
    customer?: { id: string; fullName: string | null; phone: string | null };
    relatedOrder?: { id: string; status: string; totalAmount: string };
  };
  showCustomerInfo?: boolean;
}

function ConversationCard({ conversation, showCustomerInfo }: ConversationCardProps) {
  const statusConfig = getStatusConfig(conversation.status);
  const typeConfig = getTypeConfig(conversation.type);
  const priorityConfig = getPriorityConfig(conversation.priority);

  const customerName = conversation.customer?.fullName || 'Cliente';
  const customerInitials = customerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="w-12 h-12 bg-purple-100 dark:bg-purple-900">
            <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-semibold">
              {showCustomerInfo ? customerInitials : <User className="w-6 h-6" />}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {showCustomerInfo && (
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {customerName}
                    </span>
                  )}
                  <Badge variant="outline" className={typeConfig.className}>
                    {typeConfig.icon}
                    {typeConfig.label}
                  </Badge>
                  <Badge variant={statusConfig.variant} className={statusConfig.className}>
                    {statusConfig.label}
                  </Badge>
                  {conversation.priority !== 'medium' && (
                    <Badge variant="outline" className={priorityConfig.className}>
                      {priorityConfig.label}
                    </Badge>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
                  {conversation.subject}
                </h3>

                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {conversation.lastMessageAt && formatDistanceToNow(new Date(conversation.lastMessageAt), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </div>
                  
                  {conversation.relatedOrder && (
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      Pedido #{conversation.relatedOrder.id.slice(-8)}
                    </div>
                  )}
                </div>

                {/* Related Order Info */}
                {conversation.relatedOrder && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Pedido Relacionado
                      </span>
                      <Badge variant="outline">
                        {conversation.relatedOrder.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        #{conversation.relatedOrder.id.slice(-8)}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        R$ {parseFloat(conversation.relatedOrder.totalAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <Link href={`/messages/${conversation.id}`}>
                <Button variant="outline" size="sm">
                  Ver Conversa
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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
        label: 'Sua Vez'
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