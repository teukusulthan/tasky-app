import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_SUPABASE_URL;
const supabaseKey = process.env.NEXT_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("No database url");
}

const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default supabase;
