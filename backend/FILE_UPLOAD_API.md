# 文件上傳 API 使用說明

## 概述
後端現在支援完整的文件上傳功能，包括文件上傳、下載、按任務查詢等功能。

## API 端點

### 1. 文件上傳
**POST** `/api/files/upload`

**描述**: 上傳文件並關聯到指定任務

**請求格式**: `multipart/form-data`

**參數**:
- `files`: 文件數據（支援多文件上傳，最多5個）
- `taskId`: 任務ID（必需）

**支援的文件類型**:
- 圖片: JPEG, PNG, GIF, WebP
- 文檔: PDF, TXT, DOC, DOCX, XLS, XLSX

**文件大小限制**: 10MB

**示例**:
```bash
curl -X POST \
  -F "files=@document.pdf" \
  -F "files=@image.jpg" \
  -F "taskId=15" \
  http://localhost:3001/api/files/upload
```

**響應**:
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "File_Name": "document.pdf",
      "File_Path": "/path/to/uploads/1750840794675_document.pdf",
      "File_Type": "application/pdf",
      "File_Size": 1024,
      "Created_At": "2025-06-25T08:39:54.676Z",
      "Updated_At": "2025-06-25T08:39:54.676Z"
    }
  ],
  "message": "Successfully uploaded 1 file(s)",
  "count": 1
}
```

### 2. 根據任務獲取文件
**GET** `/api/files/task/:taskId`

**描述**: 獲取指定任務的所有相關文件

**示例**:
```bash
curl -X GET http://localhost:3001/api/files/task/15
```

**響應**:
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "File_Name": "document.pdf",
      "File_Path": "/path/to/uploads/1750840794675_document.pdf",
      "File_Type": "application/pdf",
      "File_Size": 1024,
      "Created_At": "2025-06-25T08:39:54.676Z",
      "Updated_At": "2025-06-25T08:39:54.676Z"
    }
  ],
  "count": 1
}
```

### 3. 文件下載
**GET** `/api/files/download/:id`

**描述**: 下載指定ID的文件

**示例**:
```bash
curl -X GET http://localhost:3001/api/files/download/5 -o downloaded_file.pdf
```

### 4. 其他文件管理 API

#### 獲取所有文件
**GET** `/api/files`

#### 獲取單個文件信息
**GET** `/api/files/:id`

#### 創建文件記錄
**POST** `/api/files`

#### 更新文件記錄
**PUT** `/api/files/:id`

#### 刪除文件
**DELETE** `/api/files/:id`

## 錯誤處理

### 常見錯誤響應:

**文件類型不支援**:
```json
{
  "success": false,
  "message": "Invalid file type. Only images, PDFs, and documents are allowed."
}
```

**文件過大**:
```json
{
  "success": false,
  "message": "File too large"
}
```

**任務ID不存在**:
```json
{
  "success": false,
  "message": "Data constraint violation"
}
```

**文件不存在**:
```json
{
  "success": false,
  "message": "File not found"
}
```

## 前端集成

前端可以使用 FormData API 來上傳文件：

```javascript
const uploadFiles = async (files, taskId) => {
  const formData = new FormData();
  
  // 添加文件
  Array.from(files).forEach(file => {
    formData.append('files', file);
  });
  
  // 添加任務ID
  formData.append('taskId', taskId);
  
  try {
    const response = await fetch('http://localhost:3001/api/files/upload', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};
```

## 文件存儲

- 上傳的文件存儲在 `backend/uploads/` 目錄
- 文件名格式: `{timestamp}_{sanitized_original_name}`
- 靜態文件可通過 `/uploads/{filename}` 路徑訪問 