# WhatsApp Bot Deployment Guide - Authenticated Users

This guide will help you deploy the WhatsApp order notification bot to your remote Supabase project with user authentication support.

## 📋 Prerequisites

- ✅ Facebook Developer Account with WhatsApp Business API setup
- ✅ Supabase account with a project
- ✅ WhatsApp access token and phone number ID
- ✅ Environment variables set in `.env.local`
- ✅ User authentication enabled in your app

## 🏗️ Database Schema

The new schema uses authenticated users instead of storing customer details directly:

- **`profiles`** - User profile information (linked to `auth.users`)
- **`orders`** - Orders linked to authenticated users via `user_id`
- **`order_items`** - Individual items in each order
- **`orders_with_user_details`** - View combining orders with user contact info

## 🚀 Deployment Steps

### Step 1: Install Dependencies

```bash
npm install tsx
```

### Step 2: Set Up Supabase CLI (if not already done)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
npx supabase login
```

### Step 3: Link Your Project

```bash
# Replace 'your-project-ref' with your actual project reference
npx supabase link --project-ref your-project-ref
```

### Step 4: Deploy Database Schema

```bash
# Deploy the new authenticated schema
npx supabase db push --linked
```

### Step 5: Deploy Edge Function

```bash
# Deploy the WhatsApp notification function
npx supabase functions deploy whatsapp-order-notification --linked
```

### Step 6: Set Environment Variables in Supabase

Replace the values with your actual credentials:

```bash
# Set WhatsApp credentials
npx supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id --linked
npx supabase secrets set WHATSAPP_TOKEN=your_access_token --linked

# Set Supabase credentials  
npx supabase secrets set SUPABASE_URL=https://your-project-ref.supabase.co --linked
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key --linked
```

### Step 7: Update Function URL in Trigger

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run this query (replace `your-project-ref` with your actual project reference):

```sql
-- Update the trigger function with the correct URL
CREATE OR REPLACE FUNCTION trigger_whatsapp_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when status changes to 'confirmed' or 'ready'
  IF NEW.status IN ('confirmed', 'ready') AND 
     (OLD.status IS NULL OR OLD.status != NEW.status) THEN
    
    -- Call the edge function with the correct URL
    PERFORM net.http_post(
      url := 'https://your-project-ref.supabase.co/functions/v1/whatsapp-order-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('request.jwt.claims', true)::json->>'sub'
      ),
      body := jsonb_build_object('record', to_jsonb(NEW))
    );
    
    -- Log the trigger for debugging
    RAISE NOTICE 'WhatsApp notification triggered for order % (user: %) with status %', NEW.id, NEW.user_id, NEW.status;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## 🧪 Testing

### Test 1: Full Integration Test

```bash
# Update the test phone number in test-whatsapp-bot.ts first
npm run test:whatsapp
```

### Test 2: Direct Function Test

```bash
npm run test:whatsapp:direct
```

## � Using in Your App

### 1. Create Order (Client-Side)

```typescript
import { createOrder, updateUserProfile } from '@/utils/orders'

// First, ensure user profile has phone number
await updateUserProfile(supabase, {
  full_name: 'John Doe',
  phone: '+1234567890', // Required for WhatsApp
  address: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001'
  }
})

// Create the order
const order = await createOrder(supabase, {
  items: [{
    quantity: 1,
    base_price: 200,
    customization_fee: 50,
    customization_details: {
      size: '10',
      color: 'custom red',
      design: 'lightning bolt'
    }
  }],
  notes: 'Please make it extra cool!'
})

// Order is created with status 'pending'
console.log('Order created:', order.id)
```

### 2. Admin Order Management

```typescript
// Admin can update order status to trigger WhatsApp
await supabase
  .from('orders')
  .update({ 
    status: 'confirmed',
    feasibility_notes: 'Approved - all materials available' 
  })
  .eq('id', orderId)
// This triggers WhatsApp confirmation message

// Later, when ready
await supabase
  .from('orders')
  .update({ 
    status: 'ready',
    production_notes: 'Quality checked and ready for delivery' 
  })
  .eq('id', orderId)
// This triggers WhatsApp ready message
```

## �📱 Expected WhatsApp Messages

### When Order is Confirmed:
```
🎉 Order Confirmed - SneakLab

Hey John Doe! 

Great news! We've reviewed your custom order #a1b2c3d4 and it's totally doable! 💪

Your Custom Items:
• Custom Sneaker (size: 10, color: custom red, design: lightning bolt) - $250.00

Total: $250.00

We're starting work on your custom sneakers right now. Our team will craft them with love and attention to detail.

Delivery: Hand delivery to your address
Payment: Cash on delivery

We'll message you here when your sneakers are ready for pickup! 

Questions? Just reply! 👟✨
```

### When Order is Ready:
```
🎊 Your Custom Sneakers Are Ready!

Hi John Doe! 

Your custom order #a1b2c3d4 is complete and ready for delivery! 🔥

Total Amount: $250.00
Payment: Cash on delivery

Delivery Address:
123 Main St
New York, NY 10001

Our team will contact you shortly to arrange the hand delivery. Please have the exact amount ready.

Can't wait for you to see your custom kicks! 👟🎨

Reply here if you need to change anything!
```

## � Order Workflow

1. **User creates order** → Status: `pending`
2. **Admin reviews feasibility** → Status: `reviewing` 
3. **Admin confirms order** → Status: `confirmed` → **📱 WhatsApp sent!**
4. **Work begins** → Status: `in_progress`
5. **Product ready** → Status: `ready` → **📱 WhatsApp sent!**
6. **Hand delivered** → Status: `delivered`
7. **Payment collected** → Status: `completed`

## �🔍 Monitoring & Debugging

### Check Function Logs:
1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Click on `whatsapp-order-notification`
4. View logs and invocations

### Check User Orders:
```sql
-- View orders with user details
SELECT * FROM orders_with_user_details 
WHERE customer_phone = '+1234567890';

-- Check user profiles
SELECT * FROM profiles WHERE phone IS NOT NULL;
```

### Test Database Operations:
```sql
-- Create a test profile
INSERT INTO profiles (id, full_name, phone, address) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test User',
  '+1234567890',
  '{"street": "123 Test St", "city": "Test City", "state": "TS", "zip": "12345"}'
);

-- Create a test order
INSERT INTO orders (user_id, total_amount) 
VALUES ('00000000-0000-0000-0000-000000000001', 199.99);

-- Confirm the order (should trigger WhatsApp)
UPDATE orders 
SET status = 'confirmed' 
WHERE user_id = '00000000-0000-0000-0000-000000000001';
```

## 🚨 Troubleshooting

### Common Issues:

1. **User Profile Missing Phone Number**
   - Ensure user updates profile with phone before creating orders
   - Check the profiles table for the user

2. **WhatsApp API Error 401**
   - Check if your access token is valid
   - Verify token permissions include `whatsapp_business_messaging`

3. **RLS Policy Blocking Access**
   - Ensure user is authenticated when creating orders
   - Check if service role key is being used for triggers

4. **Function Not Triggering**
   - Verify the view `orders_with_user_details` has data
   - Check if user profile has required phone number

## ✅ Deployment Checklist

- [ ] Database tables created (`profiles`, `orders`, `order_items`)
- [ ] Database view created (`orders_with_user_details`)
- [ ] Database triggers created
- [ ] Edge function deployed
- [ ] Environment variables set in Supabase
- [ ] Function URL updated in trigger
- [ ] Test phone number verified in WhatsApp Business
- [ ] User authentication working
- [ ] Profile creation on signup working
- [ ] Integration test passed

## 🎉 Next Steps

Once deployed and tested:

1. **Update your order form** - Use the `CreateOrderForm` component or integrate the utilities
2. **Add admin interface** - Create admin pages to manage order status
3. **Enhance user profile** - Add profile completion flow
4. **Add order tracking** - Show order status to users
5. **Scale up** - Move from test to production WhatsApp number

Your authenticated WhatsApp bot is now ready to automatically notify customers when their custom sneaker orders are confirmed and ready for delivery! 🚀👟✨
