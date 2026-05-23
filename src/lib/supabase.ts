import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://edjqjvvezrjswthoirvo.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkanFqdnZlenJqc3d0aG9pcnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0OTQwNjUsImV4cCI6MjA5NTA3MDA2NX0.Ishm9jCKHjGB_OnZY-6BtbglhVxaPtrt75tqqrjyW2g";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
