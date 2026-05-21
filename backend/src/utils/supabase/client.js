const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseAdminKey = process.env.SUPABASE_ADMIN_KEY;

// Client for browser/mobile app usage
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Admin client for server-side operations (requires admin key)
const supabaseAdmin = supabaseAdminKey
  ? createClient(supabaseUrl, supabaseAdminKey)
  : null;

module.exports = { supabaseClient, supabaseAdmin };
