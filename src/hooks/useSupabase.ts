
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jzkixldwdnvsgxazguaw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6a2l4bGR3ZG52c2d4YXpndWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA2MjI2MDksImV4cCI6MjAyNjE5ODYwOX0.F4qkDjvx_6RjYZ3yMgMGdmVW4gRG9Qp2Zv2qcnWHg4g';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  }
});
