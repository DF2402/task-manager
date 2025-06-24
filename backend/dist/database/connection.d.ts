import sqlite3 from 'sqlite3';
import { DatabaseConfig } from '../config/database';
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
export declare class DatabaseConnection {
    private static instance;
    private static config;
    static initialize(config: DatabaseConfig): Promise<void>;
    static getInstance(): sqlite3.Database;
    static close(): Promise<void>;
}
export declare const getDatabaseConfig: (env?: string) => DatabaseConfig;
export declare function createConnection(config?: DatabaseConfig): sqlite3.Database;
export declare class ConnectionManager {
    private connections;
    getConnection(name?: string): sqlite3.Database;
    closeAll(): void;
}
//# sourceMappingURL=connection.d.ts.map