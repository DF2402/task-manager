# TaskDetail.tsx 樣式命名統一化

## 概述

為了提高代碼的可維護性和一致性，我們對 TaskDetail.tsx 中的 CSS 類名進行了統一化重構。

## 命名約定

### 🎯 **命名原則**

1. **語義化命名**: 類名應該描述元素的功能而不是外觀
2. **層次結構**: 使用前綴來表示組件層次關係
3. **一致性**: 同類型的元素使用相同的命名模式
4. **可讀性**: 使用清晰、描述性的名稱

### 📋 **命名模式**

```
{component}-{element}-{modifier}
```

- `component`: 主要組件名稱（如 file-management, file-upload）
- `element`: 具體元素（如 btn, input, container）
- `modifier`: 修飾符（如 primary, secondary, disabled）

## 重構前後對比

### 🔄 **主要容器**

| 舊名稱 | 新名稱 | 說明 |
|--------|--------|------|
| `file-upload-section` | `file-management-section` | 更準確描述整個文件管理區域 |
| `upload-options` | `file-management-options` | 統一前綴命名 |

### 🔘 **按鈕樣式**

| 舊名稱 | 新名稱 | 說明 |
|--------|--------|------|
| `card-button option-btn` | `file-management-btn toggle-editor-btn` | 更具體的語義化命名 |
| `card-button create-btn` | `file-management-btn create-file-btn` | 明確按鈕功能 |
| `card-button cancel-btn` | `file-management-btn cancel-editor-btn` | 描述具體取消操作 |
| `card-button upload-btn` | `file-upload-btn upload-files-btn` | 區分上傳相關按鈕 |
| `file-input-label` | `file-upload-btn choose-files-btn` | 統一按鈕樣式命名 |

### 📝 **表單元素**

| 舊名稱 | 新名稱 | 說明 |
|--------|--------|------|
| `form-group` | `text-editor-form-group` | 明確所屬組件 |
| `text-input` | `text-editor-input` | 統一文本編輯器前綴 |
| `text-textarea` | `text-editor-textarea` | 保持一致性 |

### 📁 **文件相關**

| 舊名稱 | 新名稱 | 說明 |
|--------|--------|------|
| `file-input-container` | `file-upload-input-container` | 明確上傳功能 |
| `file-input` | `file-upload-input` | 統一前綴 |
| `selected-files` | `file-upload-selected-files` | 描述選中的文件 |
| `file-item` | `file-upload-file-item` | 文件列表項 |
| `file-name` | `file-upload-file-name` | 文件名顯示 |
| `file-size` | `file-upload-file-size` | 文件大小顯示 |
| `upload-controls` | `file-upload-controls` | 上傳控制區域 |

### 📊 **狀態顯示**

| 舊名稱 | 新名稱 | 說明 |
|--------|--------|------|
| `upload-status` | `file-management-status` | 涵蓋所有文件管理狀態 |

## 樣式架構

### 🏗️ **組件層次結構**

```
file-management-section
├── file-management-options
│   └── file-management-btn (toggle-editor-btn)
├── text-editor-section
│   ├── text-editor-form
│   │   ├── text-editor-form-group
│   │   │   ├── text-editor-input
│   │   │   └── text-editor-textarea
│   │   └── text-editor-controls
│   │       ├── file-management-btn (create-file-btn)
│   │       └── file-management-btn (cancel-editor-btn)
├── file-upload-area
│   ├── file-upload-input-container
│   │   ├── file-upload-input
│   │   └── file-upload-btn (choose-files-btn)
│   ├── file-upload-selected-files
│   │   └── file-upload-file-list
│   │       └── file-upload-file-item
│   │           ├── file-upload-file-name
│   │           └── file-upload-file-size
│   └── file-upload-controls
│       └── file-upload-btn (upload-files-btn)
└── file-management-status
```

## 樣式特點

### 🎨 **設計統一性**

1. **按鈕樣式**: 所有按鈕使用統一的基礎樣式，通過修飾符類區分功能
2. **色彩系統**: 
   - 主要操作: 藍紫色漸變 (`#667eea` → `#764ba2`)
   - 成功操作: 綠色漸變 (`#28a745` → `#20c997`)
   - 取消操作: 灰色漸變 (`#6c757d` → `#5a6268`)
   - 禁用狀態: 灰色漸變 (`#a0a0a0` → `#808080`)

3. **交互效果**: 
   - Hover: 上移 2px + 陰影增強
   - Active: 回到原位 + 陰影減弱
   - Disabled: 透明度 60% + 禁用交互

### 📱 **響應式設計**

- 小屏幕（≤768px）: 按鈕和容器改為垂直佈局
- 文件列表項: 改為垂直排列
- 文本區域: 減少最小高度

## 維護指南

### ✅ **最佳實踐**

1. **新增元素**: 遵循現有命名模式
2. **修改樣式**: 優先使用現有類，避免重複定義
3. **響應式**: 確保新樣式在移動設備上正常工作
4. **測試**: 在不同瀏覽器和設備上測試樣式

### 🚫 **避免事項**

1. 不要使用過於具體的選擇器
2. 避免使用 `!important`（除非覆蓋第三方樣式）
3. 不要在 HTML 中內聯樣式
4. 避免使用無意義的類名（如 `btn1`, `container2`）

這個重構大大提高了代碼的可讀性和維護性，為未來的功能擴展奠定了良好的基礎！ 