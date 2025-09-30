-- Add active column to payment_methods table
ALTER TABLE public.payment_methods 
ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;

-- Update existing records to be active
UPDATE public.payment_methods 
SET active = true 
WHERE active IS NULL;
