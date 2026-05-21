-- 003_enable_rls.sql
-- Row Level Security (RLS) policies for Property Lease Management System

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.properties enable row level security;
alter table public.tenants enable row level security;
alter table public.leases enable row level security;
alter table public.payments enable row level security;
alter table public.maintenance enable row level security;
alter table public.utilities enable row level security;

-- USERS table policies
-- Users can view their own profile
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

-- PROPERTIES table policies
-- Properties are viewable by the creator
create policy "Users can view their own properties" on public.properties
  for select using (auth.uid() = created_by);

-- Properties can be created by authenticated users
create policy "Authenticated users can create properties" on public.properties
  for insert with check (auth.uid() = created_by);

-- Properties can be updated by creator
create policy "Users can update their own properties" on public.properties
  for update using (auth.uid() = created_by);

-- TENANTS table policies
-- All authenticated users can view tenants (adjust as needed)
create policy "Authenticated users can view tenants" on public.tenants
  for select using (auth.role() = 'authenticated');

-- Authenticated users can create tenants
create policy "Authenticated users can create tenants" on public.tenants
  for insert with check (auth.role() = 'authenticated');

-- LEASES table policies
-- Users can view leases for their properties
create policy "Users can view leases for their properties" on public.leases
  for select using (
    auth.uid() = (select created_by from public.properties where id = property_id)
  );

-- Users can create leases for their properties
create policy "Users can create leases for their properties" on public.leases
  for insert with check (
    auth.uid() = (select created_by from public.properties where id = property_id)
  );

-- Users can update leases for their properties
create policy "Users can update leases for their properties" on public.leases
  for update using (
    auth.uid() = (select created_by from public.properties where id = property_id)
  );

-- PAYMENTS table policies
-- Users can view payments for their properties
create policy "Users can view payments for their properties" on public.payments
  for select using (
    auth.uid() = (
      select created_by from public.properties 
      where id = (select property_id from public.leases where id = lease_id)
    )
  );

-- Users can create payments for their properties
create policy "Users can create payments for their properties" on public.payments
  for insert with check (
    auth.uid() = (
      select created_by from public.properties 
      where id = (select property_id from public.leases where id = lease_id)
    )
  );

-- MAINTENANCE table policies
-- Users can view maintenance requests for their properties
create policy "Users can view maintenance for their properties" on public.maintenance
  for select using (
    auth.uid() = (select created_by from public.properties where id = property_id)
  );

-- Users can create maintenance requests for their properties
create policy "Users can create maintenance for their properties" on public.maintenance
  for insert with check (
    auth.uid() = (select created_by from public.properties where id = property_id)
  );

-- Users can update maintenance requests for their properties
create policy "Users can update maintenance for their properties" on public.maintenance
  for update using (
    auth.uid() = (select created_by from public.properties where id = property_id)
  );

-- UTILITIES table policies
-- Users can view utilities for their properties
create policy "Users can view utilities for their properties" on public.utilities
  for select using (
    auth.uid() = (select created_by from public.properties where id = property_id)
  );

-- Users can create utilities for their properties
create policy "Users can create utilities for their properties" on public.utilities
  for insert with check (
    auth.uid() = (select created_by from public.properties where id = property_id)
  );

-- Users can update utilities for their properties
create policy "Users can update utilities for their properties" on public.utilities
  for update using (
    auth.uid() = (select created_by from public.properties where id = property_id)
  );
