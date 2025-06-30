import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { createOrder, updateUserProfile, type CreateOrderData } from '@/utils/orders'

// Example component showing how to create an order
export function CreateOrderForm({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const [loading, setLoading] = useState(false)
  const [orderData, setOrderData] = useState<CreateOrderData>({
    items: [{
      product_id: undefined,
      quantity: 1,
      base_price: 200,
      customization_details: {
        size: '10',
        color: 'red',
        design: 'custom logo'
      },
      customization_fee: 50
    }],
    notes: ''
  })

  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'USA'
    }
  })

  const handleCreateOrder = async () => {
    if (!profileData.phone) {
      alert('Please provide your phone number for WhatsApp notifications')
      return
    }

    setLoading(true)
    try {
      // First, update user profile with contact info
      await updateUserProfile(supabase, profileData)
      
      // Then create the order
      const order = await createOrder(supabase, orderData)
      
      alert(`Order created successfully! Order ID: ${order.id}`)
      console.log('Order created:', order)
      
      // Order is now in 'pending' status
      // Admin can later change to 'confirmed' to trigger WhatsApp
      
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Failed to create order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create Custom Order</h2>
      
      {/* Profile Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={profileData.full_name}
            onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
            className="w-full border rounded px-3 py-2"
            placeholder="Your full name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Phone (for WhatsApp)</label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full border rounded px-3 py-2"
            placeholder="+1234567890"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Delivery Address</label>
          <input
            type="text"
            value={profileData.address.street}
            onChange={(e) => setProfileData(prev => ({ 
              ...prev, 
              address: { ...prev.address, street: e.target.value }
            }))}
            className="w-full border rounded px-3 py-2 mb-2"
            placeholder="Street address"
          />
          
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={profileData.address.city}
              onChange={(e) => setProfileData(prev => ({ 
                ...prev, 
                address: { ...prev.address, city: e.target.value }
              }))}
              className="border rounded px-3 py-2"
              placeholder="City"
            />
            <input
              type="text"
              value={profileData.address.state}
              onChange={(e) => setProfileData(prev => ({ 
                ...prev, 
                address: { ...prev.address, state: e.target.value }
              }))}
              className="border rounded px-3 py-2"
              placeholder="State"
            />
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Custom Sneaker Details</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Base Price</label>
          <input
            type="number"
            value={orderData.items[0].base_price}
            onChange={(e) => setOrderData(prev => ({
              ...prev,
              items: [{
                ...prev.items[0],
                base_price: parseFloat(e.target.value) || 0
              }]
            }))}
            className="w-full border rounded px-3 py-2"
            min="0"
            step="0.01"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Customization Fee</label>
          <input
            type="number"
            value={orderData.items[0].customization_fee}
            onChange={(e) => setOrderData(prev => ({
              ...prev,
              items: [{
                ...prev.items[0],
                customization_fee: parseFloat(e.target.value) || 0
              }]
            }))}
            className="w-full border rounded px-3 py-2"
            min="0"
            step="0.01"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Size</label>
          <select
            value={orderData.items[0].customization_details.size}
            onChange={(e) => setOrderData(prev => ({
              ...prev,
              items: [{
                ...prev.items[0],
                customization_details: {
                  ...prev.items[0].customization_details,
                  size: e.target.value
                }
              }]
            }))}
            className="w-full border rounded px-3 py-2"
          >
            {Array.from({ length: 15 }, (_, i) => i + 6).map(size => (
              <option key={size} value={size.toString()}>{size}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Special Notes</label>
          <textarea
            value={orderData.notes}
            onChange={(e) => setOrderData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder="Any special customization requests..."
          />
        </div>
      </div>

      <button
        onClick={handleCreateOrder}
        disabled={loading || !profileData.phone}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating Order...' : `Create Order ($${
          (orderData.items[0].base_price + (orderData.items[0].customization_fee || 0)).toFixed(2)
        })`}
      </button>

      <p className="text-sm text-gray-600 mt-4">
        📱 You'll receive WhatsApp notifications when your order is confirmed and ready for delivery.
      </p>
    </div>
  )
}
