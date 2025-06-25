-- Add admin user
INSERT INTO users (username, password, role)
VALUES (
    'admin',
    -- This is the hashed version of 'admin' using bcrypt
    '$2a$10$rk6ML9Z3z3gzWxFF3wqsK.BW3JTw.c94xjGHkV4qYtEDTnV8YrBSq',
    'admin'
)
ON CONFLICT (username) DO NOTHING; 