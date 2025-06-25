import { DatabaseConnection, getDatabaseConfig } from '../database/connection';

async function seedUsers() {
    try {
        // 初始化數據庫連接
        const config = getDatabaseConfig(process.env.NODE_ENV || 'development');
        await DatabaseConnection.initialize(config);
        
        const db = DatabaseConnection.getInstance();

        console.log('🚀 Starting user data seeding...');

        // 添加測試用戶
        const users = [
            { Name: 'Andrew Chen', Email: 'andrew@example.com', Password: 'password123' },
            { Name: 'John Smith', Email: 'john@example.com', Password: 'password123' },
            { Name: 'Mary Johnson', Email: 'mary@example.com', Password: 'password123' },
            { Name: 'Peter Wang', Email: 'peter@example.com', Password: 'password123' },
            { Name: 'Jane Liu', Email: 'jane@example.com', Password: 'password123' }
        ];

        for (const user of users) {
            await new Promise<void>((resolve, reject) => {
                db.run(
                    'INSERT INTO User (Name, Email, Password, Active) VALUES (?, ?, ?, ?)',
                    [user.Name, user.Email, user.Password, 1],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
            console.log(`✅ Created user: ${user.Name}`);
        }

        // 更新現有任務的 User_Id（如果有的話）
        await new Promise<void>((resolve, reject) => {
            db.run(
                'UPDATE Task SET User_Id = 1 WHERE User_Id IS NULL',
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        console.log('🎉 User data seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ User data seeding failed:', error);
        process.exit(1);
    }
}

// 如果直接運行此腳本
if (require.main === module) {
    seedUsers();
}

export { seedUsers }; 