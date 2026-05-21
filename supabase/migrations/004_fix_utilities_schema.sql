-- 004_fix_utilities_schema.sql
-- Alter utilities table to support frontend fields and make physical meter fields optional

-- 1. Make lease_id and reading_date columns nullable (since frontend doesn't use physical meter readings by default)
ALTER TABLE public.utilities ALTER COLUMN lease_id DROP NOT NULL;
ALTER TABLE public.utilities ALTER COLUMN reading_date DROP NOT NULL;

-- 2. Add billing_period, due_date, and paid_date columns if they don't exist
ALTER TABLE public.utilities ADD COLUMN IF NOT EXISTS billing_period varchar(100);
ALTER TABLE public.utilities ADD COLUMN IF NOT EXISTS due_date date;
ALTER TABLE public.utilities ADD COLUMN IF NOT EXISTS paid_date date;
