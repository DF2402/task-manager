-- =====================================================
-- Migration 1: 重構資料庫結構
-- 將 Worker 改為 User，添加新的表和關係
-- =====================================================

-- SQLite 需要先禁用外鍵約束檢查
PRAGMA foreign_keys = OFF;

-- 1. 先刪除舊的表和欄位（注意：這會刪除外鍵約束）
-- 因為我們要重建 Task 表，所以暫時不需要刪除 Worker_Id 欄位
DROP TABLE IF EXISTS Worker;
DROP TABLE IF EXISTS Attendance;

-- 2. 創建新的 User 表
CREATE TABLE User (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NULL,
    Password VARCHAR(255) NOT NULL,
    Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    On_boarded_at DATETIME NULL,
    Active BOOLEAN DEFAULT 0
);

-- 3. 為 Task 表添加 User_Id 欄位（先創建 User 表後再添加）
-- 這個步驟將在重建 Task 表時一起完成

-- 4. 創建 Schedule 表
CREATE TABLE Schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    User_Id INTEGER NULL,
    Date DATETIME NULL,
    Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (User_Id) REFERENCES User(id)
);

-- 5. 創建 File 表
CREATE TABLE File (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    File_Name VARCHAR(255) NOT NULL,
    File_Path VARCHAR(255) NOT NULL,
    File_Type VARCHAR(255) NOT NULL,
    File_Size INTEGER NOT NULL,
    Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    Updated_At DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. 創建 Upload 表
CREATE TABLE Upload (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    File_Id INTEGER NULL,
    Task_Id INTEGER NULL,
    Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (File_Id) REFERENCES File(id),
    FOREIGN KEY (Task_Id) REFERENCES Task(id)
);

-- 7. 重新建立 Task 表以添加外鍵約束
-- 因為 SQLite 不支援 ALTER TABLE ADD CONSTRAINT，需要重建表
CREATE TABLE Task_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    Content VARCHAR(255) NULL,
    User_Id INTEGER NULL,
    Work_in_progress BOOLEAN DEFAULT 0,
    To_review BOOLEAN DEFAULT 0,
    Done BOOLEAN DEFAULT 0,
    Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    Updated_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (User_Id) REFERENCES User(id)
);

-- 8. 複製 Task 表的資料（User_Id 設為 NULL，因為原表沒有這個欄位）
INSERT INTO Task_new (id, Content, User_Id, Work_in_progress, To_review, Done, Created_At, Updated_At)
SELECT id, Content, NULL as User_Id, Work_in_progress, To_review, Done, Created_At, Updated_At FROM Task;

-- 9. 替換舊的 Task 表
DROP TABLE Task;
ALTER TABLE Task_new RENAME TO Task;

-- 10. 建立索引以提升效能
CREATE INDEX idx_user_email ON User(Email);
CREATE INDEX idx_task_user_id ON Task(User_Id);
CREATE INDEX idx_schedule_user_id ON Schedule(User_Id);
CREATE INDEX idx_schedule_date ON Schedule(Date);
CREATE INDEX idx_upload_file_id ON Upload(File_Id);
CREATE INDEX idx_upload_task_id ON Upload(Task_Id);

-- 重新啟用外鍵約束檢查
PRAGMA foreign_keys = ON;
