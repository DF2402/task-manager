import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import { SQLExecutor } from './SQLExecutor';
import { DatabaseConnection } from './connection';

export class DatabaseCreator {
  private db: sqlite3.Database;
  
  constructor() {
    this.db = DatabaseConnection.getInstance();
  }
  
  async createFromSQL(sqlFilePath: string): Promise<void> {
    const rawSQL = readFileSync(sqlFilePath, 'utf-8');

    // 確保表創建順序：Worker -> Task -> Attendance
    const executor = new SQLExecutor(this.db);
    await executor.executeInOrder(rawSQL);
  }
}