#!/bin/bash

# WhatsApp Bot Deployment Script for SneakLab
echo "🚀 Deploying WhatsApp Order Bot for SneakLab..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if we're logged in to Supabase
if ! supabase projects list &> /dev/null; then
    echo "🔐 Please login to Supabase first:"
    echo "supabase login"
    exit 1
fi

echo "✅ Supabase CLI is ready"

# Link to your project (you'll need to replace this with your actual project reference)
echo "🔗 Linking to Supabase project..."
read -p "Enter your Supabase project reference (found in your dashboard URL): " PROJECT_REF

if [ -z "$PROJECT_REF" ]; then
    echo "❌ Project reference is required"
    exit 1
fi

supabase link --project-ref $PROJECT_REF

# Set environment variables for the Edge Function
echo "🔧 Setting up environment variables..."

read -p "Enter your WhatsApp Phone Number ID: " PHONE_NUMBER_ID
read -p "Enter your WhatsApp Access Token: " ACCESS_TOKEN
read -p "Enter your Supabase URL: " SUPABASE_URL
read -p "Enter your Supabase Anon Key: " ANON_KEY

# Set the secrets
echo "Setting WhatsApp secrets..."
supabase secrets set WHATSAPP_PHONE_NUMBER_ID="$PHONE_NUMBER_ID"
supabase secrets set WHATSAPP_TOKEN="$ACCESS_TOKEN"
supabase secrets set SUPABASE_URL="$SUPABASE_URL"
supabase secrets set SUPABASE_ANON_KEY="$ANON_KEY"

echo "✅ Environment variables set"

# Update the trigger function with the correct URL
echo "📝 Updating trigger function URL..."
FUNCTION_URL="https://$PROJECT_REF.supabase.co/functions/v1/whatsapp-order-notification"
sed -i.bak "s|https://your-project-ref.supabase.co|https://$PROJECT_REF.supabase.co|g" supabase/migrations/002_create_whatsapp_trigger.sql
echo "✅ Function URL updated to: $FUNCTION_URL"

# Apply database migrations
echo "🗄️ Applying database migrations..."
supabase db push

if [ $? -ne 0 ]; then
    echo "❌ Database migration failed"
    exit 1
fi

echo "✅ Database schema created"

# Deploy the Edge Function
echo "⚡ Deploying WhatsApp Edge Function..."
supabase functions deploy whatsapp-order-notification

if [ $? -ne 0 ]; then
    echo "❌ Function deployment failed"
    exit 1
fi

echo "✅ Edge Function deployed"

# Test the setup
echo "🧪 Would you like to test the setup now? (y/n)"
read -p "This will create a test order and trigger WhatsApp messages: " TEST_SETUP

if [ "$TEST_SETUP" = "y" ] || [ "$TEST_SETUP" = "Y" ]; then
    echo "📱 Testing setup..."
    read -p "Enter your test phone number (with country code, e.g., +1234567890): " TEST_PHONE
    
    # Update the test script with the phone number
    sed -i.bak "s/+1234567890/$TEST_PHONE/g" test-order-workflow.ts
    
    echo "Running test..."
    npx tsx test-order-workflow.ts
    
    echo "✅ Test completed! Check your WhatsApp for messages."
fi

echo ""
echo "🎉 WhatsApp Bot deployment completed!"
echo ""
echo "📋 Summary:"
echo "- ✅ Database schema created"
echo "- ✅ WhatsApp trigger function deployed"
echo "- ✅ Edge function deployed"
echo "- ✅ Environment variables configured"
echo ""
echo "🔄 Order Workflow:"
echo "pending → reviewing → confirmed (📱 WhatsApp) → in_progress → ready (📱 WhatsApp) → delivered → completed"
echo ""
echo "📱 WhatsApp Integration:"
echo "- Messages sent when orders are confirmed"
echo "- Messages sent when products are ready"
echo "- Hand delivery and cash payment workflow"
echo ""
echo "🛠️ Next Steps:"
echo "1. Test the workflow by creating orders in your app"
echo "2. Update order statuses to trigger WhatsApp messages"
echo "3. Monitor function logs: supabase functions logs whatsapp-order-notification"
echo ""
echo "🎯 SneakLab WhatsApp Bot is now live! 👟✨"
