"use client";

import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User, Shield, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Message } from '@/db/schema/messaging';

interface MessagesListProps {
  messages: Message[];
  conversationId: string;
}

export function MessagesList({ messages, conversationId }: MessagesListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma mensagem ainda
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            As mensagens desta conversa aparecerão aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3 p-4 min-h-full">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isFirst={index === 0 || messages[index - 1]?.senderId !== message.senderId}
              isLast={index === messages.length - 1 || messages[index + 1]?.senderId !== message.senderId}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message & {
    sender?: { id: string; fullName: string | null; role: string };
  };
  isFirst: boolean;
  isLast: boolean;
}

function MessageBubble({ message, isFirst, isLast }: MessageBubbleProps) {
  const isFromAdmin = message.senderType === 'admin';
  const isInternal = message.isInternal;
  
  const senderName = message.sender?.fullName || (isFromAdmin ? 'Suporte' : 'Você');
  const senderInitials = senderName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const messageTime = format(new Date(message.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  const relativeTime = formatDistanceToNow(new Date(message.createdAt), { 
    addSuffix: true, 
    locale: ptBR 
  });

  return (
    <div className={`flex gap-3 ${isFromAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
      {/* Avatar - only show on first message in sequence */}
      <div className="flex-shrink-0">
        {isFirst ? (
          <Avatar className={`w-8 h-8 ${isFromAdmin ? 'bg-purple-100 dark:bg-purple-900' : 'bg-blue-100 dark:bg-blue-900'}`}>
            <AvatarFallback className={`${
              isFromAdmin 
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' 
                : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
            } text-xs font-semibold`}>
              {isFromAdmin ? <Shield className="w-4 h-4" /> : senderInitials}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-8 h-8" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[70%] ${isFromAdmin ? 'mr-12' : 'ml-12'}`}>
        {/* Sender Name - only show on first message in sequence */}
        {isFirst && (
          <div className={`flex items-center gap-2 mb-1 ${isFromAdmin ? '' : 'justify-end'}`}>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {senderName}
            </span>
            {isFromAdmin && (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                <Shield className="w-3 h-3 mr-1" />
                Suporte
              </Badge>
            )}
            {isInternal && (
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                Interno
              </Badge>
            )}
          </div>
        )}

        {/* Message Bubble */}
        <div className={`relative p-3 rounded-lg ${
          isFromAdmin 
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' 
            : 'bg-purple-600 text-white'
        } ${isInternal ? 'border-2 border-orange-200 dark:border-orange-800' : ''}`}>
          {/* Message Content */}
          <div className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* Message Status */}
          {message.status !== 'sent' && (
            <div className={`mt-2 text-xs ${isFromAdmin ? 'text-gray-500' : 'text-purple-200'}`}>
              Status: {getStatusLabel(message.status)}
            </div>
          )}
        </div>

        {/* Timestamp - only show on last message in sequence */}
        {isLast && (
          <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400 ${
            isFromAdmin ? '' : 'justify-end'
          }`}>
            <Clock className="w-3 h-3" />
            <span title={messageTime}>{relativeTime}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'sent': return 'Enviada';
    case 'delivered': return 'Entregue';
    case 'read': return 'Lida';
    case 'failed': return 'Falhou';
    default: return status;
  }
}