-- 001_initial_schema.sql
-- Initial database schema for Property Lease Management System

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  email varchar(255) unique not null,
  name varchar(255) not null,
  phone varchar(20),
  role varchar(50) not null default 'tenant',
  password_hash varchar(255),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Properties table
create table if not exists public.properties (
  id uuid primary key default uuid_generate_v4(),
  name varchar(255) not null,
  address text not null,
  type varchar(50) not null,
  total_area decimal(10, 2),
  total_units integer,
  amenities text[] default array[]::text[],
  status varchar(50) default 'available',
  description text,
  created_by uuid not null references public.users(id),
  images text[] default array[]::text[],
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Tenants table
create table if not exists public.tenants (
  id uuid primary key default uuid_generate_v4(),
  name varchar(255) not null,
  email varchar(255),
  phone varchar(20),
  company_name varchar(255),
  aadhar_number varchar(20),
  pan_number varchar(20),
  address text,
  city varchar(100),
  state varchar(100),
  zip_code varchar(10),
  country varchar(100),
  lease_status varchar(50) default 'active',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Leases table
create table if not exists public.leases (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references public.properties(id),
  tenant_id uuid not null references public.tenants(id),
  start_date date not null,
  end_date date not null,
  rent_amount decimal(12, 2) not null,
  security_deposit decimal(12, 2),
  escalation_percent decimal(5, 2) default 0,
  escalation_frequency varchar(50),
  notice_period_days integer default 60,
  lease_status varchar(50) default 'active',
  terms_conditions text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Payments table
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  lease_id uuid not null references public.leases(id),
  tenant_id uuid not null references public.tenants(id),
  amount decimal(12, 2) not null,
  payment_date date not null,
  due_date date not null,
  payment_method varchar(50),
  transaction_id varchar(255),
  status varchar(50) default 'pending',
  receipt_url text,
  notes text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Maintenance table
create table if not exists public.maintenance (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references public.properties(id),
  tenant_id uuid references public.tenants(id),
  title varchar(255) not null,
  description text,
  category varchar(100),
  priority varchar(50) default 'normal',
  status varchar(50) default 'open',
  assigned_to uuid references public.users(id),
  created_by uuid not null references public.users(id),
  expected_completion_date date,
  actual_completion_date date,
  cost decimal(12, 2),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Utilities table
create table if not exists public.utilities (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references public.properties(id),
  lease_id uuid not null references public.leases(id),
  tenant_id uuid not null references public.tenants(id),
  utility_type varchar(50) not null,
  reading_date date not null,
  previous_reading decimal(10, 2),
  current_reading decimal(10, 2),
  consumption decimal(10, 2),
  rate_per_unit decimal(10, 2),
  amount decimal(12, 2),
  status varchar(50) default 'pending',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create indexes
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_properties_created_by on public.properties(created_by);
create index if not exists idx_properties_status on public.properties(status);
create index if not exists idx_leases_property_id on public.leases(property_id);
create index if not exists idx_leases_tenant_id on public.leases(tenant_id);
create index if not exists idx_leases_status on public.leases(lease_status);
create index if not exists idx_payments_lease_id on public.payments(lease_id);
create index if not exists idx_payments_tenant_id on public.payments(tenant_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_maintenance_property_id on public.maintenance(property_id);
create index if not exists idx_maintenance_status on public.maintenance(status);
create index if not exists idx_utilities_property_id on public.utilities(property_id);
create index if not exists idx_utilities_lease_id on public.utilities(lease_id);
