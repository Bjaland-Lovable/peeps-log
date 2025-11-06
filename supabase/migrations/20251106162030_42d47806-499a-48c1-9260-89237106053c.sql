-- Add city column to contacts table with default value
ALTER TABLE public.contacts 
ADD COLUMN city TEXT DEFAULT 'Burgos';

-- Update existing contacts to have 'Burgos' as city (if any exist)
UPDATE public.contacts 
SET city = 'Burgos' 
WHERE city IS NULL;