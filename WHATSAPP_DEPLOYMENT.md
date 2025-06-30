# WhatsApp Order Bot Deployment Guide

## 1. Environment Variables Setup

Add these to your Supabase project secrets:

```bash
# Deploy and set environment variables
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_from_facebook
supabase secrets set WHATSAPP_TOKEN=your_access_token_from_facebook
supabase secrets set SUPABASE_URL=your_supabase_project_url
supabase secrets set SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 2. Database Setup

```bash
# Run the database migrations
supabase db push

# Or apply migrations manually:
# supabase db reset
```

## 3. Deploy Edge Function

```bash
# Deploy the WhatsApp notification function
supabase functions deploy whatsapp-order-notification
```

## 4. Update Database Trigger

Edit the trigger function URL in the migration file:
```sql
-- In 002_create_whatsapp_trigger.sql, replace:
function_url := 'https://your-project-ref.supabase.co/functions/v1/whatsapp-order-notification';
-- With your actual Supabase project URL
```

## 5. Test the Implementation

```bash
# Run the test script
npx tsx test-order-workflow.ts
```

## 6. WhatsApp Setup Checklist

- [ ] Facebook Developer App created
- [ ] WhatsApp Business API configured
- [ ] Phone number verified
- [ ] Access token generated (permanent)
- [ ] Test phone number added for testing
- [ ] Environment variables set in Supabase

## Order Workflow

1. **Customer creates order** → Status: `pending`
2. **Team reviews feasibility** → Status: `reviewing`
3. **Order confirmed** → Status: `confirmed` ✅ **WhatsApp sent**
4. **Work begins** → Status: `in_progress`
5. **Product ready** → Status: `ready` ✅ **WhatsApp sent**
6. **Hand delivered** → Status: `delivered`
7. **Payment collected** → Status: `completed`

## WhatsApp Messages

### Confirmation Message
- Sent when status changes to `confirmed`
- Includes order items and customizations
- Explains hand delivery and cash payment

### Ready Message  
- Sent when status changes to `ready`
- Includes delivery address
- Prompts for delivery arrangement

## Troubleshooting

### Function Logs
```bash
supabase functions logs whatsapp-order-notification
```

### Database Logs
```bash
supabase logs
```

### Test WhatsApp API directly
```bash
curl -X POST "https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "YOUR_TEST_PHONE",
    "type": "text",
    "text": {"body": "Test message"}
  }'
```
