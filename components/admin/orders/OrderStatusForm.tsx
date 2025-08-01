import { useState } from 'react'
import { ORDER_STATUSES, type OrderStatus } from '@/utils/orders'

interface OrderStatusFormProps {
  orderId: string
  currentStatus: OrderStatus
  onStatusUpdate?: (newStatus: OrderStatus) => void
}

export function OrderStatusForm({ orderId, currentStatus, onStatusUpdate }: OrderStatusFormProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [notes, setNotes] = useState('')

  const statusOptions = [
    { value: ORDER_STATUSES.PENDING, label: 'Pending Review', color: 'bg-gray-500' },
    { value: ORDER_STATUSES.REVIEWING, label: 'Under Review', color: 'bg-yellow-500' },
    { value: ORDER_STATUSES.CONFIRMED, label: 'Confirmed ✅ (Sends WhatsApp)', color: 'bg-green-500' },
    { value: ORDER_STATUSES.REJECTED, label: 'Rejected', color: 'bg-red-500' },
    { value: ORDER_STATUSES.IN_PROGRESS, label: 'In Progress', color: 'bg-blue-500' },
    { value: ORDER_STATUSES.READY, label: 'Ready ✅ (Sends WhatsApp)', color: 'bg-purple-500' },
    { value: ORDER_STATUSES.DELIVERED, label: 'Delivered', color: 'bg-indigo-500' },
    { value: ORDER_STATUSES.COMPLETED, label: 'Completed', color: 'bg-green-600' }
  ]

  const handleStatusUpdate = async () => {
    if (status === currentStatus && !notes) {
      alert('No changes to save')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/orders?id=${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          notes: notes || undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update order status')
      }

      const result = await response.json()
      
      alert('Order status updated successfully!')
      console.log('Order updated:', result.order)
      
      // Notify parent component
      onStatusUpdate?.(status)
      
      // Clear notes after successful update
      setNotes('')
      
      // Show WhatsApp notification info
      if (['confirmed', 'ready'].includes(status) && status !== currentStatus) {
        alert(`✅ Order status updated to "${status}". WhatsApp notification will be sent to customer via n8n.`)
      }
      
    } catch (error) {
      console.error('Error updating order status:', error)
      alert(`Failed to update order status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const currentStatusOption = statusOptions.find(opt => opt.value === currentStatus)
  const selectedStatusOption = statusOptions.find(opt => opt.value === status)

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Order Status Management</h3>
        <div className={`px-3 py-1 rounded-full text-white text-sm ${currentStatusOption?.color || 'bg-gray-500'}`}>
          Current: {currentStatusOption?.label || currentStatus}
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Update Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {selectedStatusOption && (
            <div className={`mt-2 inline-block px-2 py-1 rounded text-white text-xs ${selectedStatusOption.color}`}>
              Preview: {selectedStatusOption.label}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Notes for {status.charAt(0).toUpperCase() + status.slice(1)} Status
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={`Add notes about ${status} status (optional)...`}
            className="w-full border rounded-md px-3 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            These notes will be saved as {status}_notes in the database
          </p>
        </div>

        {['confirmed', 'ready'].includes(status) && status !== currentStatus && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-start">
              <span className="text-blue-500 mr-2">📱</span>
              <div>
                <p className="text-sm font-medium text-blue-800">WhatsApp Notification</p>
                <p className="text-xs text-blue-600">
                  Changing status to "{status}" will automatically send a WhatsApp message to the customer via n8n.
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleStatusUpdate}
          disabled={loading || (status === currentStatus && !notes)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Update Order Status'}
        </button>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>Order Workflow:</strong></p>
        <p>pending → reviewing → confirmed (📱 WhatsApp) → in_progress → ready (📱 WhatsApp) → delivered → completed</p>
      </div>
    </div>
  )
}