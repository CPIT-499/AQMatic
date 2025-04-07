-- Insert a test user directly
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