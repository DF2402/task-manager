"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("../database/connection");
async function seed() {
    // 初始化數據庫連接
    const config = (0, connection_1.getDatabaseConfig)(process.env.NODE_ENV || 'development');
    await connection_1.DatabaseConnection.initialize(config);
    const db = connection_1.DatabaseConnection.getInstance();
    // 清空現有數據
    const clearTables = async () => {
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM Attendance', (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM Task', (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM Worker', (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
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
            await new Promise((resolve, reject) => {
                db.run('INSERT INTO Worker (Name) VALUES (?)', [name], (err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            });
        }
    };
    // 添加測試任務
    const addTasks = async () => {
        const tasks = [
            { content: 'Design Home Page', workerId: 1, inProgress: true },
            { content: 'Implement User Registration', workerId: 2, inProgress: true },
            { content: 'Fix Login Page Bug', workerId: 3, toReview: true },
            { content: 'Optimize Database Query', workerId: 4, done: true },
            { content: 'Write API Documentation', workerId: 5 },
            { content: 'Unit Test', workerId: 1 },
            { content: 'Deploy Test Environment', workerId: 2, inProgress: true },
            { content: 'Code Review', workerId: 3, toReview: true },
            { content: 'Performance Optimization', workerId: 4 },
            { content: 'User Interface Test', workerId: 5, inProgress: true }
        ];
        for (const task of tasks) {
            await new Promise((resolve, reject) => {
                db.run('INSERT INTO Task (Content, Worker_Id, Work_in_progress, To_review, Done) VALUES (?, ?, ?, ?, ?)', [task.content, task.workerId, task.inProgress ? 1 : 0, task.toReview ? 1 : 0, task.done ? 1 : 0], (err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
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
            await new Promise((resolve, reject) => {
                db.run('INSERT INTO Attendance (Worker_Id, Date) VALUES (?, ?)', [workerId, today.toISOString()], (err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            });
            await new Promise((resolve, reject) => {
                db.run('INSERT INTO Attendance (Worker_Id, Date) VALUES (?, ?)', [workerId, yesterday.toISOString()], (err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
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
    }
    catch (error) {
        console.error('Data seeding failed:', error);
        process.exit(1);
    }
}
// execute seed script
seed();
//# sourceMappingURL=seed.js.map