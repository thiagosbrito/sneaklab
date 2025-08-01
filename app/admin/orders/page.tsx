'use client'

import { useState, useEffect } from 'react'
import { Order, OrderItem, CustomizationDetails, CustomerAddress } from '@/db/schema'
import { useTable } from '@/hooks/useTable'
import TableHeader from '@/components/ui/TableHeader'
import DataTable, { Column } from '@/components/ui/DataTable'
import Pagination from '@/components/ui/Pagination'
import Sidebar from '@/components/ui/Sidebar'
import { Edit, Trash2, Eye, Phone, Mail, MapPin, Clock, CheckCircle, AlertCircle, Package } from 'lucide-react'

// Order with joined data interface  
interface OrderWithDetails extends Order {
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  customer_address: CustomerAddress | null
  total_items?: number
  order_items?: Array<OrderItem & {
    product_name?: string
    products?: {
      name: string
      description: string | null
      imageURL: string[] | null
    }
  }>
  [key: string]: unknown // Add index signature for useTable compatibility
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'production', label: 'In Production', color: 'bg-purple-100 text-purple-800' },
  { value: 'ready', label: 'Ready', color: 'bg-green-100 text-green-800' },
  { value: 'completed', label: 'Completed', color: 'bg-gray-100 text-gray-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null)

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
    getFilterValue
  } = useTable({
    data: orders,
    searchFields: ['id', 'customer_name', 'customer_email', 'customer_phone'],
    initialItemsPerPage: 10
  })

  // Fetch orders from API
  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch('/api/admin/orders')
        const data = await response.json()
        
        if (response.ok) {
          setOrders(data)
        } else {
          console.error('Error fetching orders:', data.error)
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Fetch order details with items
  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`)
      const data = await response.json()
      
      if (response.ok) {
        return data
      } else {
        console.error('Error fetching order details:', data.error)
        return null
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      return null
    }
  }

  const getStatusInfo = (status: string | null) => {
    const statusInfo = ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0]
    return statusInfo
  }

  const formatCurrency = (amount: string | number | null) => {
    if (!amount) return '$0.00'
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return `$${numAmount.toFixed(2)}`
  }

  const formatAddress = (address: CustomerAddress | null) => {
    if (!address || typeof address !== 'object') return 'No address provided'
    
    const { street, city, state, zipCode, country } = address
    const parts = [street, city, state, zipCode, country].filter(Boolean)
    return parts.join(', ') || 'No address provided'
  }

  const columns: Column<OrderWithDetails>[] = [
    {
      key: 'id',
      label: 'Order ID',
      width: 'w-32',
      render: (value: unknown, item: OrderWithDetails) => {
        const id = value as string
        return (
          <code className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded font-mono">
            {id.slice(0, 8)}...
          </code>
        )
      }
    },
    {
      key: 'customer_name',
      label: 'Customer',
      render: (value: unknown, order: OrderWithDetails) => {
        const customer_name = value as string | null
        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              {customer_name || 'Unknown Customer'}
            </span>
            <span className="text-xs text-gray-500">
              {order.customer_email}
            </span>
          </div>
        )
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown, item: OrderWithDetails) => {
        const status = value as string | null
        const statusInfo = getStatusInfo(status)
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        )
      }
    },
    {
      key: 'totalAmount',
      label: 'Total',
      render: (value: unknown, item: OrderWithDetails) => {
        const totalAmount = value as string | null
        return (
          <div className="font-medium text-right">
            {formatCurrency(totalAmount)}
          </div>
        )
      }
    },
    {
      key: 'createdAt',
      label: 'Order Date',
      render: (value: unknown, item: OrderWithDetails) => {
        const createdAt = value as Date | null
        return (
          <div className="text-sm">
            <div>
              {createdAt ? new Date(createdAt).toLocaleDateString() : '-'}
            </div>
            <div className="text-gray-500 text-xs">
              {createdAt ? new Date(createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) : '-'}
            </div>
          </div>
        )
      }
    },
    {
      key: 'progress',
      label: 'Progress',
      render: (_, order: OrderWithDetails) => {
        const dates = {
          confirmed: order.confirmedAt,
          ready: order.readyAt,
          completed: order.completedAt,
          delivered: order.deliveredAt
        }
        
        const completedSteps = Object.values(dates).filter(Boolean).length
        const totalSteps = 4
        
        return (
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">
              {completedSteps}/{totalSteps}
            </span>
          </div>
        )
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, order: OrderWithDetails) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={async (e) => {
              e.stopPropagation()
              const orderDetails = await fetchOrderDetails(order.id!)
              if (orderDetails) {
                setSelectedOrder(orderDetails)
                setSidebarOpen(true)
              }
            }}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Handle edit order status
              console.log('Edit order:', order.id)
            }}
            className="p-1 text-gray-600 hover:text-gray-800"
            title="Edit order"
          >
            <Edit className="w-4 h-4" />
          </button>
          {order.customer_phone && (
            <a
              href={`tel:${order.customer_phone}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1 text-green-600 hover:text-green-800"
              title="Call customer"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
          {order.customer_email && (
            <a
              href={`mailto:${order.customer_email}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1 text-purple-600 hover:text-purple-800"
              title="Email customer"
            >
              <Mail className="w-4 h-4" />
            </a>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <TableHeader
        title="Orders Management"
        searchPlaceholder="Search orders, customers..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        filterOptions={[
          {
            label: 'All Statuses',
            value: 'status',
            options: ORDER_STATUSES.map(status => ({
              label: status.label,
              value: status.value
            })),
            selectedValue: getFilterValue('status'),
            onChange: (value) => handleFilterChange('status', value)
          }
        ]}
      />

      <DataTable
        data={paginatedData}
        columns={columns}
        loading={loading}
        emptyMessage="No orders found"
        onRowClick={async (order) => {
          const orderDetails = await fetchOrderDetails(order.id!)
          if (orderDetails) {
            setSelectedOrder(orderDetails)
            setSidebarOpen(true)
          }
        }}
      />

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        title={selectedOrder ? `Order #${selectedOrder.id?.slice(0, 8)}` : 'Order Details'}
        width="xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900">Order Status</h3>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                  getStatusInfo(selectedOrder.status).color
                }`}>
                  {getStatusInfo(selectedOrder.status).label}
                </span>
              </div>
              
              {/* Status Timeline */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle className={`w-4 h-4 ${selectedOrder.createdAt ? 'text-green-500' : 'text-gray-300'}`} />
                  <span>Order Created: {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'Pending'}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle className={`w-4 h-4 ${selectedOrder.confirmed_at ? 'text-green-500' : 'text-gray-300'}`} />
                  <span>Confirmed: {selectedOrder.confirmedAt ? new Date(selectedOrder.confirmedAt as Date).toLocaleString() : 'Pending'}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle className={`w-4 h-4 ${selectedOrder.ready_at ? 'text-green-500' : 'text-gray-300'}`} />
                  <span>Ready: {selectedOrder.readyAt ? new Date(selectedOrder.readyAt as Date).toLocaleString() : 'Pending'}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle className={`w-4 h-4 ${selectedOrder.completed_at ? 'text-green-500' : 'text-gray-300'}`} />
                  <span>Completed: {selectedOrder.completedAt ? new Date(selectedOrder.completedAt as Date).toLocaleString() : 'Pending'}</span>
                </div>
                {selectedOrder.deliveredAt && (
                  <div className="flex items-center space-x-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Delivered: {new Date(selectedOrder.deliveredAt as Date).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {selectedOrder.customer_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{selectedOrder.customer_name || 'Unknown Customer'}</div>
                    <div className="text-sm text-gray-500">{selectedOrder.customer_email}</div>
                  </div>
                </div>
                
                {selectedOrder.customer_phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a 
                      href={`tel:${selectedOrder.customer_phone}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {selectedOrder.customer_phone}
                    </a>
                  </div>
                )}
                
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <div className="text-sm text-gray-600">
                    {formatAddress(selectedOrder.customer_address)}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.order_items.map((item, index) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          {item.products?.imageURL?.[0] ? (
                            <img 
                              src={item.products.imageURL[0]} 
                              alt={item.products.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.products?.name || 'Unknown Product'}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {item.products?.description || 'No description'}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Quantity:</span>
                              <span className="ml-1 font-medium">{item.quantity || 1}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Base Price:</span>
                              <span className="ml-1 font-medium">{formatCurrency(item.basePrice)}</span>
                            </div>
                            {item.customizationFee && parseFloat(item.customizationFee.toString()) > 0 && (
                              <div>
                                <span className="text-gray-500">Customization:</span>
                                <span className="ml-1 font-medium">{formatCurrency(item.customizationFee)}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-500">Item Total:</span>
                              <span className="ml-1 font-medium">{formatCurrency(item.itemTotal)}</span>
                            </div>
                          </div>

                          {item.customizationDetails && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-md">
                              <pre className="text-xs whitespace-pre-wrap">
                                {JSON.stringify(item.customizationDetails, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Total */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center text-lg font-medium">
                <span>Total Amount:</span>
                <span>{formatCurrency(selectedOrder.totalAmount as string)}</span>
              </div>
            </div>

            {/* Notes */}
            {(selectedOrder.notes || selectedOrder.feasibilityNotes || selectedOrder.productionNotes) && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Notes</h3>
                <div className="space-y-3">
                  {selectedOrder.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Order Notes</label>
                      <p className="text-sm text-gray-600 mt-1">{selectedOrder.notes}</p>
                    </div>
                  )}
                  {selectedOrder.feasibilityNotes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Feasibility Notes</label>
                      <p className="text-sm text-gray-600 mt-1">{selectedOrder.feasibilityNotes as string}</p>
                    </div>
                  )}
                  {selectedOrder.productionNotes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Production Notes</label>
                      <p className="text-sm text-gray-600 mt-1">{selectedOrder.productionNotes as string}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {selectedOrder.customer_phone && (
                  <a
                    href={`tel:${selectedOrder.customer_phone}`}
                    className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Customer</span>
                  </a>
                )}
                {selectedOrder.customer_email && (
                  <a
                    href={`mailto:${selectedOrder.customer_email}`}
                    className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email Customer</span>
                  </a>
                )}
                <button
                  onClick={() => {
                    // TODO: Handle status update
                    console.log('Update status for order:', selectedOrder.id)
                  }}
                  className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  <Edit className="w-4 h-4" />
                  <span>Update Status</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Sidebar>
    </div>
  )
}
