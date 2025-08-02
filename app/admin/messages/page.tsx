'use client'

import { useState, useEffect } from 'react'
import { useTable } from '@/hooks/useTable'
import TableHeader from '@/components/ui/TableHeader'
import DataTable, { Column } from '@/components/ui/DataTable'
import Pagination from '@/components/ui/Pagination'
import Sidebar from '@/components/ui/Sidebar'
import { 
  MessageCircle, 
  Edit, 
  Eye, 
  User, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  MessageSquare,
  Plus,
  Phone,
  Mail
} from 'lucide-react'
import { ConversationWithDetails } from '@/db/schema/messaging'
import { getAdminConversationsAction } from '@/lib/actions/messaging-actions'
import { AdminConversationView } from '@/components/messaging/AdminConversationView'
import { AdminMessageComposer } from '@/components/messaging/AdminMessageComposer'

interface ConversationData extends ConversationWithDetails {
  [key: string]: unknown // Add index signature for useTable compatibility
}

type SidebarMode = 'view' | 'compose' | 'reply'

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<ConversationData[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null)
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('view')

  const {
    paginatedData,
    totalItems,
    searchTerm,
    handleSearchChange,
    currentPage,
    totalPages,
    itemsPerPage,
    setCurrentPage,
    handleItemsPerPageChange,
    handleFilterChange,
    getFilterValue,
    filteredData
  } = useTable({
    data: conversations,
    initialItemsPerPage: 15,
    searchFields: ['subject', 'customer.fullName', 'customer.phone']
  })

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const result = await getAdminConversationsAction()
      
      if (result.success && result.data) {
        setConversations(result.data as ConversationData[])
      } else {
        console.error('Error fetching conversations:', result.error)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  // Apply additional filtering for status and type
  const statusFilter = getFilterValue('status')
  const typeFilter = getFilterValue('type')
  const finalFilteredData = filteredData.filter(conversation => {
    if (statusFilter && conversation.status !== statusFilter) return false
    if (typeFilter && conversation.type !== typeFilter) return false
    return true
  })

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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </span>
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
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
        priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium
      }`}>
        {priority}
      </span>
    )
  }

  const columns: Column<ConversationData>[] = [
    {
      key: 'subject',
      label: 'Conversation',
      render: (_, conversation) => (
        <div className="flex items-start space-x-3">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">
              {conversation.subject}
            </div>
            <div className="text-sm text-gray-500">
              {conversation.type.replace('_', ' ')} • {conversation.priority} priority
            </div>
            {conversation.relatedOrder && (
              <div className="text-xs text-blue-600">
                Order #{conversation.relatedOrder.id.slice(-8)}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (_, conversation) => (
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {conversation.customer?.fullName || 'Unknown'}
            </div>
            <div className="text-sm text-gray-500">
              {conversation.customer?.phone || 'No phone'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, conversation) => getStatusBadge(conversation.status)
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (_, conversation) => getPriorityBadge(conversation.priority)
    },
    {
      key: 'lastMessageAt',
      label: 'Last Activity',
      render: (_, conversation) => (
        <div className="text-sm text-gray-600">
          {conversation.lastMessageAt 
            ? new Date(conversation.lastMessageAt).toLocaleString()
            : 'No messages'
          }
        </div>
      )
    },
    {
      key: 'assignedAdmin',
      label: 'Assigned',
      render: (_, conversation) => (
        <div className="text-sm text-gray-600">
          {conversation.assignedAdmin?.fullName || (
            <span className="text-gray-400 italic">Unassigned</span>
          )}
        </div>
      )
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, conversation) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewConversation(conversation)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="View conversation"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleReplyConversation(conversation)}
            className="p-1 text-green-600 hover:text-green-800"
            title="Reply to conversation"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  const handleViewConversation = (conversation: ConversationData) => {
    setSelectedConversation(conversation)
    setSidebarMode('view')
    setSidebarOpen(true)
  }

  const handleReplyConversation = (conversation: ConversationData) => {
    setSelectedConversation(conversation)
    setSidebarMode('reply')
    setSidebarOpen(true)
  }

  const handleComposeMessage = () => {
    setSelectedConversation(null)
    setSidebarMode('compose')
    setSidebarOpen(true)
  }

  const handleConversationUpdate = () => {
    fetchConversations()
    setSidebarOpen(false)
  }

  return (
    <div className="p-6">
      <TableHeader
        title="Messages"
        searchPlaceholder="Search conversations..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        onAddClick={handleComposeMessage}
        addButtonText="New Message"
        addButtonIcon={Plus}
        filterOptions={[
          {
            label: 'Status',
            value: 'status',
            options: [
              { value: '', label: 'All Status' },
              { value: 'open', label: 'Open' },
              { value: 'waiting_customer', label: 'Waiting Customer' },
              { value: 'waiting_admin', label: 'Waiting Admin' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' }
            ],
            selectedValue: getFilterValue('status'),
            onChange: (value) => handleFilterChange('status', value)
          },
          {
            label: 'Type',
            value: 'type',
            options: [
              { value: '', label: 'All Types' },
              { value: 'support', label: 'Support' },
              { value: 'order_inquiry', label: 'Order Inquiry' },
              { value: 'complaint', label: 'Complaint' },
              { value: 'general', label: 'General' },
              { value: 'order_update', label: 'Order Update' }
            ],
            selectedValue: getFilterValue('type'),
            onChange: (value) => handleFilterChange('type', value)
          }
        ]}
      />

      <DataTable
        columns={columns}
        data={finalFilteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
        loading={loading}
        emptyMessage="No conversations found"
      />

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(finalFilteredData.length / itemsPerPage)}
        totalItems={finalFilteredData.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        title={
          sidebarMode === 'compose' 
            ? 'New Message' 
            : sidebarMode === 'reply' 
            ? 'Reply to Conversation' 
            : 'Conversation Details'
        }
        width={sidebarMode === 'view' ? 'lg' : 'md'}
      >
        {sidebarMode === 'view' && selectedConversation && (
          <AdminConversationView
            conversation={selectedConversation}
            onUpdate={handleConversationUpdate}
          />
        )}
        {sidebarMode === 'compose' && (
          <AdminMessageComposer
            onSuccess={handleConversationUpdate}
            onCancel={() => setSidebarOpen(false)}
          />
        )}
        {sidebarMode === 'reply' && selectedConversation && (
          <AdminConversationView
            conversation={selectedConversation}
            onUpdate={handleConversationUpdate}
            defaultMode="reply"
          />
        )}
      </Sidebar>
    </div>
  )
}