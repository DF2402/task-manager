# 手動資料庫遷移指南

## 概述
本指南提供手動執行資料庫結構更新和遷移的最佳實踐方法。

## 目前的資料庫結構

### 表結構
- **Worker**: 員工表
  - `id`: 主鍵
  - `Name`: 員工姓名
  
- **Task**: 任務表
  - `id`: 主鍵
  - `Content`: 任務內容
  - `Worker_Id`: 員工 ID（外鍵）
  - `Work_in_progress`: 進行中狀態
  - `To_review`: 待審核狀態
  - `Done`: 完成狀態
  - `Created_At`: 建立時間
  - `Updated_At`: 更新時間
  
- **Attendance**: 出勤表
  - `id`: 主鍵
  - `Worker_Id`: 員工 ID（外鍵）
  - `Date`: 出勤日期

## 手動遷移工具

### 1. 使用遷移助手命令

```bash
# 列出所有表
npm run migration list-tables

# 查看表結構
npm run migration table-info Worker
npm run migration table-info Task
npm run migration table-info Attendance

# 查看表記錄數
npm run migration count Worker

# 備份表（建議在修改前執行）
npm run migration backup Worker
npm run migration backup Task

# 執行 SQL 檔案
npm run migration execute-file sql/your-migration.sql
```

## 手動遷移步驟

### 1. 準備階段

#### 1.1 備份資料庫
```bash
# 複製資料庫檔案
cp dev.db dev.db.backup
```

#### 1.2 檢查當前狀態
```bash
# 檢查表結構
npm run migration table-info Worker
npm run migration list-tables
```

### 2. 常見遷移場景

#### 2.1 添加新欄位

**範例：為 Worker 表添加 email 欄位**

1. 建立 SQL 檔案 `sql/add_worker_email.sql`：
```sql
-- 添加 email 欄位到 Worker 表
ALTER TABLE Worker ADD COLUMN email VARCHAR(255);

-- 建立索引（可選）
CREATE INDEX idx_worker_email ON Worker(email);
```

2. 執行遷移：
```bash
npm run migration execute-file sql/add_worker_email.sql
```

3. 驗證結果：
```bash
npm run migration table-info Worker
```

#### 2.2 修改現有欄位

**注意：SQLite 不支援直接修改欄位，需要重建表**

**範例：修改 Worker.Name 欄位長度**

1. 建立 SQL 檔案 `sql/modify_worker_name.sql`：
```sql
-- 1. 建立新表結構
CREATE TABLE Worker_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name VARCHAR(500) NOT NULL,  -- 修改長度
    email VARCHAR(255)  -- 如果之前已添加
);

-- 2. 複製資料
INSERT INTO Worker_new (id, Name, email)
SELECT id, Name, email FROM Worker;

-- 3. 刪除舊表
DROP TABLE Worker;

-- 4. 重新命名
ALTER TABLE Worker_new RENAME TO Worker;

-- 5. 重建索引
CREATE INDEX idx_worker_email ON Worker(email);
```

2. 執行遷移：
```bash
npm run migration execute-file sql/modify_worker_name.sql
```

#### 2.3 添加新表

**範例：添加 Project 表**

1. 建立 SQL 檔案 `sql/add_project_table.sql`：
```sql
-- 建立專案表
CREATE TABLE Project (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATETIME,
    end_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 建立索引
CREATE INDEX idx_project_name ON Project(name);
```

2. 執行遷移：
```bash
npm run migration execute-file sql/add_project_table.sql
```

#### 2.4 添加外鍵關係

**範例：Task 表添加 project_id**

1. 建立 SQL 檔案 `sql/add_task_project_relation.sql`：
```sql
-- 1. 先添加欄位
ALTER TABLE Task ADD COLUMN project_id INTEGER;

-- 2. 重建表以添加外鍵約束
CREATE TABLE Task_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    Content VARCHAR(255) NULL,
    Worker_Id INTEGER NULL,
    project_id INTEGER NULL,
    Work_in_progress BOOLEAN DEFAULT 0,
    To_review BOOLEAN DEFAULT 0,
    Done BOOLEAN DEFAULT 0,
    Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    Updated_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Worker_Id) REFERENCES Worker(id),
    FOREIGN KEY (project_id) REFERENCES Project(id)
);

-- 3. 複製資料
INSERT INTO Task_new SELECT * FROM Task;

-- 4. 替換表
DROP TABLE Task;
ALTER TABLE Task_new RENAME TO Task;

-- 5. 重建索引
CREATE INDEX idx_task_worker_id ON Task(Worker_Id);
CREATE INDEX idx_task_project_id ON Task(project_id);
```

### 3. 遷移後驗證

#### 3.1 結構驗證
```bash
# 檢查表結構
npm run migration table-info Worker
npm run migration table-info Task
npm run migration table-info Project

# 檢查資料數量
npm run migration count Worker
npm run migration count Task
npm run migration count Project
```

#### 3.2 資料完整性檢查

建立驗證 SQL 檔案 `sql/verify_integrity.sql`：
```sql
-- 檢查外鍵完整性
SELECT 'Invalid Task Worker_Id' as issue, COUNT(*) as count
FROM Task WHERE Worker_Id NOT IN (SELECT id FROM Worker);

SELECT 'Invalid Task project_id' as issue, COUNT(*) as count
FROM Task WHERE project_id IS NOT NULL AND project_id NOT IN (SELECT id FROM Project);

SELECT 'Invalid Attendance Worker_Id' as issue, COUNT(*) as count
FROM Attendance WHERE Worker_Id NOT IN (SELECT id FROM Worker);
```

## 最佳實踐

### 1. 遷移前檢查清單
- [ ] 備份資料庫檔案
- [ ] 備份相關表資料
- [ ] 檢查當前表結構
- [ ] 測試 SQL 語句

### 2. 遷移執行
- [ ] 在開發環境測試
- [ ] 分段執行複雜遷移
- [ ] 記錄每個步驟
- [ ] 驗證每個步驟結果

### 3. 遷移後驗證
- [ ] 檢查表結構正確性
- [ ] 驗證資料完整性
- [ ] 測試應用程式功能
- [ ] 檢查效能影響

### 4. 回滾計劃
- [ ] 保留原始資料庫備份
- [ ] 準備回滾 SQL 語句
- [ ] 測試回滾過程

## 故障排除

### 常見錯誤

#### 1. 外鍵約束錯誤
```
FOREIGN KEY constraint failed
```
**解決方案：** 確保外鍵參照的資料存在

#### 2. 欄位已存在錯誤
```
duplicate column name
```
**解決方案：** 檢查欄位是否已存在

#### 3. 表鎖定錯誤
```
database is locked
```
**解決方案：** 確保沒有其他連接佔用資料庫

### 緊急回滾
```bash
# 停止應用程式
# 還原備份檔案
cp dev.db.backup dev.db
# 重新啟動應用程式
```

## 進階技巧

### 1. 批次資料更新
```sql
-- 使用 CASE 語句進行條件更新
UPDATE Task 
SET priority = CASE 
    WHEN Work_in_progress = 1 THEN 2
    WHEN To_review = 1 THEN 3
    ELSE 1
END;
```

### 2. 資料遷移
```sql
-- 從舊格式遷移到新格式
UPDATE Task 
SET deadline = datetime(Created_At, '+7 days')
WHERE deadline IS NULL;
```

### 3. 效能最佳化
```sql
-- 建立複合索引
CREATE INDEX idx_task_status_worker ON Task(Work_in_progress, To_review, Done, Worker_Id);
``` 