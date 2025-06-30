import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')!
const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_TOKEN')!
const WHATSAPP_API_URL = Deno.env.get('WHATSAPP_API_URL')! // Use the full API URL from env

interface OrderData {
  id: string
  user_id: string
  total_amount: number
  status: string
  notes?: string
  created_at: string
  customer_name: string
  customer_phone: string
  customer_address: any
  customer_email: string
  order_items?: Array<{
    quantity: number
    base_price: number
    customization_fee: number
    item_total: number
    customization_details?: any
    products: {
      name: string
      description?: string
    }
  }>
}

serve(async (req) => {
  try {
    const { record } = await req.json()
    
    // Handle both 'confirmed' and 'ready' status changes
    if (!['confirmed', 'ready'].includes(record.status)) {
      return new Response('No WhatsApp notification needed', { status: 200 })
    }

    console.log(`Processing WhatsApp notification for order ${record.id} with status: ${record.status}`)

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data: orderData, error } = await supabase
      .from('orders_with_user_details')
      .select(`
        *,
        order_items (
          quantity,
          base_price,
          customization_fee,
          item_total,
          customization_details,
          products (name, description)
        )
      `)
      .eq('id', record.id)
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    await sendWhatsAppMessage(orderData, record.status)

    return new Response('WhatsApp message sent successfully', { status: 200 })
  } catch (error) {
    console.error('Error in WhatsApp function:', error)
    return new Response(`Error: ${error.message}`, { status: 500 })
  }
})

async function sendWhatsAppMessage(order: OrderData, status: string) {
  const message = status === 'confirmed' 
    ? formatConfirmationMessage(order)
    : formatReadyMessage(order)
  
  console.log(`Sending WhatsApp message to ${order.customer_phone}`)
  
  // Clean phone number (remove any non-numeric characters except +)
  const cleanPhone = order.customer_phone.replace(/[^\d+]/g, '')
  
  const payload = {
    messaging_product: "whatsapp",
    to: cleanPhone,
    type: "text",
    text: { body: message }
  }

  // Use the full API URL from environment variables
  const response = await fetch(WHATSAPP_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('WhatsApp API error:', error)
    throw new Error(`WhatsApp API error: ${error}`)
  }

  const result = await response.json()
  console.log('WhatsApp message sent successfully:', result)
  return result
}

function formatConfirmationMessage(order: OrderData): string {
  const itemsList = order.order_items
    ?.map(item => {
      const customization = item.customization_details 
        ? Object.entries(item.customization_details)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ')
        : ''
      const customText = customization ? ` (${customization})` : ''
      return `• ${item.products?.name || 'Custom Item'}${customText} - $${item.item_total}`
    })
    .join('\n') || 'Custom sneaker order'

  const orderRef = order.id.slice(0, 8).toUpperCase()

  return `🎉 *Order Confirmed - SneakLab*

Hey ${order.customer_name}! 

Great news! We've reviewed your custom order #${orderRef} and it's totally doable! 💪

*Your Custom Items:*
${itemsList}

*Total: $${order.total_amount}*

We're starting work on your custom sneakers right now. Our team will craft them with love and attention to detail.

*Delivery:* Hand delivery to your address
*Payment:* Cash on delivery

We'll message you here when your sneakers are ready for pickup! 

Questions? Just reply! 👟✨`
}

function formatReadyMessage(order: OrderData): string {
  const addressString = typeof order.customer_address === 'object' 
    ? `${order.customer_address.street}\n${order.customer_address.city}, ${order.customer_address.state} ${order.customer_address.zip}`
    : order.customer_address || 'Address on file'

  const orderRef = order.id.slice(0, 8).toUpperCase()

  return `🎊 *Your Custom Sneakers Are Ready!*

Hi ${order.customer_name}! 

Your custom order #${orderRef} is complete and ready for delivery! 🔥

*Total Amount: $${order.total_amount}*
*Payment: Cash on delivery*

*Delivery Address:*
${addressString}

Our team will contact you shortly to arrange the hand delivery. Please have the exact amount ready.

Can't wait for you to see your custom kicks! 👟🎨

Reply here if you need to change anything!`
}
