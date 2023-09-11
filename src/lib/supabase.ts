import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://rsyjkbfyvnzzosxpimqi.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzeWprYmZ5dm56em9zeHBpbXFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4ODA2MzM0MCwiZXhwIjoyMDAzNjM5MzQwfQ.sERUV2laIFz4TOr6QkfixObxxlGRRgbw2Efcyq3gcMw'
)