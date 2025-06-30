-- Enable the http extension for external API calls
CREATE EXTENSION IF NOT EXISTS http;

-- Create function to trigger WhatsApp notification
CREATE OR REPLACE FUNCTION trigger_whatsapp_notification()
RETURNS TRIGGER AS $$
DECLARE
  function_url text;
BEGIN
  -- Only trigger when status changes to 'confirmed' or 'ready'
  IF (NEW.status IN ('confirmed', 'ready')) AND 
     (OLD.status IS NULL OR OLD.status != NEW.status) THEN
    
    -- Get the function URL from environment or use default
    -- Update this URL with your actual Supabase project reference
    function_url := 'https://your-project-ref.supabase.co/functions/v1/whatsapp-order-notification';
    
    -- Call the edge function asynchronously
    PERFORM net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
      ),
      body := jsonb_build_object('record', to_jsonb(NEW))
    );
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
