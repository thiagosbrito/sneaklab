import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testWhatsAppBot() {
  console.log('🧪 Testing WhatsApp Bot Implementation (Auth Version)')
  console.log('==================================================')

  try {
    // Test 1: Use existing user and create/update profile
    console.log('👤 Step 1: Using existing user and creating/updating profile...')
    
    // Use the actual user UUID from your database
    const testUserId = 'b695a6db-2f39-422e-ad4e-645c3fcf64b6'
    
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: testUserId,
        full_name: 'Test Customer',
        phone: '+1234567890', // Replace with your test number
        address: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          zip: '12345',
          country: 'USA'
        }
      })

    if (profileError) {
      console.error('❌ Error creating profile:', profileError)
      return
    }

    console.log('✅ Test user profile created/updated')

    // Test 2: Create a test order
    console.log('📝 Step 2: Creating test order...')
    const { data: order, error: createError } = await supabase
      .from('orders')
      .insert({
        user_id: testUserId,
        total_amount: 299.99,
        status: 'pending',
        notes: 'Test order for WhatsApp bot with authentication'
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating order:', createError)
      return
    }

    console.log('✅ Test order created:', order.id)

    // Test 3: Add order items
    console.log('👟 Step 3: Adding order items...')
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert([
        {
          order_id: order.id,
          product_id: null, // You can set this to a real product ID if you have one
          quantity: 1,
          base_price: 249.99,
          customization_fee: 50.00,
          item_total: 299.99,
          customization_details: {
            size: '10',
            color: 'custom red',
            design: 'lightning bolt logo'
          }
        }
      ])

    if (itemsError) {
      console.error('❌ Error adding order items:', itemsError)
      return
    }

    console.log('✅ Order items added')

    // Test 4: Confirm the order (this should trigger WhatsApp)
    console.log('🎉 Step 4: Confirming order (should trigger WhatsApp)...')
    const { error: confirmError } = await supabase
      .from('orders')
      .update({ 
        status: 'confirmed',
        feasibility_notes: 'Design approved by team' 
      })
      .eq('id', order.id)

    if (confirmError) {
      console.error('❌ Error confirming order:', confirmError)
      return
    }

    console.log('✅ Order confirmed! Check your WhatsApp for confirmation message.')

    // Wait a bit for the message to be sent
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Test 5: Mark order as ready (this should trigger another WhatsApp)
    console.log('🔥 Step 5: Marking order as ready (should trigger WhatsApp)...')
    const { error: readyError } = await supabase
      .from('orders')
      .update({ 
        status: 'ready',
        production_notes: 'Custom sneakers completed and quality checked' 
      })
      .eq('id', order.id)

    if (readyError) {
      console.error('❌ Error marking order as ready:', readyError)
      return
    }

    console.log('✅ Order marked as ready! Check your WhatsApp for ready message.')

    // Test 6: Check the view data
    console.log('📊 Step 6: Checking order data with user details...')
    const { data: orderWithDetails, error: viewError } = await supabase
      .from('orders_with_user_details')
      .select('*')
      .eq('id', order.id)
      .single()

    if (viewError) {
      console.error('❌ Error fetching order details:', viewError)
      return
    }

    console.log('📊 Order with user details:')
    console.log({
      id: orderWithDetails.id,
      customer_name: orderWithDetails.customer_name,
      customer_phone: orderWithDetails.customer_phone,
      customer_address: orderWithDetails.customer_address,
      status: orderWithDetails.status,
      total_amount: orderWithDetails.total_amount
    })

    console.log('')
    console.log('🎉 Test completed successfully!')
    console.log(`Order ID: ${order.id}`)
    console.log(`User ID: ${testUserId}`)
    console.log('Check your WhatsApp for two messages:')
    console.log('1. Order confirmation message')
    console.log('2. Order ready message')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

async function testDirectFunction() {
  console.log('🔧 Testing Edge Function Directly')
  console.log('=================================')

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/whatsapp-order-notification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        record: {
          id: 'test-order-id',
          customer_name: 'Direct Test Customer',
          customer_phone: '+1234567890', // Replace with your test number
          customer_address: '123 Direct Test Street',
          total_amount: 199.99,
          status: 'confirmed'
        }
      })
    })

    const result = await response.text()
    
    if (response.ok) {
      console.log('✅ Function called successfully:', result)
    } else {
      console.error('❌ Function error:', result)
    }

  } catch (error) {
    console.error('❌ Direct function test failed:', error)
  }
}

// Run tests
console.log('Choose test mode:')
console.log('1. Full test (creates order, triggers WhatsApp)')
console.log('2. Direct function test')

const testMode = process.argv[2] || '1'

if (testMode === '2') {
  testDirectFunction()
} else {
  testWhatsAppBot()
}

export { testWhatsAppBot, testDirectFunction }
