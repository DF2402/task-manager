import { DatabaseConnection, getDatabaseConfig } from '../database/connection';
import { readFileSync, readdirSync } from 'fs';
import path from 'path';

interface Migration {
    id: number;
    name: string;
    executed_at: string;
}

class MigrationRunner {
    private db: any;

    constructor() {
        this.db = DatabaseConnection.getInstance();
    }

    // 創建遷移記錄表
    private async createMigrationsTable(): Promise<void> {
        return new Promise((resolve, reject) => {
            const sql = `
                CREATE TABLE IF NOT EXISTS migrations (
                    id INTEGER PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;
            this.db.run(sql, (err: any) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    // 獲取已執行的遷移
    private async getExecutedMigrations(): Promise<Migration[]> {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM migrations ORDER BY id', (err: any, rows: Migration[]) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }

    // 記錄遷移執行
    private async recordMigration(migrationName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO migrations (name) VALUES (?)',
                [migrationName],
                (err: any) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    // 執行 SQL 文件
    private async executeSqlFile(filePath: string): Promise<void> {
        const sql = readFileSync(filePath, 'utf-8');
        
        return new Promise((resolve, reject) => {
            this.db.exec(sql, (err: any) => {
                if (err) {
                    console.error(`❌ Error executing ${filePath}:`, err);
                    reject(err);
                } else {
                    console.log(`✅ Successfully executed ${path.basename(filePath)}`);
                    resolve();
                }
            });
        });
    }

    // 運行遷移
    async runMigrations(): Promise<void> {
        try {
            console.log('🚀 Starting database migrations...');
            
            // 創建遷移記錄表
            await this.createMigrationsTable();
            
            // 獲取已執行的遷移
            const executedMigrations = await this.getExecutedMigrations();
            const executedNames = executedMigrations.map(m => m.name);
            
            // 獲取遷移文件
            const migrationsDir = path.join(__dirname, '../../sql/migrations');
            const migrationFiles = readdirSync(migrationsDir)
                .filter(file => file.endsWith('.sql'))
                .sort();
            
            console.log(`📂 Found ${migrationFiles.length} migration files`);
            console.log(`📊 ${executedNames.length} migrations already executed`);
            
            // 執行未執行的遷移
            for (const file of migrationFiles) {
                if (!executedNames.includes(file)) {
                    console.log(`⚡ Executing migration: ${file}`);
                    const filePath = path.join(migrationsDir, file);
                    
                    try {
                        await this.executeSqlFile(filePath);
                        await this.recordMigration(file);
                        console.log(`✅ Migration ${file} completed successfully`);
                    } catch (error) {
                        console.error(`❌ Migration ${file} failed:`, error);
                        throw error;
                    }
                } else {
                    console.log(`⏭️  Skipping already executed migration: ${file}`);
                }
            }
            
            console.log('🎉 All migrations completed successfully!');
            
        } catch (error) {
            console.error('❌ Migration failed:', error);
            throw error;
        }
    }
}

async function runMigrations() {
    try {
        // 初始化數據庫連接
        const config = getDatabaseConfig(process.env.NODE_ENV || 'development');
        await DatabaseConnection.initialize(config);
        
        const migrationRunner = new MigrationRunner();
        await migrationRunner.runMigrations();
        
        console.log('✅ Migration process completed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration process failed:', error);
        process.exit(1);
    }
}

// 如果直接運行此腳本
if (require.main === module) {
    runMigrations();
}

export { MigrationRunner }; 