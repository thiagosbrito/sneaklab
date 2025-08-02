'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search, 
  User, 
  Phone, 
  Mail, 
  X, 
  AlertCircle,
  CheckCircle,
  Clock,
  Package
} from 'lucide-react'
import { createAdminConversationAction } from '@/lib/actions/messaging-actions'
import { ConversationType } from '@/db/schema/messaging'
import { Profile } from '@/db/schema/profiles'
import { searchCustomersAction } from '@/lib/actions/customer-actions'

interface AdminMessageComposerProps {
  onSuccess: () => void
  onCancel: () => void
}

interface CustomerSearchResult extends Profile {
  orderCount?: number
  lastOrderDate?: string
  totalSpent?: number
}

export function AdminMessageComposer({ onSuccess, onCancel }: AdminMessageComposerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<CustomerSearchResult[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  
  const [formData, setFormData] = useState({
    type: 'general' as ConversationType,
    subject: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    relatedOrderId: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounced search effect
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const timeoutId = setTimeout(() => {
      searchCustomers(searchTerm)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const searchCustomers = async (term: string) => {
    setIsSearching(true)
    try {
      const result = await searchCustomersAction(term)
      
      if (result.success && result.data) {
        setSearchResults(result.data as CustomerSearchResult[]) // TODO: Type assertion
        setShowResults(true)
      } else {
        console.error('Error searching customers:', result.error)
        setSearchResults([])
        setShowResults(false)
      }
    } catch (error) {
      console.error('Error searching customers:', error)
      setSearchResults([])
      setShowResults(false)
    } finally {
      setIsSearching(false)
    }
  }

  const handleCustomerSelect = (customer: CustomerSearchResult) => {
    setSelectedCustomer(customer)
    setSearchTerm('')
    setShowResults(false)
    setSearchResults([])
  }

  const handleCustomerRemove = () => {
    setSelectedCustomer(null)
    setSearchTerm('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCustomer) {
      setError('Please select a customer')
      return
    }

    if (!formData.subject.trim() || !formData.message.trim()) {
      setError('Subject and message are required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await createAdminConversationAction(
        selectedCustomer.id,
        formData.type,
        formData.subject.trim(),
        formData.message.trim(),
        formData.priority,
        formData.relatedOrderId || undefined
      )

      if (result.success) {
        onSuccess()
      } else {
        setError(result.error || 'Failed to create conversation')
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      setError('Failed to create conversation')
    } finally {
      setLoading(false)
    }
  }

  const getCustomerStatusBadge = (customer: CustomerSearchResult) => {
    if (customer.orderCount === 0) {
      return <Badge variant="secondary">New Customer</Badge>
    }
    if ((customer.orderCount || 0) >= 5) {
      return <Badge variant="default">VIP Customer</Badge>
    }
    return <Badge variant="outline">Regular Customer</Badge>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-600">{error}</span>
        </div>
      )}

      {/* Customer Search */}
      <div className="space-y-2">
        <Label htmlFor="customer-search">Select Customer</Label>
        
        {selectedCustomer ? (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {selectedCustomer.fullName}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center space-x-4">
                      <span className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {selectedCustomer.phone}
                      </span>
                      {selectedCustomer.orderCount !== undefined && (
                        <span className="flex items-center">
                          <Package className="h-3 w-3 mr-1" />
                          {selectedCustomer.orderCount} orders
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getCustomerStatusBadge(selectedCustomer)}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCustomerRemove}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="customer-search"
                type="text"
                placeholder="Search customers by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {showResults && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="p-3 text-center">
                    <Clock className="h-4 w-4 animate-spin mx-auto text-gray-400" />
                    <span className="text-sm text-gray-500 mt-1">Searching...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => handleCustomerSelect(customer)}
                      className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {customer.fullName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            <span>{customer.phone}</span>
                            {customer.orderCount !== undefined && (
                              <span>• {customer.orderCount} orders</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {getCustomerStatusBadge(customer)}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-sm text-gray-500">
                    No customers found
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Conversation Type */}
      <div className="space-y-2">
        <Label htmlFor="type">Message Type</Label>
        <Select value={formData.type} onValueChange={(value: ConversationType) => 
          setFormData(prev => ({ ...prev, type: value }))
        }>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General Inquiry</SelectItem>
            <SelectItem value="support">Technical Support</SelectItem>
            <SelectItem value="order_inquiry">Order Inquiry</SelectItem>
            <SelectItem value="order_update">Order Update</SelectItem>
            <SelectItem value="complaint">Complaint</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
          setFormData(prev => ({ ...prev, priority: value }))
        }>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Related Order ID (optional) */}
      <div className="space-y-2">
        <Label htmlFor="relatedOrderId">Related Order ID (Optional)</Label>
        <Input
          id="relatedOrderId"
          type="text"
          placeholder="Enter order ID if this message is related to a specific order"
          value={formData.relatedOrderId}
          onChange={(e) => setFormData(prev => ({ ...prev, relatedOrderId: e.target.value }))}
        />
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          type="text"
          placeholder="Enter message subject"
          value={formData.subject}
          onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
          required
        />
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Enter your message"
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          rows={5}
          required
        />
      </div>

      {/* Actions */}
      <div className="flex space-x-2 pt-4">
        <Button
          type="submit"
          disabled={loading || !selectedCustomer}
          className="flex-1"
        >
          {loading ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Send Message
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}