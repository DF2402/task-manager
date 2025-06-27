import { DatabaseConnection } from "./connection";

export async function validateSchema(): Promise<boolean> {
  const db = DatabaseConnection.getInstance();

  try {
    // 獲取所有用戶表
    const tables = await new Promise<string[]>((resolve, reject) => {
      db.all(
        `SELECT name FROM sqlite_master 
                 WHERE type='table' 
                 AND name NOT LIKE 'sqlite_%'`,
        (err, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows.map((row) => row.name));
        }
      );
    });

    console.log("📊 Found", tables.length, "user tables:", tables);

    // 驗證必要的表是否存在
    const requiredTables = ["Worker", "Task", "Attendance", "users"];
    const missingTables = requiredTables.filter(
      (table) => !tables.includes(table)
    );

    if (missingTables.length > 0) {
      console.error("❌ Missing required tables:", missingTables);
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ Schema validation failed:", error);
    return false;
  }
}
