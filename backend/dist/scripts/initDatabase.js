"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
const path_1 = __importDefault(require("path"));
const DatabaseCreator_1 = require("../database/DatabaseCreator");
const validator_1 = require("../database/validator");
const connection_1 = require("../database/connection");
async function initializeDatabase() {
    try {
        console.log('🚀 Starting database initialization...');
        // 1. 初始化數據庫連接
        const config = (0, connection_1.getDatabaseConfig)(process.env.NODE_ENV || 'development');
        console.log(`📁 Database path: ${config.path}`);
        await connection_1.DatabaseConnection.initialize(config);
        console.log('✅ Database connection established');
        // 2. 創建表結構
        const creator = new DatabaseCreator_1.DatabaseCreator();
        const sqlPath = path_1.default.join(__dirname, '../../sql/create_table.sql');
        await creator.createFromSQL(sqlPath);
        console.log('✅ Tables created successfully');
        // 3. 驗證表結構
        const isValid = await (0, validator_1.validateSchema)();
        if (isValid) {
            console.log('✅ Database validation passed');
            console.log('🎉 Database initialization completed successfully!');
        }
        else {
            console.error('❌ Database validation failed');
        }
        return isValid;
    }
    catch (error) {
        console.error('❌ Database initialization failed:', error);
        return false;
    }
    finally {
        // 清理資源
        try {
            await connection_1.DatabaseConnection.close();
            console.log('🔒 Database connection closed');
        }
        catch (closeError) {
            console.warn('⚠️ Warning: Failed to close database connection:', closeError);
        }
    }
}
// 直接執行入口
async function main() {
    const success = await initializeDatabase();
    process.exit(success ? 0 : 1);
}
// 如果直接運行此腳本，執行初始化
if (require.main === module) {
    main().catch(console.error);
}
//# sourceMappingURL=initDatabase.js.map