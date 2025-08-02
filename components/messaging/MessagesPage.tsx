"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { useMessaging } from '@/contexts/messaging';
import { ConversationsList } from './ConversationsList';
import { NewConversationDialog } from './NewConversationDialog';
import { Button } from '@/components/ui/button';
import { Plus, MessageCircle, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageContainer from '@/components/ui/PageContainer';
import type { ConversationStatus } from '@/db/schema/messaging';

export function MessagesPage() {
  const { user } = useAuth();
  const { conversations, loading, isAdmin } = useMessaging();
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | 'all'>('all');

  // Redirect if not authenticated
  if (!user) {
    return (
      <PageContainer
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Mensagens', current: true }
        ]}
        title="Mensagens"
        description="Suas conversas e mensagens de suporte"
        background="gray"
      >
        <div className="flex items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto text-gray-400" />
              <CardTitle>Login Necessário</CardTitle>
              <CardDescription>
                Você precisa estar logado para acessar suas mensagens.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </PageContainer>
    );
  }

  // Filter conversations based on status
  const filteredConversations = statusFilter === 'all' 
    ? conversations 
    : conversations.filter(conv => conv.status === statusFilter);

  // Get conversation counts by status
  const statusCounts = {
    open: conversations.filter(conv => conv.status === 'open').length,
    waiting_admin: conversations.filter(conv => conv.status === 'waiting_admin').length,
    waiting_customer: conversations.filter(conv => conv.status === 'waiting_customer').length,
    closed: conversations.filter(conv => conv.status === 'closed').length,
  };

  return (
    <PageContainer>

      <div className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Mensagens
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Gerencie suas conversas e mensagens de suporte
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowNewConversation(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nova Conversa
                </Button>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Todas
                <Badge variant="secondary" className="ml-1">
                  {conversations.length}
                </Badge>
              </Button>
              
              <Button
                variant={statusFilter === 'open' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('open')}
                className="flex items-center gap-2"
              >
                Abertas
                {statusCounts.open > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {statusCounts.open}
                  </Badge>
                )}
              </Button>
              
              <Button
                variant={statusFilter === 'waiting_admin' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('waiting_admin')}
                className="flex items-center gap-2"
              >
                Aguardando Resposta
                {statusCounts.waiting_admin > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {statusCounts.waiting_admin}
                  </Badge>
                )}
              </Button>
              
              <Button
                variant={statusFilter === 'waiting_customer' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('waiting_customer')}
                className="flex items-center gap-2"
              >
                Sua Vez
                {statusCounts.waiting_customer > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {statusCounts.waiting_customer}
                  </Badge>
                )}
              </Button>
              
              <Button
                variant={statusFilter === 'closed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('closed')}
                className="flex items-center gap-2"
              >
                Fechadas
                {statusCounts.closed > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {statusCounts.closed}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredConversations.length > 0 ? (
            <ConversationsList 
              conversations={filteredConversations}
              showCustomerInfo={isAdmin}
            />
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <MessageCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <CardTitle className="text-xl mb-2">
                  {statusFilter === 'all' 
                    ? 'Nenhuma conversa encontrada'
                    : `Nenhuma conversa ${getStatusLabel(statusFilter)}`
                  }
                </CardTitle>
                <CardDescription className="mb-6">
                  {statusFilter === 'all'
                    ? 'Comece uma nova conversa para entrar em contato conosco.'
                    : 'Não há conversas com este status no momento.'
                  }
                </CardDescription>
                {statusFilter === 'all' && (
                  <Button onClick={() => setShowNewConversation(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Iniciar Conversa
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* New Conversation Dialog */}
        <NewConversationDialog
          open={showNewConversation}
          onOpenChange={setShowNewConversation}
        />
      </div>
    </PageContainer>
  );
}

function getStatusLabel(status: ConversationStatus | 'all'): string {
  switch (status) {
    case 'open': return 'abertas';
    case 'waiting_admin': return 'aguardando resposta';
    case 'waiting_customer': return 'aguardando sua resposta';
    case 'closed': return 'fechadas';
    default: return '';
  }
}