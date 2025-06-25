import { DatabaseConnection, getDatabaseConfig } from '../database/connection';
import path from 'path';

async function seed() {
    // 初始化數據庫連接
    const config = getDatabaseConfig(process.env.NODE_ENV || 'development');
    await DatabaseConnection.initialize(config);
    
    const db = DatabaseConnection.getInstance();

    // 啟用外鍵約束
    await new Promise<void>((resolve, reject) => {
        db.run('PRAGMA foreign_keys = ON', (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // 清空現有數據（按照外鍵約束的順序）
    const clearTables = async () => {
        // 先清空有外鍵約束的表
        await new Promise<void>((resolve, reject) => {
            db.run('DELETE FROM Upload', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        await new Promise<void>((resolve, reject) => {
            db.run('DELETE FROM Task', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        await new Promise<void>((resolve, reject) => {
            db.run('DELETE FROM Schedule', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        await new Promise<void>((resolve, reject) => {
            db.run('DELETE FROM File', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // 最後清空主表
        await new Promise<void>((resolve, reject) => {
            db.run('DELETE FROM User', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    };

    // 添加測試用戶
    const addUsers = async () => {
        const users = [
            { name: 'Andrew Chen', email: 'andrew@example.com', password: 'password123' },
            { name: 'John Smith', email: 'john@example.com', password: 'password123' },
            { name: 'Mary Johnson', email: 'mary@example.com', password: 'password123' },
            { name: 'Peter Wang', email: 'peter@example.com', password: 'password123' },
            { name: 'Jane Davis', email: 'jane@example.com', password: 'password123' }
        ];

        for (const user of users) {
            await new Promise<void>((resolve, reject) => {
                db.run(
                    'INSERT INTO User (Name, Email, Password, Active) VALUES (?, ?, ?, ?)', 
                    [user.name, user.email, user.password, 1], 
                    function(err) {
                        if (err) {
                            console.error(`添加用戶失敗: ${user.name}`, err);
                            reject(err);
                        } else {
                            console.log(`成功添加用戶: ${user.name} (ID: ${this.lastID})`);
                            resolve();
                        }
                    }
                );
            });
        }
    };

    // 檢查用戶是否存在
    const checkUsersExist = async (): Promise<number[]> => {
        return new Promise((resolve, reject) => {
            db.all('SELECT id FROM User ORDER BY id', (err, rows: any[]) => {
                if (err) {
                    reject(err);
                } else {
                    const userIds = rows.map(row => row.id);
                    console.log('現有用戶 IDs:', userIds);
                    resolve(userIds);
                }
            });
        });
    };

    // 添加測試任務
    const addTasks = async () => {
        // 先檢查用戶是否存在
        const userIds = await checkUsersExist();
        if (userIds.length === 0) {
            throw new Error('沒有找到用戶，無法添加任務');
        }

        const tasks = [
            { userId: userIds[0], content: 'Complete project documentation' },
            { userId: userIds[1], content: 'Review pull requests' },
            { userId: userIds[2], content: 'Fix bug in login system' },
            { userId: userIds[3], content: 'Update user interface' },
            { userId: userIds[4], content: 'Write unit tests' },
            { userId: userIds[0], content: 'Database optimization' },
            { userId: userIds[1], content: 'Code refactoring' },
            { userId: userIds[2], content: 'API testing' }
        ];

        for (const task of tasks) {
            await new Promise<void>((resolve, reject) => {
                db.run(
                    'INSERT INTO Task (User_Id, Content, Work_in_progress, To_review, Done) VALUES (?, ?, ?, ?, ?)',
                    [task.userId, task.content, Math.random() > 0.5 ? 1 : 0, Math.random() > 0.7 ? 1 : 0, Math.random() > 0.8 ? 1 : 0],
                    function(err) {
                        if (err) {
                            console.error(`添加任務失敗: ${task.content}`, err);
                            reject(err);
                        } else {
                            console.log(`成功添加任務: ${task.content} (用戶ID: ${task.userId})`);
                            resolve();
                        }
                    }
                );
            });
        }
    };

    // 添加排程記錄
    const addSchedules = async () => {
        // 先檢查用戶是否存在
        const userIds = await checkUsersExist();
        if (userIds.length === 0) {
            throw new Error('沒有找到用戶，無法添加排程');
        }

        const today = new Date();
        const dates = [];
        
        // 生成過去7天和未來7天的日期
        for (let i = -7; i <= 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            dates.push(date.toISOString().split('T')[0]);
        }
        
        // 為每個用戶隨機添加一些排程記錄
        for (const userId of userIds) {
            const selectedDates = dates.filter(() => Math.random() > 0.6); // 隨機選擇40%的日期
            
            for (const date of selectedDates) {
                await new Promise<void>((resolve, reject) => {
                    db.run(
                        'INSERT INTO Schedule (User_Id, Date) VALUES (?, ?)',
                        [userId, date],
                        function(err) {
                            if (err) {
                                console.error(`添加排程失敗: 用戶${userId}, 日期${date}`, err);
                                reject(err);
                            } else {
                                resolve();
                            }
                        }
                    );
                });
            }
        }
    };

    // 添加測試文件
    const addFiles = async () => {
        const files = [
            { fileName: 'project_spec.pdf', filePath: '/uploads/documents/project_spec.pdf', fileType: 'application/pdf', fileSize: 1024000 },
            { fileName: 'design_mockup.png', filePath: '/uploads/images/design_mockup.png', fileType: 'image/png', fileSize: 512000 },
            { fileName: 'code_review.md', filePath: '/uploads/documents/code_review.md', fileType: 'text/markdown', fileSize: 8192 },
            { fileName: 'test_data.csv', filePath: '/uploads/data/test_data.csv', fileType: 'text/csv', fileSize: 204800 }
        ];

        for (const file of files) {
            await new Promise<void>((resolve, reject) => {
                db.run(
                    'INSERT INTO File (File_Name, File_Path, File_Type, File_Size) VALUES (?, ?, ?, ?)',
                    [file.fileName, file.filePath, file.fileType, file.fileSize],
                    function(err) {
                        if (err) {
                            console.error(`添加文件失敗: ${file.fileName}`, err);
                            reject(err);
                        } else {
                            console.log(`成功添加文件: ${file.fileName}`);
                            resolve();
                        }
                    }
                );
            });
        }
    };

    try {
        console.log('開始清空數據...');
        await clearTables();
        
        console.log('開始添加用戶...');
        await addUsers();
        
        console.log('開始添加任務...');
        await addTasks();
        
        console.log('開始添加排程記錄...');
        await addSchedules();
        
        console.log('開始添加文件...');
        await addFiles();
        
        console.log('數據填充完成！');
        
        // 顯示統計信息
        const stats = await new Promise<any>((resolve, reject) => {
            db.all(`
                SELECT 
                    (SELECT COUNT(*) FROM User) as users,
                    (SELECT COUNT(*) FROM Task) as tasks,
                    (SELECT COUNT(*) FROM Schedule) as schedules,
                    (SELECT COUNT(*) FROM File) as files
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
        
        console.log('統計信息:');
        console.log(`- 用戶: ${stats.users}`);
        console.log(`- 任務: ${stats.tasks}`);
        console.log(`- 排程: ${stats.schedules}`);
        console.log(`- 文件: ${stats.files}`);
        
        process.exit(0);
    } catch (error) {
        console.error('數據填充失敗:', error);
        process.exit(1);
    }
}

// 執行 seed 腳本
seed(); 