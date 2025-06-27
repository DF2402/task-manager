import { DatabaseConnection } from "../database/connection";

async function seedDatabase() {
  try {
    const db = DatabaseConnection.getInstance();

    // 插入測試用戶數據
    const users = [
      { name: "John Doe", email: "john@example.com", password: "password123" },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "password123",
      },
      {
        name: "Bob Johnson",
        email: "bob@example.com",
        password: "password123",
      },
    ];

    for (const user of users) {
      await new Promise<void>((resolve, reject) => {
        db.run(
          "INSERT INTO User (Name, Email, Password, Active) VALUES (?, ?, ?, 1)",
          [user.name, user.email, user.password],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // 獲取插入的用戶ID
    const userIds = await new Promise<any[]>((resolve, reject) => {
      db.all("SELECT id FROM User", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // 插入任務數據
    const tasks = [
      { content: "完成前端設計", status: "in_progress" },
      { content: "實現用戶認證", status: "to_review" },
      { content: "修復登錄問題", status: "done" },
      { content: "優化數據庫查詢", status: "in_progress" },
      { content: "添加單元測試", status: "to_review" },
      { content: "更新文檔", status: "done" },
    ];

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const userId = userIds[i % userIds.length].id; // 循環分配任務給用戶
      await new Promise<void>((resolve, reject) => {
        db.run(
          `INSERT INTO Task (
            Content, 
            User_Id, 
            Work_in_progress, 
            To_review, 
            Done
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            task.content,
            userId,
            task.status === "in_progress" ? 1 : 0,
            task.status === "to_review" ? 1 : 0,
            task.status === "done" ? 1 : 0,
          ],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // 插入排程記錄
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const dates = [today, yesterday, twoDaysAgo];

    for (const user of userIds) {
      for (const date of dates) {
        await new Promise<void>((resolve, reject) => {
          db.run(
            "INSERT INTO Schedule (User_Id, Date) VALUES (?, ?)",
            [user.id, date.toISOString()],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
    }

    console.log("✅ Seed data inserted successfully");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  // 初始化數據庫連接
  DatabaseConnection.initialize({
    path: "dev.db",
    verbose: true,
    foreignKeys: true,
  }).then(() => {
    seedDatabase()
      .then(() => {
        console.log("🌱 Database seeded successfully");
        process.exit(0);
      })
      .catch((error) => {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
      });
  });
}

export { seedDatabase };
