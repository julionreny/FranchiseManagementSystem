-- Add missing columns to branches table for manager registration

ALTER TABLE branches 
ADD COLUMN IF NOT EXISTS manager_invite_code VARCHAR(10) UNIQUE,
ADD COLUMN IF NOT EXISTS is_code_used BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS manager_id INTEGER REFERENCES users(user_id);

-- Add NOT NULL constraints if needed
-- ALTER TABLE branches 
-- ALTER COLUMN manager_invite_code SET NOT NULL;
