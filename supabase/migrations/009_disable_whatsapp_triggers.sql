-- Disable WhatsApp Edge Function triggers (migrating to n8n)
-- This migration disables the database triggers that call WhatsApp Edge Functions
-- WhatsApp notifications are now handled by the centralized API route + n8n

-- Drop existing WhatsApp triggers
DROP TRIGGER IF EXISTS whatsapp_order_trigger ON orders;
DROP TRIGGER IF EXISTS whatsapp_order_insert_trigger ON orders;

-- Keep the function for reference but rename it to indicate it's deprecated
DROP FUNCTION IF EXISTS trigger_whatsapp_notification_deprecated();
CREATE OR REPLACE FUNCTION trigger_whatsapp_notification_deprecated()
RETURNS TRIGGER AS $$
BEGIN
  -- This function is deprecated - WhatsApp notifications now handled by n8n
  RAISE NOTICE 'DEPRECATED: WhatsApp triggers disabled. Notifications now handled by n8n via API route.';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add a comment to document the migration
COMMENT ON FUNCTION trigger_whatsapp_notification_deprecated() IS 
'DEPRECATED 2024-01: WhatsApp notifications migrated from Supabase Edge Functions to n8n. 
Use /api/orders API route which sends webhooks to n8n for WhatsApp processing.';

-- Optional: Create a new trigger for logging (if you want to track status changes)
CREATE OR REPLACE FUNCTION log_order_status_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log order status changes for monitoring
  IF NEW.status != OLD.status OR (OLD.status IS NULL AND NEW.status IS NOT NULL) THEN
    RAISE NOTICE 'Order % status changed from % to % (user: %)', 
      NEW.id, 
      COALESCE(OLD.status, 'null'), 
      NEW.status, 
      NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create logging trigger (optional - remove if you don't want logging)
CREATE TRIGGER order_status_logging_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_changes();