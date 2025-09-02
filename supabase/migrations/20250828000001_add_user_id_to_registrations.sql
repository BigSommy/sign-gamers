-- Drop all foreign key constraints on the user_id column
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tc.constraint_name 
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'registrations' 
        AND kcu.column_name = 'user_id'
    ) LOOP
        EXECUTE 'ALTER TABLE registrations DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- Modify the existing user_id column to reference user_profiles
ALTER TABLE registrations 
    ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- Add the new foreign key constraint
ALTER TABLE registrations 
    ADD CONSTRAINT registrations_user_id_fkey_new
    FOREIGN KEY (user_id) 
    REFERENCES user_profiles(id);

-- Update the column comment
COMMENT ON COLUMN registrations.user_id IS 'Foreign key to user_profiles(id)';

-- Add an index for better query performance
CREATE INDEX idx_registrations_user_id ON registrations(user_id);
