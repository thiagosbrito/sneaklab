"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMessaging } from '@/contexts/messaging';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageCircle, Package, AlertCircle, HelpCircle, Send } from 'lucide-react';
import type { ConversationType } from '@/db/schema/messaging';

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  relatedOrderId?: string;
}

export function NewConversationDialog({ 
  open, 
  onOpenChange, 
  relatedOrderId 
}: NewConversationDialogProps) {
  const router = useRouter();
  const { createConversation, isCreatingConversation } = useMessaging();
  
  const [formData, setFormData] = useState({
    type: (relatedOrderId ? 'order_inquiry' : 'support') as ConversationType,
    subject: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const conversationTypes = [
    {
      value: 'support' as ConversationType,
      label: 'Suporte Técnico',
      description: 'Ajuda com problemas técnicos ou dúvidas gerais',
      icon: <MessageCircle className="w-4 h-4" />
    },
    {
      value: 'order_inquiry' as ConversationType,
      label: 'Dúvida sobre Pedido',
      description: 'Perguntas sobre status, entrega ou produto',
      icon: <Package className="w-4 h-4" />
    },
    {
      value: 'complaint' as ConversationType,
      label: 'Reclamação',
      description: 'Problemas com produtos ou serviços',
      icon: <AlertCircle className="w-4 h-4" />
    },
    {
      value: 'general' as ConversationType,
      label: 'Geral',
      description: 'Outras questões ou sugestões',
      icon: <HelpCircle className="w-4 h-4" />
    }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Assunto é obrigatório';
    } else if (formData.subject.length < 5) {
      newErrors.subject = 'Assunto deve ter pelo menos 5 caracteres';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Mensagem é obrigatória';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Mensagem deve ter pelo menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await createConversation({
        type: formData.type,
        subject: formData.subject.trim(),
        initialMessage: formData.message.trim(),
        priority: formData.priority,
        relatedOrderId: relatedOrderId
      });

      // Reset form
      setFormData({
        type: 'support',
        subject: '',
        message: '',
        priority: 'medium',
      });
      setErrors({});
      
      // Close dialog
      onOpenChange(false);
      
      // Refresh the page to show the new conversation
      router.refresh();
    } catch (error) {
      console.error('Error creating conversation:', error);
      setErrors({ submit: 'Erro ao criar conversa. Tente novamente.' });
    }
  };

  const resetForm = () => {
    setFormData({
      type: relatedOrderId ? 'order_inquiry' : 'support',
      subject: '',
      message: '',
      priority: 'medium',
    });
    setErrors({});
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const selectedType = conversationTypes.find(type => type.value === formData.type);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Nova Conversa
          </DialogTitle>
          <DialogDescription>
            Inicie uma nova conversa conosco. Responderemos o mais breve possível.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Conversation Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Conversa</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: ConversationType) => 
                setFormData(prev => ({ ...prev, type: value }))
              }
              disabled={!!relatedOrderId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {conversationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      {type.icon}
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedType && (
              <p className="text-xs text-gray-500">
                {selectedType.description}
              </p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridade</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                setFormData(prev => ({ ...prev, priority: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Assunto</Label>
            <Input
              id="subject"
              placeholder="Descreva brevemente o assunto"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              className={errors.subject ? 'border-red-500' : ''}
            />
            {errors.subject && (
              <p className="text-xs text-red-500">{errors.subject}</p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              placeholder="Descreva sua dúvida, problema ou solicitação..."
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className={`min-h-[100px] ${errors.message ? 'border-red-500' : ''}`}
            />
            {errors.message && (
              <p className="text-xs text-red-500">{errors.message}</p>
            )}
          </div>

          {/* Related Order Info */}
          {relatedOrderId && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Relacionado ao Pedido #{relatedOrderId.slice(-8)}
                </span>
              </div>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-700 dark:text-red-300">{errors.submit}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isCreatingConversation}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isCreatingConversation}
              className="flex items-center gap-2"
            >
              {isCreatingConversation ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
              Enviar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}