-- 002_create_functions.sql
-- Database functions for Property Lease Management System

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for users table
create trigger update_users_updated_at before update on public.users
  for each row execute function update_updated_at_column();

-- Trigger for properties table
create trigger update_properties_updated_at before update on public.properties
  for each row execute function update_updated_at_column();

-- Trigger for tenants table
create trigger update_tenants_updated_at before update on public.tenants
  for each row execute function update_updated_at_column();

-- Trigger for leases table
create trigger update_leases_updated_at before update on public.leases
  for each row execute function update_updated_at_column();

-- Trigger for payments table
create trigger update_payments_updated_at before update on public.payments
  for each row execute function update_updated_at_column();

-- Trigger for maintenance table
create trigger update_maintenance_updated_at before update on public.maintenance
  for each row execute function update_updated_at_column();

-- Trigger for utilities table
create trigger update_utilities_updated_at before update on public.utilities
  for each row execute function update_updated_at_column();

-- Function to calculate due payments
create or replace function get_overdue_payments(days_overdue integer default 0)
returns table(
  id uuid,
  lease_id uuid,
  tenant_id uuid,
  amount decimal,
  due_date date,
  days_overdue integer
) as $$
select
  p.id,
  p.lease_id,
  p.tenant_id,
  p.amount,
  p.due_date,
  cast(now()::date - p.due_date as integer) as days_overdue
from public.payments p
where p.status = 'pending' 
  and p.due_date < now()::date
  and cast(now()::date - p.due_date as integer) >= days_overdue
order by p.due_date asc;
$$ language sql;

-- Function to get lease escalation details
create or replace function calculate_escalated_rent(lease_id uuid)
returns decimal as $$
declare
  base_rent decimal;
  escalation_pct decimal;
  years_active integer;
  escalated_amount decimal;
  start_date date;
begin
  select l.rent_amount, l.escalation_percent, l.start_date
  into base_rent, escalation_pct, start_date
  from public.leases l
  where l.id = lease_id;
  
  years_active := extract(year from age(now(), start_date));
  escalated_amount := base_rent * power((1 + escalation_pct / 100), years_active);
  
  return escalated_amount;
end;
$$ language plpgsql;

-- Function to get property revenue summary
create or replace function get_property_revenue_summary(property_id uuid)
returns table(
  total_expected_revenue decimal,
  total_received_revenue decimal,
  total_pending_payments decimal,
  total_overdue_payments decimal
) as $$
select
  coalesce(sum(case when l.lease_status = 'active' then l.rent_amount else 0 end), 0) as total_expected_revenue,
  coalesce(sum(case when p.status = 'completed' then p.amount else 0 end), 0) as total_received_revenue,
  coalesce(sum(case when p.status = 'pending' then p.amount else 0 end), 0) as total_pending_payments,
  coalesce(sum(case when p.status = 'pending' and p.due_date < now()::date then p.amount else 0 end), 0) as total_overdue_payments
from public.leases l
left join public.payments p on l.id = p.lease_id
where l.property_id = property_id
group by 1;
$$ language sql;
