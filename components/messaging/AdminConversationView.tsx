'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { 
  User, 
  Phone, 
  Package, 
  Clock, 
  MessageCircle, 
  Send, 
  AlertCircle,
  CheckCircle,
  MessageSquare,
  EyeOff,
  Reply
} from 'lucide-react'
import { ConversationWithDetails, ConversationStatus, Message } from '@/db/schema/messaging'
import { 
  getConversationWithMessagesAction, 
  sendMessageAction, 
  updateConversationStatusAction 
} from '@/lib/actions/messaging-actions'
import { formatDistanceToNow } from 'date-fns'

interface AdminConversationViewProps {
  conversation: ConversationWithDetails
  onUpdate: () => void
  defaultMode?: 'view' | 'reply'
}

export function AdminConversationView({ 
  conversation: initialConversation, 
  onUpdate, 
  defaultMode = 'view' 
}: AdminConversationViewProps) {
  const [conversation, setConversation] = useState(initialConversation)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [replyMode, setReplyMode] = useState(defaultMode === 'reply')
  const [replyMessage, setReplyMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusUpdating, setStatusUpdating] = useState(false)

  useEffect(() => {
    fetchConversationDetails()
  }, [conversation.id])

  const fetchConversationDetails = async () => {
    setLoading(true)
    try {
      const result = await getConversationWithMessagesAction(conversation.id)
      if (result.success && result.data) {
        setConversation(result.data as ConversationWithDetails) // TODO: Type assertion
        setMessages(result.data.messages || [])
      } else {
        setError(result.error || 'Failed to load conversation details')
      }
    } catch (error) {
      console.error('Error fetching conversation:', error)
      setError('Failed to load conversation details')
    } finally {
      setLoading(false)
    }
  }

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!replyMessage.trim()) {
      setError('Message cannot be empty')
      return
    }

    setSending(true)
    setError(null)

    try {
      const result = await sendMessageAction(
        conversation.id,
        replyMessage.trim(),
        isInternal
      )

      if (result.success) {
        setReplyMessage('')
        setIsInternal(false)
        setReplyMode(false)
        await fetchConversationDetails()
        onUpdate()
      } else {
        setError(result.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleStatusUpdate = async (newStatus: ConversationStatus) => {
    setStatusUpdating(true)
    try {
      const result = await updateConversationStatusAction(conversation.id, newStatus)
      if (result.success) {
        setConversation(prev => ({ ...prev, status: newStatus }))
        onUpdate()
      } else {
        setError(result.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      setError('Failed to update status')
    } finally {
      setStatusUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { color: 'bg-blue-100 text-blue-800', icon: MessageCircle },
      waiting_customer: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      waiting_admin: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      closed: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open
    const Icon = config.icon
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityColors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    }
    
    return (
      <Badge className={priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium}>
        {priority}
      </Badge>
    )
  }

  const formatMessageTime = (date: Date | string) => {
    const messageDate = new Date(date)
    return formatDistanceToNow(messageDate, { addSuffix: true })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-600">{error}</span>
        </div>
      )}

      {/* Conversation Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl">{conversation.subject}</CardTitle>
              <div className="flex items-center space-x-2">
                {getStatusBadge(conversation.status)}
                {getPriorityBadge(conversation.priority)}
                <Badge variant="outline">
                  {conversation.type.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReplyMode(!replyMode)}
              >
                <Reply className="w-4 h-4 mr-2" />
                {replyMode ? 'Cancel' : 'Reply'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Customer Info */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                {conversation.customer?.fullName || 'Unknown Customer'}
              </div>
              <div className="text-sm text-gray-500 flex items-center space-x-4">
                {conversation.customer?.phone && (
                  <span className="flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    {conversation.customer.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Related Order */}
          {conversation.relatedOrder && (
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">
                  Related Order: #{conversation.relatedOrder.id.slice(-8)}
                </div>
                <div className="text-sm text-gray-500">
                  Status: {conversation.relatedOrder.status} • €{conversation.relatedOrder.totalAmount}
                </div>
              </div>
            </div>
          )}

          {/* Status Management */}
          <div className="space-y-2">
            <Label>Update Status</Label>
            <Select 
              value={conversation.status} 
              onValueChange={handleStatusUpdate}
              disabled={statusUpdating}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="waiting_customer">Waiting Customer</SelectItem>
                <SelectItem value="waiting_admin">Waiting Admin</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Messages ({messages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No messages in this conversation
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div className={`flex ${
                    message.senderType === 'customer' ? 'justify-start' : 'justify-end'
                  }`}>
                    <div className={`max-w-[70%] rounded-lg p-3 ${
                      message.senderType === 'customer'
                        ? 'bg-gray-100 text-gray-900'
                        : message.isInternal
                        ? 'bg-yellow-100 text-yellow-900 border border-yellow-200'
                        : 'bg-blue-100 text-blue-900'
                    }`}>
                      {message.isInternal && (
                        <div className="flex items-center text-xs text-yellow-700 mb-2">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Internal Note
                        </div>
                      )}
                      <div className="text-sm font-medium mb-1">
                        {message.senderType === 'customer' ? 'Customer' : 'Admin'}
                      </div>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className="text-xs text-gray-500 mt-2 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatMessageTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reply Form */}
      {replyMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="w-5 h-5 mr-2" />
              Send Reply
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendReply} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reply-message">Message</Label>
                <Textarea
                  id="reply-message"
                  placeholder="Type your reply..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="internal-note"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="internal-note" className="text-sm flex items-center">
                  <EyeOff className="w-4 h-4 mr-1" />
                  Internal note (only visible to admins)
                </Label>
              </div>

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={sending || !replyMessage.trim()}
                  className="flex-1"
                >
                  {sending ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Reply
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReplyMode(false)}
                  disabled={sending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}