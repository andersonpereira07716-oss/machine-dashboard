import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mxgxavcyliicpvvbopte.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14Z3hhdmN5bGlpY3B2dmJvcHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwNDY4NzYsImV4cCI6MjEwOTYyMjg3Nn0.0P_jhqOvSLrFXhwPuzeR15GEFdODsQ5QfMgL9q8Fh5Y';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
