"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSchema = validateSchema;
const connection_1 = require("./connection");
function validateSchema() {
    return new Promise((resolve) => {
        const db = connection_1.DatabaseConnection.getInstance();
        // 排除系統表，只查詢用戶創建的表
        db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", (err, tables) => {
            if (err) {
                console.error('❌ Database query error:', err);
                resolve(false);
                return;
            }
            console.log(`📊 Found ${tables.length} user tables:`, tables.map(t => t.name));
            if (tables.length !== 3) {
                console.error(`❌ Expected 3 tables, found ${tables.length}`);
                resolve(false);
                return;
            }
            const tableNames = tables.map(t => t.name);
            const requiredTables = ['Worker', 'Task', 'Attendance'];
            const missingTables = requiredTables.filter(name => !tableNames.includes(name));
            if (missingTables.length > 0) {
                console.error('❌ Missing required tables:', missingTables);
                resolve(false);
                return;
            }
            console.log('✅ All required tables found:', tableNames);
            resolve(true);
        });
    });
}
//# sourceMappingURL=validator.js.map