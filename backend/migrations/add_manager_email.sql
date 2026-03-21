-- Add manager_email column to branches table if it doesn't exist

ALTER TABLE branches 
ADD COLUMN IF NOT EXISTS manager_email VARCHAR(255);
