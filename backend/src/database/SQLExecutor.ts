import sqlite3 from 'sqlite3';

// 核心表創建順序邏輯
export class SQLExecutor {
    private orderedTables = ['Worker', 'Task', 'Attendance'];
    private db: sqlite3.Database;
    
    constructor(db: sqlite3.Database) {
        this.db = db;
    }
    
    executeInOrder(sql: string): Promise<void> {
        return new Promise((resolve, reject) => {
            // 直接執行完整的SQL腳本
            this.db.exec(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    private extractTableSQL(sql: string, tableName: string): string {
        const regex = new RegExp(`CREATE TABLE ${tableName}[\\s\\S]*?\\);`, 'i');
        const match = sql.match(regex);
        return match ? match[0] : '';
    }
}

