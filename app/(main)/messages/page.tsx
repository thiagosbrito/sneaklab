import { Metadata } from 'next';
import { MessagesPage } from '@/components/messaging/MessagesPage';

export const metadata: Metadata = {
  title: 'Mensagens - SneakLab',
  description: 'Suas conversas e mensagens de suporte',
};

export default function Messages() {
  return <MessagesPage />;
}