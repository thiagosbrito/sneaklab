"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Loader2 } from 'lucide-react';

interface MessageComposerProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageComposer({ 
  onSendMessage, 
  isLoading = false, 
  disabled = false,
  placeholder = "Digite sua mensagem..."
}: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Por favor, digite uma mensagem');
      return;
    }

    if (message.trim().length < 3) {
      setError('A mensagem deve ter pelo menos 3 caracteres');
      return;
    }

    try {
      setError('');
      await onSendMessage(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Erro ao enviar mensagem. Tente novamente.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && !disabled && message.trim()) {
        handleSubmit(e);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mt-auto">
      <form onSubmit={handleSubmit} className="p-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading || disabled}
              className={`min-h-[44px] max-h-32 resize-none border-0 focus:ring-1 focus:ring-purple-500 ${error ? 'ring-1 ring-red-500' : ''}`}
              maxLength={1000}
              rows={1}
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading || disabled || !message.trim()}
            size="sm"
            className="shrink-0 h-11 px-3 bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-gray-500">
            {error ? (
              <span className="text-red-500">{error}</span>
            ) : (
              <>
                <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Enter</kbd> para enviar, 
                <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs ml-1">Shift+Enter</kbd> para nova linha
              </>
            )}
          </div>
          
          <span className="text-xs text-gray-400">
            {message.length}/1000
          </span>
        </div>
      </form>
    </div>
  );
}