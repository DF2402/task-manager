import path from 'path';
import { DatabaseCreator } from '../database/DatabaseCreator';
import { validateSchema } from '../database/validator';
import { DatabaseConnection, getDatabaseConfig } from '../database/connection';

async function initializeDatabase(): Promise<boolean> {
  try {
    console.log('🚀 Starting database initialization...');
    
    // 1. 初始化數據庫連接
    const config = getDatabaseConfig(process.env.NODE_ENV || 'development');
    console.log(`📁 Database path: ${config.path}`);
    await DatabaseConnection.initialize(config);
    console.log('✅ Database connection established');
    
    // 2. 創建表結構
    const creator = new DatabaseCreator();
    const sqlPath = path.join(__dirname, '../../sql/create_table.sql');
    await creator.createFromSQL(sqlPath);
    console.log('✅ Tables created successfully');
    
    // 3. 驗證表結構
    const isValid = await validateSchema();
    
    if (isValid) {
      console.log('✅ Database validation passed');
      console.log('🎉 Database initialization completed successfully!');
    } else {
      console.error('❌ Database validation failed');
    }
    
    return isValid;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  } finally {
    // 清理資源
    try {
      await DatabaseConnection.close();
      console.log('🔒 Database connection closed');
    } catch (closeError) {
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

export { initializeDatabase };