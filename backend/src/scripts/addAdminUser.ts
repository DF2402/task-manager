import { pool } from '../database/connection';
import bcrypt from 'bcryptjs';

async function addAdminUser() {
    try {
        // Check if admin user already exists
        const existingAdmin = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            ['admin']
        );

        if (existingAdmin.rows.length > 0) {
            console.log('Admin user already exists');
            return;
        }

        // Generate hashed password for 'admin'
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin', salt);

        // Insert admin user
        await pool.query(
            'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
            ['admin', hashedPassword, 'admin']
        );

        console.log('Admin user created successfully');
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await pool.end();
    }
}

// Run the script
addAdminUser(); 