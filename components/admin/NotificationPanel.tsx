"use client";

import React, { useState } from 'react';
import { Bell, Filter, Search, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { useAdminNotificationState } from '@/hooks/queries/useNotifications';

interface AdminNotificationPanelProps {
  className?: string;
}

export function AdminNotificationPanel({ className }: AdminNotificationPanelProps) {
  const [filter, setFilter] = useState<'all' | 'order' | 'message' | 'system'>('all');
  const [search, setSearch] = useState('');

  // Use React Query hook to fetch admin notifications
  const { notifications, loading } = useAdminNotificationState(filter, search);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'message':
        return '💬';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-blue-500';
      case 'low':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'unread' ? 'default' : 'secondary';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6" />
          <h2 className="text-2xl font-bold">All Notifications</h2>
          <Badge variant="secondary">{notifications.length}</Badge>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'order' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('order')}
          >
            📦 Orders
          </Button>
          <Button
            variant={filter === 'message' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('message')}
          >
            💬 Messages
          </Button>
          <Button
            variant={filter === 'system' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('system')}
          >
            ⚙️ System
          </Button>
        </div>
        
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No notifications found</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-6 rounded-lg border transition-colors ${
                notification.status === 'unread'
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <span className="text-xl">
                    {getNotificationIcon(notification.type)}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Customer: {(notification as any).profile?.fullName || 'Unknown'}
                        {(notification as any).profile?.phone && (
                          <span className="ml-2">({(notification as any).profile.phone})</span>
                        )}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(notification.priority)}`} />
                      <Badge variant={getStatusBadgeVariant(notification.status)}>
                        {notification.status}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {notification.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                    
                    {notification.relatedId && (
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {notification.relatedType}: {notification.relatedId.slice(0, 8)}...
                      </span>
                    )}
                  </div>
                  {notification.metadata ? (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <div className="text-xs text-gray-600">
                        <strong>Additional Info:</strong>
                        <pre className="mt-1 whitespace-pre-wrap">
                          {JSON.stringify(notification.metadata, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}