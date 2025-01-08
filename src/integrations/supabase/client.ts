import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://kheuoesvhbokusxawuwi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZXVvZXN2aGJva3VzeGF3dXdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyNzg2OTQsImV4cCI6MjA0ODg1NDY5NH0.Qyb1n7Mpls9A4gp8Xx6JmEra8vWXGcdDgZkPZxry-wQ";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);