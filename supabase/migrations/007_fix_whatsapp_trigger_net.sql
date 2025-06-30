-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Update the trigger function to use proper project URL
CREATE OR REPLACE FUNCTION trigger_whatsapp_notification()
RETURNS TRIGGER AS $$
DECLARE
  function_url text;
BEGIN
  -- Only trigger when status changes to 'confirmed' or 'ready'
  IF NEW.status IN ('confirmed', 'ready') AND 
     (OLD.status IS NULL OR OLD.status != NEW.status) THEN
    
    -- Use your actual Supabase project URL
    function_url := 'https://ovluplweospdirelbzas.supabase.co/functions/v1/whatsapp-order-notification';
    
    -- Call the edge function asynchronously
    PERFORM net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
      ),
      body := jsonb_build_object('record', to_jsonb(NEW))
    );
    
    -- Log the trigger for debugging
    RAISE NOTICE 'WhatsApp notification triggered for order % (user: %) with status %', NEW.id, NEW.user_id, NEW.status;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure triggers exist
DROP TRIGGER IF EXISTS whatsapp_order_trigger ON orders;
DROP TRIGGER IF EXISTS whatsapp_order_insert_trigger ON orders;

CREATE TRIGGER whatsapp_order_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_whatsapp_notification();
