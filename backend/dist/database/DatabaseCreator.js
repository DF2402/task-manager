"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseCreator = void 0;
const fs_1 = require("fs");
const SQLExecutor_1 = require("./SQLExecutor");
const connection_1 = require("./connection");
class DatabaseCreator {
    constructor() {
        this.db = connection_1.DatabaseConnection.getInstance();
    }
    async createFromSQL(sqlFilePath) {
        const rawSQL = (0, fs_1.readFileSync)(sqlFilePath, 'utf-8');
        // 確保表創建順序：Worker -> Task -> Attendance
        const executor = new SQLExecutor_1.SQLExecutor(this.db);
        await executor.executeInOrder(rawSQL);
    }
}
exports.DatabaseCreator = DatabaseCreator;
//# sourceMappingURL=DatabaseCreator.js.map