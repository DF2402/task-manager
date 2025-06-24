"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionManager = exports.getDatabaseConfig = exports.DatabaseConnection = void 0;
exports.createConnection = createConnection;
// 核心數據庫連接邏輯
const sqlite3_1 = __importDefault(require("sqlite3"));
class DatabaseConnection {
    static initialize(config) {
        return new Promise((resolve, reject) => {
            this.config = config;
            this.instance = new sqlite3_1.default.Database(config.path, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                // 啟用外鍵約束
                if (config.foreignKeys) {
                    this.instance.run('PRAGMA foreign_keys = ON');
                }
                resolve();
            });
        });
    }
    static getInstance() {
        if (!this.instance) {
            throw new Error('Database not initialized. Call initialize() first.');
        }
        return this.instance;
    }
    static close() {
        return new Promise((resolve, reject) => {
            if (this.instance) {
                this.instance.close((err) => {
                    if (err)
                        reject(err);
                    else {
                        this.instance = null;
                        resolve();
                    }
                });
            }
            else {
                resolve();
            }
        });
    }
}
exports.DatabaseConnection = DatabaseConnection;
DatabaseConnection.instance = null;
const getDatabaseConfig = (env = 'development') => {
    const configs = {
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
exports.getDatabaseConfig = getDatabaseConfig;
function createConnection(config) {
    const dbConfig = config || (0, exports.getDatabaseConfig)(process.env.NODE_ENV);
    const db = new sqlite3_1.default.Database(dbConfig.path);
    if (dbConfig.foreignKeys) {
        db.run('PRAGMA foreign_keys = ON');
    }
    return db;
}
class ConnectionManager {
    constructor() {
        this.connections = new Map();
    }
    getConnection(name = 'default') {
        let connection = this.connections.get(name);
        if (!connection) {
            connection = createConnection();
            this.connections.set(name, connection);
        }
        return connection;
    }
    closeAll() {
        // 關閉所有連接的核心邏輯
        this.connections.forEach(db => db.close());
        this.connections.clear();
    }
}
exports.ConnectionManager = ConnectionManager;
//# sourceMappingURL=connection.js.map