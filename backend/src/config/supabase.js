const { createClient } = require('@supabase/supabase-js');
const envVars = require('./env');

let supabaseClient;

// Initialize Supabase client
function initSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = envVars.SUPABASE_URL;
    const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables');
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseClient;
}

// Get Supabase client
function getSupabase() {
  return initSupabase();
}

module.exports = {
  initSupabase,
  getSupabase,
};
