import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://szhyzpqbgycispdajxdx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6aHl6cHFiZ3ljaXNwZGFqeGR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzOTk3NjYsImV4cCI6MjA3OTk3NTc2Nn0.iZc63IIJvvnNRYxMw8HV8s-6dWcdCw6Ez-mp0fYKZ_A';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);