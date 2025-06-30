import { createClient } from '@supabase/supabase-js'

// Test script to simulate order confirmation and WhatsApp integration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testOrderWorkflow() {
  try {
    console.log('🧪 Testing Order Workflow...')

    // 1. Create a test order
    console.log('1. Creating test order...')
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: 'Test Customer',
        customer_phone: '+1234567890', // Replace with your test number
        customer_email: 'test@example.com',
        customer_address: '123 Test Street, Test City, TC 12345',
        total_amount: 299.99,
        notes: 'Custom Air Jordan 1 with custom colorway',
        status: 'pending'
      })
      .select()
      .single()

    if (orderError) {
      console.error('❌ Error creating order:', orderError)
      return
    }

    console.log('✅ Test order created:', order.id)

    // 2. Add order items
    console.log('2. Adding order items...')
    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: null, // No existing product since it's custom
        quantity: 1,
        base_price: 250.00,
        customization_fee: 49.99,
        item_total: 299.99,
        customization_details: {
          size: '10',
          colors: ['black', 'red', 'white'],
          special_requests: 'Custom logo on tongue'
        }
      })

    if (itemError) {
      console.error('❌ Error creating order item:', itemError)
      return
    }

    console.log('✅ Order items added')

    // 3. Simulate order confirmation (this should trigger WhatsApp)
    console.log('3. Confirming order (should trigger WhatsApp)...')
    const { error: confirmError } = await supabase
      .from('orders')
      .update({ 
        status: 'confirmed',
        feasibility_notes: 'Order looks good, all materials available'
      })
      .eq('id', order.id)

    if (confirmError) {
      console.error('❌ Error confirming order:', confirmError)
      return
    }

    console.log('✅ Order confirmed! Check your WhatsApp for confirmation message.')

    // 4. Wait a bit, then mark as ready (this should trigger another WhatsApp)
    console.log('4. Waiting 5 seconds, then marking as ready...')
    await new Promise(resolve => setTimeout(resolve, 5000))

    const { error: readyError } = await supabase
      .from('orders')
      .update({ 
        status: 'ready',
        production_notes: 'Custom sneakers completed, quality checked'
      })
      .eq('id', order.id)

    if (readyError) {
      console.error('❌ Error marking order as ready:', readyError)
      return
    }

    console.log('✅ Order marked as ready! Check your WhatsApp for ready message.')

    // 5. Show final order status
    const { data: finalOrder } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *
        )
      `)
      .eq('id', order.id)
      .single()

    console.log('📋 Final Order Status:', {
      id: finalOrder.id,
      status: finalOrder.status,
      confirmed_at: finalOrder.confirmed_at,
      ready_at: finalOrder.ready_at,
      total_amount: finalOrder.total_amount
    })

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testOrderWorkflow()
