"use client";

import { useAuth } from '@/contexts/auth';
import { useConversationState } from '@/hooks/queries/useMessaging';
import { ConversationView } from './ConversationView';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MessageCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import PageContainer from '../ui/PageContainer';

type ConversationPageProps = {
  conversationId: string;
}

export function ConversationPage({ conversationId }: ConversationPageProps) {
  const { user } = useAuth();
  const { conversation, messages, loading, error, unauthorized } = useConversationState(conversationId);

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-md mx-auto pt-12">
          <Card>
            <CardHeader className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto text-gray-400" />
              <CardTitle>Login Necessário</CardTitle>
              <CardDescription>
                Você precisa estar logado para acessar esta conversa.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Handle unauthorized access
  if (unauthorized) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-md mx-auto pt-12">
          <Card>
            <CardHeader className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-red-400" />
              <CardTitle>Acesso Negado</CardTitle>
              <CardDescription>
                Você não tem permissão para visualizar esta conversa.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/messages">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar às Mensagens
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-md mx-auto pt-12">
          <Card>
            <CardHeader className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-red-400" />
              <CardTitle>Erro</CardTitle>
              <CardDescription>
                Não foi possível carregar a conversa: {error}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/messages">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar às Mensagens
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-md mx-auto pt-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando conversa...</p>
        </div>
      </div>
    );
  }

  // Handle conversation not found
  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-md mx-auto pt-12">
          <Card>
            <CardHeader className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto text-gray-400" />
              <CardTitle>Conversa Não Encontrada</CardTitle>
              <CardDescription>
                A conversa que você está procurando não existe ou foi removida.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/messages">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar às Mensagens
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main chat interface
  return (
    <PageContainer>
      <div className="flex flex-col flex-1 h-full bg-gray-50 dark:bg-gray-900 p-4">
        {/* Fixed Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3">
              <Link href="/messages">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
              </Link>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {conversation.subject}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {conversation.type.replace('_', ' ')} • {conversation.status}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Conversation Content - Takes remaining height */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto h-full">
            <ConversationView
              conversation={conversation}
              messages={messages}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}