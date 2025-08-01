-- Migration: Add segment_id columns to existing tables
-- Description: Adds segment_id foreign key columns to tables that don't have them
-- Date: 2025-08-01

-- Add segment_id to customers table
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS segment_id uuid;

-- Add segment_id to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS segment_id uuid;

-- Add segment_id to transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS segment_id uuid;

-- Add segment_id to sales table
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS segment_id uuid;

-- Add segment_id to billings table
ALTER TABLE public.billings 
ADD COLUMN IF NOT EXISTS segment_id uuid;

-- Add segment_id to cost_centers table
ALTER TABLE public.cost_centers 
ADD COLUMN IF NOT EXISTS segment_id uuid;

-- Add segment_id to accounts_payable table
ALTER TABLE public.accounts_payable 
ADD COLUMN IF NOT EXISTS segment_id uuid;

-- Add segment_id to nfe table
ALTER TABLE public.nfe 
ADD COLUMN IF NOT EXISTS segment_id uuid;

-- Add segment_id to integrations table
ALTER TABLE public.integrations 
ADD COLUMN IF NOT EXISTS segment_id uuid;

-- Add missing columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS code character varying,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS cost_price numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS minimum_stock integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS supplier character varying;

-- Add missing columns to sales table
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS sale_date date,
ADD COLUMN IF NOT EXISTS total_amount numeric,
ADD COLUMN IF NOT EXISTS status character varying DEFAULT 'completed',
ADD COLUMN IF NOT EXISTS payment_method character varying DEFAULT 'cash',
ADD COLUMN IF NOT EXISTS notes text;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_segment_id ON public.customers(segment_id);
CREATE INDEX IF NOT EXISTS idx_products_segment_id ON public.products(segment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_segment_id ON public.transactions(segment_id);
CREATE INDEX IF NOT EXISTS idx_sales_segment_id ON public.sales(segment_id);
CREATE INDEX IF NOT EXISTS idx_billings_segment_id ON public.billings(segment_id);
CREATE INDEX IF NOT EXISTS idx_cost_centers_segment_id ON public.cost_centers(segment_id);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_segment_id ON public.accounts_payable(segment_id);
CREATE INDEX IF NOT EXISTS idx_nfe_segment_id ON public.nfe(segment_id);
CREATE INDEX IF NOT EXISTS idx_integrations_segment_id ON public.integrations(segment_id); 