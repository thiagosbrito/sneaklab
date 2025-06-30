'use client'

import { useState, useEffect } from 'react'
import { Tables } from '@/utils/supabase/database.types'
import useSupabaseBrowser from '@/utils/supabase/client'
import { useTable } from '@/hooks/useTable'
import TableHeader from '@/components/ui/TableHeader'
import DataTable, { Column } from '@/components/ui/DataTable'
import Pagination from '@/components/ui/Pagination'
import Sidebar from '@/components/ui/Sidebar'
import { Edit, Trash2, Eye, Phone, Mail, MapPin, Calendar, Package, DollarSign, User } from 'lucide-react'

type Profile = Tables<'profiles'>
type OrderWithUserDetails = Tables<'orders_with_user_details'>

interface CustomerData extends Profile {
  email?: string
  order_count: number
  total_spent: number
  last_order_date?: string
  first_order_date?: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerData[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null)
  const [sidebarMode, setSidebarMode] = useState<'view' | 'add' | 'edit'>('view')
  const supabase = useSupabaseBrowser()

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
    data: customers,
    initialItemsPerPage: 10,
    searchFields: ['full_name', 'email', 'phone']
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
        return
      }

      // Fetch order summary data for each customer
      const { data: orderSummaries, error: ordersError } = await supabase
        .from('orders_with_user_details')
        .select('user_id, customer_email, total_amount, created_at')

      if (ordersError) {
        console.error('Error fetching order summaries:', ordersError)
        return
      }

      // Combine profile data with order statistics
      const customerData: CustomerData[] = profiles.map(profile => {
        const customerOrders = orderSummaries.filter(order => order.user_id === profile.id)
        const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
        const orderDates = customerOrders
          .map(order => order.created_at)
          .filter(date => date)
          .sort()

        return {
          ...profile,
          email: customerOrders[0]?.customer_email || undefined,
          order_count: customerOrders.length,
          total_spent: totalSpent,
          first_order_date: orderDates[0] || undefined,
          last_order_date: orderDates[orderDates.length - 1] || undefined
        }
      })

      setCustomers(customerData)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  // Apply additional filtering for order status
  const hasOrdersFilter = getFilterValue('hasOrders')
  const finalFilteredData = filteredData.filter(customer => {
    if (hasOrdersFilter === 'with-orders') return customer.order_count > 0
    if (hasOrdersFilter === 'without-orders') return customer.order_count === 0
    return true
  })

  const columns: Column<CustomerData>[] = [
    {
      key: 'full_name',
      label: 'Customer',
      render: (_, customer) => (
        <div className="flex items-center">
          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {customer.full_name || 'No name'}
            </div>
            <div className="text-sm text-gray-500">{customer.email || 'No email'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (_, customer) => (
        <span className="text-sm text-gray-900">
          {customer.phone || 'No phone'}
        </span>
      )
    },
    {
      key: 'order_count',
      label: 'Orders',
      render: (_, customer) => (
        <div className="flex items-center">
          <Package className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm font-medium text-gray-900">{customer.order_count}</span>
        </div>
      )
    },
    {
      key: 'total_spent',
      label: 'Total Spent',
      render: (_, customer) => (
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm font-medium text-gray-900">
            €{customer.total_spent.toFixed(2)}
          </span>
        </div>
      )
    },
    {
      key: 'last_order_date',
      label: 'Last Order',
      render: (_, customer) => (
        <span className="text-sm text-gray-600">
          {customer.last_order_date 
            ? new Date(customer.last_order_date).toLocaleDateString()
            : 'Never'
          }
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (_, customer) => (
        <span className="text-sm text-gray-600">
          {customer.created_at 
            ? new Date(customer.created_at).toLocaleDateString()
            : 'Unknown'
          }
        </span>
      )
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, customer) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewCustomer(customer)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="View customer"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEditCustomer(customer)}
            className="p-1 text-green-600 hover:text-green-800"
            title="Edit customer"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteCustomer(customer)}
            className="p-1 text-red-600 hover:text-red-800"
            title="Delete customer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  const handleViewCustomer = (customer: CustomerData) => {
    setSelectedCustomer(customer)
    setSidebarMode('view')
    setSidebarOpen(true)
  }

  const handleEditCustomer = (customer: CustomerData) => {
    setSelectedCustomer(customer)
    setSidebarMode('edit')
    setSidebarOpen(true)
  }

  const handleAddCustomer = () => {
    setSelectedCustomer(null)
    setSidebarMode('add')
    setSidebarOpen(true)
  }

  const handleDeleteCustomer = async (customer: CustomerData) => {
    if (confirm(`Are you sure you want to delete ${customer.full_name || 'this customer'}?`)) {
      try {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', customer.id)

        if (error) {
          console.error('Error deleting customer:', error)
          alert('Failed to delete customer')
        } else {
          await fetchCustomers()
        }
      } catch (error) {
        console.error('Error deleting customer:', error)
        alert('Failed to delete customer')
      }
    }
  }

  const handleSaveCustomer = async (formData: any) => {
    try {
      if (sidebarMode === 'add') {
        // For adding a new customer, we'd need to create both auth user and profile
        // This is typically handled through the auth system
        alert('Adding new customers requires integration with authentication system')
      } else if (sidebarMode === 'edit' && selectedCustomer) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            phone: formData.phone,
            address: formData.address,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedCustomer.id)

        if (error) {
          console.error('Error updating customer:', error)
          alert('Failed to update customer')
        } else {
          setSidebarOpen(false)
          await fetchCustomers()
        }
      }
    } catch (error) {
      console.error('Error saving customer:', error)
      alert('Failed to save customer')
    }
  }

  const formatAddress = (address: any) => {
    if (!address || typeof address !== 'object') return 'No address'
    
    const parts = []
    if (address.street) parts.push(address.street)
    if (address.city) parts.push(address.city)
    if (address.postal_code) parts.push(address.postal_code)
    if (address.country) parts.push(address.country)
    
    return parts.length > 0 ? parts.join(', ') : 'No address'
  }

  return (
    <div className="p-6">
      <TableHeader
        title="Customers"
        searchPlaceholder="Search customers..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        onAddClick={handleAddCustomer}
        addButtonText="Add Customer"
        filterOptions={[
          {
            label: 'Order Status',
            value: 'hasOrders',
            options: [
              { value: '', label: 'All Customers' },
              { value: 'with-orders', label: 'With Orders' },
              { value: 'without-orders', label: 'No Orders' }
            ],
            selectedValue: getFilterValue('hasOrders'),
            onChange: (value) => handleFilterChange('hasOrders', value)
          }
        ]}
      />

      <DataTable
        columns={columns}
        data={finalFilteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
        loading={loading}
        emptyMessage="No customers found"
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
          sidebarMode === 'add' 
            ? 'Add Customer' 
            : sidebarMode === 'edit' 
            ? 'Edit Customer' 
            : 'Customer Details'
        }
      >
        {sidebarMode === 'view' && selectedCustomer && (
          <CustomerDetails customer={selectedCustomer} />
        )}
        {(sidebarMode === 'add' || sidebarMode === 'edit') && (
          <CustomerForm
            customer={selectedCustomer}
            onSave={handleSaveCustomer}
            onCancel={() => setSidebarOpen(false)}
          />
        )}
      </Sidebar>
    </div>
  )
}

function CustomerDetails({ customer }: { customer: CustomerData }) {
  return (
    <div className="space-y-6">
      {/* Customer Info */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <User className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-900">
              {customer.full_name || 'No name provided'}
            </span>
          </div>
          <div className="flex items-center">
            <Mail className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              {customer.email || 'No email'}
            </span>
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              {customer.phone || 'No phone'}
            </span>
          </div>
          <div className="flex items-start">
            <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
            <span className="text-sm text-gray-600">
              {customer.address ? formatAddress(customer.address) : 'No address'}
            </span>
          </div>
        </div>
      </div>

      {/* Order Statistics */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Order Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <Package className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-900">Total Orders</span>
            </div>
            <p className="text-lg font-bold text-gray-900 mt-1">{customer.order_count}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-gray-900">Total Spent</span>
            </div>
            <p className="text-lg font-bold text-gray-900 mt-1">€{customer.total_spent.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              Joined: {customer.created_at 
                ? new Date(customer.created_at).toLocaleDateString()
                : 'Unknown'
              }
            </span>
          </div>
          {customer.first_order_date && (
            <div className="flex items-center">
              <Package className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">
                First order: {new Date(customer.first_order_date).toLocaleDateString()}
              </span>
            </div>
          )}
          {customer.last_order_date && (
            <div className="flex items-center">
              <Package className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">
                Last order: {new Date(customer.last_order_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CustomerForm({ 
  customer, 
  onSave, 
  onCancel 
}: { 
  customer: CustomerData | null
  onSave: (data: any) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    full_name: customer?.full_name || '',
    phone: customer?.phone || '',
    address: customer?.address || {}
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...(typeof prev.address === 'object' && prev.address !== null ? prev.address : {}),
        [field]: value
      }
    }))
  }

  const address = formData.address as any || {}

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          value={formData.full_name}
          onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Street"
            value={address.street || ''}
            onChange={(e) => handleAddressChange('street', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="City"
              value={address.city || ''}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Postal Code"
              value={address.postal_code || ''}
              onChange={(e) => handleAddressChange('postal_code', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <input
            type="text"
            placeholder="Country"
            value={address.country || ''}
            onChange={(e) => handleAddressChange('country', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex space-x-2 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
        >
          Save Customer
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// Helper function to format address (moved outside component to avoid recreation)
function formatAddress(address: any) {
  if (!address || typeof address !== 'object') return 'No address'
  
  const parts = []
  if (address.street) parts.push(address.street)
  if (address.city) parts.push(address.city)
  if (address.postal_code) parts.push(address.postal_code)
  if (address.country) parts.push(address.country)
  
  return parts.length > 0 ? parts.join(', ') : 'No address'
}
