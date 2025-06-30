-- Enable http extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS http;

-- Create function to trigger WhatsApp notification
CREATE OR REPLACE FUNCTION trigger_whatsapp_notification()
RETURNS TRIGGER AS $$
DECLARE
  function_url text;
BEGIN
  -- Only trigger when status changes to 'confirmed' or 'ready'
  IF NEW.status IN ('confirmed', 'ready') AND 
     (OLD.status IS NULL OR OLD.status != NEW.status) THEN
    
    -- Get the function URL from environment or use default
    function_url := current_setting('app.whatsapp_function_url', true);
    
    -- If setting is not available, construct the URL
    -- Replace 'your-project-ref' with your actual Supabase project reference
    IF function_url IS NULL THEN
      function_url := 'https://your-project-ref.supabase.co/functions/v1/whatsapp-order-notification';
    END IF;
    
    -- Call the edge function asynchronously
    PERFORM pg_notify('whatsapp_trigger', json_build_object(
      'order_id', NEW.id,
      'status', NEW.status,
      'customer_phone', NEW.customer_phone
    )::text);
    
    -- Also call the HTTP function directly
    PERFORM net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
      ),
      body := jsonb_build_object('record', to_jsonb(NEW))
    );
    
    -- Log the trigger for debugging
    RAISE NOTICE 'WhatsApp notification triggered for order % with status %', NEW.id, NEW.status;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS whatsapp_order_trigger ON orders;
CREATE TRIGGER whatsapp_order_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_whatsapp_notification();

-- Create a trigger for new orders that are directly created as 'confirmed'
CREATE TRIGGER whatsapp_order_insert_trigger
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_whatsapp_notification();

-- Add comment for documentation
COMMENT ON FUNCTION trigger_whatsapp_notification() IS 'Triggers WhatsApp notifications when order status changes to confirmed or ready';
