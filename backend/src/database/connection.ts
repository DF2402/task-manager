// 核心數據庫連接邏輯
import sqlite3 from 'sqlite3';
import { DatabaseConfig } from '../config/database';
import { Pool } from 'pg';

// 核心數據庫類型定義
export type ConnectionStatus = 'connected' | 'disconnected' | 'error';

export interface ConnectionInfo {
  name: string;
  path: string;
  status: ConnectionStatus;
  lastUsed: Date;
}

export interface TransactionOptions {
  immediate?: boolean;
  exclusive?: boolean;
}

export class DatabaseConnection {
  private static instance: sqlite3.Database | null = null;
  private static config: DatabaseConfig;
  
  static initialize(config: DatabaseConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      this.config = config;
      this.instance = new sqlite3.Database(config.path, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        // 啟用外鍵約束
        if (config.foreignKeys) {
          this.instance!.run('PRAGMA foreign_keys = ON');
        }
        resolve();
      });
    });
  }
  
  static getInstance(): sqlite3.Database {
    if (!this.instance) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.instance;
  }
  
  static close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.instance) {
        this.instance.close((err) => {
          if (err) reject(err);
          else {
            this.instance = null;
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

export const getDatabaseConfig = (env: string = 'development'): DatabaseConfig => {
  const configs: Record<string, DatabaseConfig> = {
    development: {
      path: 'dev.db',
      verbose: true,
      foreignKeys: true
    },
    production: {
      path: 'prod.db', 
      verbose: false,
      foreignKeys: true
    }
  };
  
  return configs[env] || configs.development;
};

export function createConnection(config?: DatabaseConfig): sqlite3.Database {
  const dbConfig = config || getDatabaseConfig(process.env.NODE_ENV);
  
  const db = new sqlite3.Database(dbConfig.path);
  
  if (dbConfig.foreignKeys) {
    db.run('PRAGMA foreign_keys = ON');
  }
  
  return db;
}

export class ConnectionManager {
  private connections: Map<string, sqlite3.Database> = new Map();
  
  getConnection(name: string = 'default'): sqlite3.Database {
    let connection = this.connections.get(name);
    
    if (!connection) {
      connection = createConnection();
      this.connections.set(name, connection);
    }
    
    return connection;
  }
  
  closeAll(): void {
    // 關閉所有連接的核心邏輯
    this.connections.forEach(db => db.close());
    this.connections.clear();
  }
}

export const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'task_manager',
    password: process.env.DB_PASSWORD || 'your_password',
    port: parseInt(process.env.DB_PORT || '5432'),
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});