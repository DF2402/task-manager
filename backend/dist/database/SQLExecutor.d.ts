import sqlite3 from 'sqlite3';
export declare class SQLExecutor {
    private orderedTables;
    private db;
    constructor(db: sqlite3.Database);
    executeInOrder(sql: string): Promise<void>;
    private extractTableSQL;
}
//# sourceMappingURL=SQLExecutor.d.ts.map