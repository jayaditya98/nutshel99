import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eeehiztghirrwtpvtkyb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlZWhpenRnaGlycnd0cHZ0a3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4OTI2MTUsImV4cCI6MjA3NzQ2ODYxNX0.JvY5ELPrDc18s1QAW9H0-SOXXNP6Jy4jNXi-Zm16nVY';

export const supabase = createClient(supabaseUrl, supabaseKey);

