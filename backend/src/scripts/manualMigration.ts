import { DatabaseConnection, getDatabaseConfig } from '../database/connection';
import { SQLExecutor } from '../database/SQLExecutor';
import { readFileSync } from 'fs';
import path from 'path';

/**
 * 手動遷移助手類別
 * 提供手動執行 SQL 語句的工具
 */
class ManualMigrationHelper {
  private db: any;
  private sqlExecutor: SQLExecutor;

  constructor() {
    this.db = DatabaseConnection.getInstance();
    this.sqlExecutor = new SQLExecutor(this.db);
  }

  /**
   * 執行單個 SQL 語句
   */
  async executeSingleSQL(sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`📝 Executing SQL: ${sql.substring(0, 100)}...`);
      
      this.db.run(sql, (err: any) => {
        if (err) {
          console.error('❌ SQL execution failed:', err.message);
          reject(err);
        } else {
          console.log('✅ SQL executed successfully');
          resolve();
        }
      });
    });
  }

  /**
   * 執行 SQL 檔案
   */
  async executeSQLFile(filePath: string): Promise<void> {
    try {
      const sql = readFileSync(filePath, 'utf-8');
      console.log(`📁 Executing SQL file: ${filePath}`);
      await this.sqlExecutor.executeInOrder(sql);
      console.log('✅ SQL file executed successfully');
    } catch (error) {
      console.error('❌ Failed to execute SQL file:', error);
      throw error;
    }
  }

  /**
   * 檢查表是否存在
   */
  async tableExists(tableName: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const sql = `SELECT name FROM sqlite_master WHERE type='table' AND name=?`;
      
      this.db.get(sql, [tableName], (err: any, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(!!row);
        }
      });
    });
  }

  /**
   * 獲取表結構信息
   */
  async getTableInfo(tableName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const sql = `PRAGMA table_info(${tableName})`;
      
      this.db.all(sql, (err: any, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * 列出所有表
   */
  async listTables(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const sql = `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`;
      
      this.db.all(sql, (err: any, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map((row: any) => row.name));
        }
      });
    });
  }

  /**
   * 備份表資料
   */
  async backupTable(tableName: string): Promise<void> {
    const backupTableName = `${tableName}_backup_${Date.now()}`;
    const sql = `CREATE TABLE ${backupTableName} AS SELECT * FROM ${tableName}`;
    
    await this.executeSingleSQL(sql);
    console.log(`✅ Table ${tableName} backed up as ${backupTableName}`);
  }

  /**
   * 獲取表的記錄數量
   */
  async getRecordCount(tableName: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const sql = `SELECT COUNT(*) as count FROM ${tableName}`;
      
      this.db.get(sql, (err: any, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  }
}

/**
 * 命令行界面
 */
async function runManualMigration() {
  try {
    // 初始化資料庫連接
    const config = getDatabaseConfig(process.env.NODE_ENV || 'development');
    console.log(`📁 Database path: ${config.path}`);
    await DatabaseConnection.initialize(config);
    console.log('✅ Database connection established');

    const helper = new ManualMigrationHelper();
    const command = process.argv[2];
    const param = process.argv[3];

    switch (command) {
      case 'list-tables':
        const tables = await helper.listTables();
        console.log('📋 Available tables:');
        tables.forEach(table => console.log(`  - ${table}`));
        break;

      case 'table-info':
        if (!param) {
          console.error('❌ Please provide table name');
          process.exit(1);
        }
        const info = await helper.getTableInfo(param);
        console.log(`📊 Table structure for ${param}:`);
        console.table(info);
        break;

      case 'backup':
        if (!param) {
          console.error('❌ Please provide table name');
          process.exit(1);
        }
        await helper.backupTable(param);
        break;

      case 'count':
        if (!param) {
          console.error('❌ Please provide table name');
          process.exit(1);
        }
        const count = await helper.getRecordCount(param);
        console.log(`📊 ${param} has ${count} records`);
        break;

      case 'execute-file':
        if (!param) {
          console.error('❌ Please provide SQL file path');
          process.exit(1);
        }
        await helper.executeSQLFile(param);
        break;

      default:
        console.log('🔧 Manual Migration Helper');
        console.log('Available commands:');
        console.log('  list-tables          - 列出所有表');
        console.log('  table-info <name>    - 查看表結構');
        console.log('  backup <name>        - 備份表');
        console.log('  count <name>         - 查看表記錄數');
        console.log('  execute-file <path>  - 執行 SQL 檔案');
        console.log('');
        console.log('Examples:');
        console.log('  npm run migration list-tables');
        console.log('  npm run migration table-info Worker');
        console.log('  npm run migration backup Task');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    try {
      await DatabaseConnection.close();
      console.log('🔒 Database connection closed');
    } catch (closeError) {
      console.warn('⚠️ Warning: Failed to close database connection:', closeError);
    }
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  runManualMigration().catch(console.error);
}

export { ManualMigrationHelper }; 