import { DatabaseConnection, getDatabaseConfig } from '../database/connection';
import path from 'path';

async function seed() {
    // 初始化數據庫連接
    const config = getDatabaseConfig(process.env.NODE_ENV || 'development');
    await DatabaseConnection.initialize(config);
    
    const db = DatabaseConnection.getInstance();

    // 清空現有數據（按照外鍵約束的順序）
    const clearTables = async () => {
        // 先清空有外鍵約束的表
        await new Promise<void>((resolve, reject) => {
            db.run('DELETE FROM Task', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        await new Promise<void>((resolve, reject) => {
            db.run('DELETE FROM Attendance', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // 最後清空主表
        await new Promise<void>((resolve, reject) => {
            db.run('DELETE FROM Worker', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    };

    // 添加測試工作人員
    const addWorkers = async () => {
        const workers = [
            'Andrew',
            'John',
            'Mary',
            'Peter',
            'Jane'
        ];

        for (const name of workers) {
            await new Promise<void>((resolve, reject) => {
                db.run('INSERT INTO Worker (Name) VALUES (?)', [name], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
    };

    // 添加測試任務
    const addTasks = async () => {
        const tasks = [
            { workerId: 1, content: 'Complete project documentation' },
            { workerId: 2, content: 'Review pull requests' },
            { workerId: 3, content: 'Fix bug in login system' },
            { workerId: 4, content: 'Update user interface' },
            { workerId: 5, content: 'Write unit tests' }
        ];

        for (const task of tasks) {
            await new Promise<void>((resolve, reject) => {
                db.run(
                    'INSERT INTO Task (Worker_Id, Content) VALUES (?, ?)',
                    [task.workerId, task.content],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }
    };

    // 添加考勤記錄
    const addAttendance = async () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // 為每個工作人員添加今天和昨天的考勤記錄
        for (let workerId = 1; workerId <= 5; workerId++) {
            await new Promise<void>((resolve, reject) => {
                db.run(
                    'INSERT INTO Attendance (Worker_Id, Date) VALUES (?, ?)',
                    [workerId, today.toISOString().split('T')[0]],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });

            await new Promise<void>((resolve, reject) => {
                db.run(
                    'INSERT INTO Attendance (Worker_Id, Date) VALUES (?, ?)',
                    [workerId, yesterday.toISOString().split('T')[0]],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }
    };

    try {
        console.log('Start clearing data...');
        await clearTables();
        
        console.log('Start adding workers...');
        await addWorkers();
        
        console.log('Start adding tasks...');
        await addTasks();
        
        console.log('Start adding attendance records...');
        await addAttendance();
        
        console.log('Data seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('Data seeding failed:', error);
        process.exit(1);
    }
}

// execute seed script
seed(); 