-- First, add a test organization if it doesn't exist
INSERT INTO organizations (organization_name, contact_email) 
VALUES ('Test Organization', 'test@example.com')
ON CONFLICT (organization_name) DO NOTHING;

-- Then add a new test user associated with organization 1
-- First check if the user exists
DO $$
DECLARE
    user_exists boolean;
BEGIN
    SELECT EXISTS(SELECT 1 FROM users WHERE email = 'testuser@example.com') INTO user_exists;
    
    IF user_exists THEN
        -- Update existing user
        UPDATE users
        SET 
            password_hash = 'password123',
            name = 'Test User',
            role = 'admin'
        WHERE email = 'testuser@example.com';
    ELSE
        -- Add a new test user
        INSERT INTO users (
            organization_id,
            username,
            password_hash,
            email,
            role,
            name,
            "emailVerified"
        )
        VALUES (
            1,
            'testuser',
            'password123',
            'testuser@example.com',
            'admin',
            'Test User',
            NOW()
        );
    END IF;
END $$; 