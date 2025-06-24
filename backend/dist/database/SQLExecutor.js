"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLExecutor = void 0;
// 核心表創建順序邏輯
class SQLExecutor {
    constructor(db) {
        this.orderedTables = ['Worker', 'Task', 'Attendance'];
        this.db = db;
    }
    executeInOrder(sql) {
        return new Promise((resolve, reject) => {
            // 直接執行完整的SQL腳本
            this.db.exec(sql, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    extractTableSQL(sql, tableName) {
        const regex = new RegExp(`CREATE TABLE ${tableName}[\\s\\S]*?\\);`, 'i');
        const match = sql.match(regex);
        return match ? match[0] : '';
    }
}
exports.SQLExecutor = SQLExecutor;
//# sourceMappingURL=SQLExecutor.js.map