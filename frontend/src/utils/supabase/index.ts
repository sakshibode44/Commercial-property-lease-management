import { supabase } from './client'

// Auth functions
export const auth = {
  signUp: (email: string, password: string) =>
    supabase.auth.signUp({ email, password }),
  
  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),
  
  signOut: () => supabase.auth.signOut(),
  
  getSession: () => supabase.auth.getSession(),
  
  getUser: () => supabase.auth.getUser(),
}

// Database functions
export const database = {
  // Properties
  getProperties: () =>
    supabase.from('properties').select('*'),
  
  createProperty: (data: any) =>
    supabase.from('properties').insert([data]).select(),
  
  updateProperty: (id: string, data: any) =>
    supabase.from('properties').update(data).eq('id', id).select(),
  
  deleteProperty: (id: string) =>
    supabase.from('properties').delete().eq('id', id),
  
  // Tenants
  getTenants: () =>
    supabase.from('tenants').select('*'),
  
  createTenant: (data: any) =>
    supabase.from('tenants').insert([data]).select(),
  
  // Leases
  getLeases: () =>
    supabase.from('leases').select('*'),
  
  // Payments
  getPayments: () =>
    supabase.from('payments').select('*'),
  
  // Maintenance
  getMaintenance: () =>
    supabase.from('maintenance').select('*'),
}
