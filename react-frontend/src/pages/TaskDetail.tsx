import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Task } from '../types/task';
import { User } from '../types/user';
import '../styles/Card.css';
import axios from 'axios';

// 文件類型定義
interface UploadedFile {
    id: number;
    File_Name: string;
    File_Path: string;
    File_Type: string;
    File_Size: number;
    Created_At: string;
    Updated_At: string;
}

// 常量定義
const API_BASE_URL = 'http://localhost:3001/api';
const FILE_UPLOAD_ENDPOINT = `${API_BASE_URL}/files/upload`;
const FILE_DOWNLOAD_ENDPOINT = `${API_BASE_URL}/files/download`;
const FILE_DELETE_ENDPOINT = `${API_BASE_URL}/files`;
const FILE_PREVIEW_ENDPOINT = `${API_BASE_URL}/files/preview`;

// 狀態消息常量
const STATUS_MESSAGES = {
    LOADING: 'Loading task details...',
    TASK_NOT_FOUND: 'Task not found',
    NO_TEXT_CONTENT: 'Please enter some text content',
    NO_FILE_NAME: 'Please enter a file name',
    NO_TASK: 'Task not found',
    NO_FILES_SELECTED: 'Please select files to upload',
    UPLOAD_SUCCESS: (count: number) => `Successfully uploaded ${count} file(s)`,
    CREATE_SUCCESS: (fileName: string) => `Successfully created and uploaded "${fileName}"`,
    UPLOAD_ERROR: (error: string) => `Upload failed: ${error}`,
    CREATE_ERROR: (error: string) => `Failed to create file: ${error}`,
    FILES_LOAD_ERROR: 'Failed to load uploaded files',
    DELETE_SUCCESS: (fileName: string) => `Successfully deleted "${fileName}"`,
    DELETE_ERROR: (error: string) => `Failed to delete file: ${error}`,
} as const;

// 文件類型檢測 - 擴展支持更多類型
const FILE_TYPES = {
    IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff'],
    PDF: ['application/pdf'],
    TEXT: ['text/plain', 'text/html', 'text/css', 'text/javascript', 'application/json', 'text/csv', 'application/xml', 'text/xml'],
    VIDEO: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv'],
    AUDIO: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg', 'audio/mp4', 'audio/aac'],
    DOCUMENT: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
               'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
               'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
} as const;

interface FileListConstructor {
    new(files: File[]): FileList;
}

declare const FileList: FileListConstructor;

function TaskDetail() {
    const { id } = useParams<{ id: string }>();
    
    // 主要狀態
    const [task, setTask] = useState<Task | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    
    // 文件相關狀態
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
    
    // 文本編輯器狀態
    const [showTextEditor, setShowTextEditor] = useState(false);
    const [textContent, setTextContent] = useState('');
    const [fileName, setFileName] = useState('');
    const [creatingFile, setCreatingFile] = useState(false);
    
    // 通用狀態
    const [statusMessage, setStatusMessage] = useState<string>('');

    // 添加文件預覽狀態和處理函數
    const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);

    // ==================== 數據獲取 ====================
    
    const fetchTaskData = async (taskId: string): Promise<Task | null> => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`);
            const result = await response.json();
            return result.success && result.data ? result.data : null;
        } catch (error) {
            console.error('Failed to fetch task data:', error);
            return null;
        }
    };

    const fetchUsersData = async (): Promise<User[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/users`);
            const result = await response.json();
            return result.success && Array.isArray(result.data) ? result.data : [];
        } catch (error) {
            console.error('Failed to fetch users data:', error);
            return [];
        }
    };

    const fetchUploadedFiles = async (taskId: string): Promise<UploadedFile[]> => {
        try {
            setLoadingFiles(true);
            const response = await fetch(`${API_BASE_URL}/files/task/${taskId}`);
            const result = await response.json();
            return result.success && Array.isArray(result.data) ? result.data : [];
        } catch (error) {
            console.error('Failed to fetch uploaded files:', error);
            setStatusMessage(STATUS_MESSAGES.FILES_LOAD_ERROR);
            return [];
        } finally {
            setLoadingFiles(false);
        }
    };

    const fetchAllData = async () => {
        if (!id) return;
        
        setLoading(true);
        try {
            const [taskData, usersData, filesData] = await Promise.all([
                fetchTaskData(id),
                fetchUsersData(),
                fetchUploadedFiles(id)
            ]);
            
            setTask(taskData);
            setUsers(usersData);
            setUploadedFiles(filesData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [id]);

    // ==================== 工具函數 ====================
    
    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileType = (mimeType: string): string => {
        if (FILE_TYPES.IMAGE.includes(mimeType as any)) return 'image';
        if (FILE_TYPES.PDF.includes(mimeType as any)) return 'pdf';
        if (FILE_TYPES.TEXT.includes(mimeType as any)) return 'text';
        if (FILE_TYPES.VIDEO.includes(mimeType as any)) return 'video';
        if (FILE_TYPES.AUDIO.includes(mimeType as any)) return 'audio';
        if (FILE_TYPES.DOCUMENT.includes(mimeType as any)) return 'document';
        return 'other';
    };

    const getFileIcon = (mimeType: string): string => {
        const type = getFileType(mimeType);
        switch (type) {
            case 'image': return '🖼️';
            case 'pdf': return '📄';
            case 'text': return '📝';
            case 'video': return '🎥';
            case 'audio': return '🎵';
            case 'document': return '📋';
            default: return '📎';
        }
    };

    const resetFileInput = (): void => {
        const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const resetTextEditor = (): void => {
        setTextContent('');
        setFileName('');
        setShowTextEditor(false);
    };

    const clearStatusMessage = (): void => {
        setStatusMessage('');
    };

    // ==================== 狀態處理 ====================
    
    const getStatusBadge = (task: Task) => {
        if (task.Done) {
            return <span className="status-badge done">Done</span>;
        }
        if (task.To_review) {
            return <span className="status-badge review">To Review</span>;
        }
        if (task.Work_in_progress) {
            return <span className="status-badge progress">In Progress</span>;
        }
        return <span className="status-badge todo">To Do</span>;
    };

    const getUserName = (userId: number): string => {
        const user = users.find(u => u.id === userId);
        return user?.Name || 'Unknown User';
    };

    // ==================== 文件預覽處理 ====================
    
    const handlePreviewFile = async (file: UploadedFile) => {
        setSelectedFile(file);
    };

    const renderFilePreview = (file: UploadedFile) => {
        const isImage = file.File_Type.startsWith('image/');
        const isText = file.File_Type === 'text/plain' || file.File_Type === 'text/html';

        if (isImage) {
            return (
                <div className="file-preview-image">
                    <img src={`${FILE_PREVIEW_ENDPOINT}/${file.id}`} alt={file.File_Name} />
                </div>
            );
        }

        if (isText) {
            return (
                <div className="file-preview-document">
                    <div className="preview-icon">{getFileIcon(file.File_Type)}</div>
                    <div className="document-info">
                        <p>文字檔案預覽功能開發中</p>
                        <p>請使用下載功能查看檔案內容</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="file-preview-document">
                <div className="preview-icon">{getFileIcon(file.File_Type)}</div>
                <div className="document-info">
                    <p>此檔案類型不支援預覽</p>
                    <p>請使用下載功能查看檔案內容</p>
                </div>
            </div>
        );
    };

    // ==================== 文件上傳處理 ====================
    
    const validateFileUpload = (): boolean => {
        if (!selectedFiles || selectedFiles.length === 0) {
            setStatusMessage(STATUS_MESSAGES.NO_FILES_SELECTED);
            return false;
        }
        if (!task) {
            setStatusMessage(STATUS_MESSAGES.NO_TASK);
            return false;
        }
        return true;
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            // 如果已經有選擇的文件，合併新舊文件
            if (selectedFiles) {
                const existingFiles = Array.from(selectedFiles);
                const newFiles = Array.from(event.target.files);
                const combinedFiles = [...existingFiles, ...newFiles];
                
                // 移除重複的文件（基於文件名和大小）
                const uniqueFiles = combinedFiles.filter((file, index, self) =>
                    index === self.findIndex((f) => 
                        f.name === file.name && f.size === file.size
                    )
                );
                
                // 創建新的 FileList
                const dataTransfer = new DataTransfer();
                uniqueFiles.forEach(file => dataTransfer.items.add(file));
                setSelectedFiles(dataTransfer.files);
            } else {
                setSelectedFiles(event.target.files);
            }
        }
    };

    const handleRemoveFile = (indexToRemove: number) => {
        if (selectedFiles) {
            const newFiles = Array.from(selectedFiles).filter((_, index) => index !== indexToRemove);
            const dataTransfer = new DataTransfer();
            newFiles.forEach(file => dataTransfer.items.add(file));
            setSelectedFiles(dataTransfer.files);
        }
    };

    const handleFileUpload = async (): Promise<void> => {
        if (!validateFileUpload()) return;

        setUploading(true);
        clearStatusMessage();

        try {
            const formData = new FormData();
            
            // 添加所有選中的文件
            Array.from(selectedFiles!).forEach(file => {
                formData.append('files', file);
            });
            
            formData.append('taskId', task!.id.toString());

            const response = await fetch(FILE_UPLOAD_ENDPOINT, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                setStatusMessage(STATUS_MESSAGES.UPLOAD_SUCCESS(selectedFiles!.length));
                setSelectedFiles(null);
                resetFileInput();
                // 重新獲取文件列表
                if (id) {
                    const newFiles = await fetchUploadedFiles(id);
                    setUploadedFiles(newFiles);
                }
            } else {
                throw new Error(result.message || 'Upload failed');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setStatusMessage(STATUS_MESSAGES.UPLOAD_ERROR(errorMessage));
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    // ==================== 文本文件創建處理 ====================
    
    const validateTextFileCreation = (): boolean => {
        if (!textContent.trim()) {
            setStatusMessage(STATUS_MESSAGES.NO_TEXT_CONTENT);
            return false;
        }
        if (!fileName.trim()) {
            setStatusMessage(STATUS_MESSAGES.NO_FILE_NAME);
            return false;
        }
        if (!task) {
            setStatusMessage(STATUS_MESSAGES.NO_TASK);
            return false;
        }
        return true;
    };

    const createTextFile = (content: string, name: string): File => {
        const blob = new Blob([content], { type: 'text/plain' });
        const fileNameWithExtension = name.endsWith('.txt') ? name : `${name}.txt`;
        return new File([blob], fileNameWithExtension, { type: 'text/plain' });
    };

    const handleCreateAndUploadTxtFile = async (): Promise<void> => {
        if (!validateTextFileCreation()) return;

        setCreatingFile(true);
        clearStatusMessage();

        try {
            const file = createTextFile(textContent, fileName);
            const formData = new FormData();
            formData.append('files', file);
            formData.append('taskId', task!.id.toString());

            const response = await fetch(FILE_UPLOAD_ENDPOINT, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                setStatusMessage(STATUS_MESSAGES.CREATE_SUCCESS(file.name));
                resetTextEditor();
                // 重新獲取文件列表
                if (id) {
                    const newFiles = await fetchUploadedFiles(id);
                    setUploadedFiles(newFiles);
                }
            } else {
                throw new Error(result.message || 'Upload failed');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setStatusMessage(STATUS_MESSAGES.CREATE_ERROR(errorMessage));
            console.error('Create and upload error:', error);
        } finally {
            setCreatingFile(false);
        }
    };

    // ==================== 事件處理 ====================
    
    const handleToggleTextEditor = (): void => {
        setShowTextEditor(!showTextEditor);
        clearStatusMessage();
    };

    const handleCancelTextEditor = (): void => {
        resetTextEditor();
        clearStatusMessage();
    };

    const handleTextContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setTextContent(event.target.value);
    };

    const handleFileNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setFileName(event.target.value);
    };

    // ==================== 文件刪除處理 ====================
    
    const handleDeleteFile = async (fileId: number, fileName: string): Promise<void> => {
        if (!window.confirm(`確定要刪除檔案 "${fileName}" 嗎？`)) {
            return;
        }

        setDeletingFileId(fileId);
        try {
            await axios.delete(`${FILE_DELETE_ENDPOINT}/${fileId}`);
            setUploadedFiles(files => files.filter(f => f.id !== fileId));
        } catch (error) {
            console.error('刪除檔案時發生錯誤:', error);
            alert('刪除檔案失敗，請稍後再試。');
        } finally {
            setDeletingFileId(null);
        }
    };

    // ==================== 渲染條件檢查 ====================
    
    if (loading) {
        return (
            <div className="task-detail-container">
                <div className="task-detail-loading">
                    <p>{STATUS_MESSAGES.LOADING}</p>
                </div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="task-detail-container">
                <div className="task-detail-error">
                    <p>{STATUS_MESSAGES.TASK_NOT_FOUND}</p>
                </div>
            </div>
        );
    }

    // ==================== 主要渲染 ====================
    
    const renderUploadedFiles = () => {
        if (loadingFiles) {
            return <div className="task-detail-loading">載入中...</div>;
        }

        if (!loadingFiles && uploadedFiles.length === 0) {
            return <div className="task-detail-error">尚無檔案</div>;
        }

        return (
            <div className="uploaded-files-section">
                <h4>Uploaded Files ({uploadedFiles.length})</h4>
                <div className="tasks-grid">
                    {uploadedFiles.map((file) => (
                        <div key={file.id} className="task-wrapper">
                            <div className="card-static ">
                                <div className="card-header">
                                    <div className="file-header">
                                        <span className="file-icon">
                                            {getFileIcon(file.File_Type)}
                                        </span>
                                        <div className="file-details">
                                            <h3 className="file-name" title={file.File_Name}>
                                                {file.File_Name}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-content">
                                    <div className="file-meta">
                                        <span className="card-info">大小：{formatFileSize(file.File_Size)}</span>
                                        <span className="card-date">上傳時間：{formatDate(file.Created_At)}</span>
                                    </div>
                                </div>
                                <div className="card-meta">
                                    <button
                                        className="card-button"
                                        onClick={() => handlePreviewFile(file)}
                                        title="預覽"
                                    >
                                        👁️ 預覽
                                    </button>
                                    <a 
                                        href={`${FILE_DOWNLOAD_ENDPOINT}/${file.id}`}
                                        download={file.File_Name}
                                        className="card-button"
                                        title="下載"
                                    >
                                        ⬇️ 下載
                                    </a>
                                    <button
                                        className="card-button"
                                        onClick={() => handleDeleteFile(file.id, file.File_Name)}
                                        disabled={deletingFileId === file.id}
                                        title="刪除"
                                    >
                                        {deletingFileId === file.id ? '⏳' : '🗑️ 刪除'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 預覽模態框 */}
                {selectedFile && (
                    <div className="preview-modal" onClick={() => setSelectedFile(null)}>
                        <div className="preview-modal-content" onClick={e => e.stopPropagation()}>
                            <div className="preview-modal-header">
                                <div className="preview-file-info">
                                    <span className="preview-file-icon">
                                        {getFileIcon(selectedFile.File_Type)}
                                    </span>
                                    <span className="preview-file-name">
                                        {selectedFile.File_Name}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => setSelectedFile(null)}
                                    className="close-btn"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="preview-modal-body">
                                {renderFilePreview(selectedFile)}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="task-detail-container">
            <div className="task-detail-header">
                <h1>Task Detail</h1>
            </div>
            
            <div className="task-detail-content">
                <div className="card-static">
                    {/* 任務基本信息 */}
                    <div className="card-header">
                        <div className="card-title">{task.Content}</div>
                        {getStatusBadge(task)}
                    </div>
                    
                    <div className="card-content">
                        <div className="card-info">
                            Assigned to: {getUserName(task.User_Id)}
                        </div>
                    </div>
                    
                    <div className="card-meta">
                        <div className="card-info">User ID: {task.User_Id}</div>
                        <div className="card-date">Created: {formatDate(task.Created_At)}</div>
                        <div className="card-date">Updated: {formatDate(task.Updated_At)}</div>
                    </div>

                    {/* 文件管理區域 */}
                    <div className="file-management-section">
                        <h3>File Management</h3>
                        
                        {/* 文件操作選項 */}
                        <div className="file-management-options">
                            <button 
                                className="file-management-btn toggle-editor-btn"
                                onClick={handleToggleTextEditor}
                                type="button"
                            >
                                {showTextEditor ? 'Hide Text Editor' : 'Create Text File'}
                            </button>
                        </div>

                        {/* 文件上傳區域 */}
                        <div className="task-wrapper">
                            <div className="card-static">
                                <div className="card-header">
                                    <h3 className="card-title">Upload Files</h3>
                                </div>
                                <div className="card-content">
                                    <div className="file-upload-input-container">
                                        <input
                                            id="file-upload-input"
                                            type="file"
                                            multiple
                                            onChange={handleFileSelect}
                                            className="file-upload-input"
                                            accept="*/*"
                                        />
                                        <label htmlFor="file-upload-input" className="file-upload-label">
                                            <span className="file-upload-icon">📁</span>
                                            選擇檔案
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {selectedFiles && selectedFiles.length > 0 && (
                                <div className="file-management-section">
                                    <div className="card-header">
                                        <h3 className="card-title">Selected Files ({selectedFiles.length})</h3>
                                        <button 
                                            className="card-button"
                                            onClick={handleFileUpload}
                                            disabled={!selectedFiles || selectedFiles.length === 0 || uploading}
                                            type="button"
                                        >
                                            {uploading ? '⏳ Uploading...' : '⬆️ Upload All'}
                                        </button>
                                    </div>
                                    <div className="tasks-grid">
                                        {Array.from(selectedFiles).map((file, index) => {
                                            const isImage = file.type.startsWith('image/');
                                            const previewUrl = isImage ? URL.createObjectURL(file) : undefined;

                                            return (
                                                <div key={`${file.name}-${file.size}-${index}`} className="card">
                                                    <div className="card-header">
                                                        <span className="file-status">Pending Upload</span>
                                                        <button 
                                                            className="card-button"
                                                            onClick={() => handleRemoveFile(index)}
                                                            type="button"
                                                        >
                                                            ❌
                                                        </button>
                                                    </div>
                                                    <div className="card-content">
                                                        {isImage && previewUrl && (
                                                            <div className="file-preview-container">
                                                                <img 
                                                                    src={previewUrl} 
                                                                    alt={file.name}
                                                                    className="file-preview-image"
                                                                    onLoad={() => URL.revokeObjectURL(previewUrl)}
                                                                />
                                                            </div>
                                                        )}
                                                        {!isImage && (
                                                            <div className="file-icon-container">
                                                                <span className="file-icon">
                                                                    {getFileIcon(file.type)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="file-info">
                                                            <span className="file-name" title={file.name}>
                                                                {file.name.length > 20 
                                                                    ? `${file.name.substring(0, 17)}...` 
                                                                    : file.name}
                                                            </span>
                                                            <span className="card-date">
                                                                {formatFileSize(file.size)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 文本編輯器區域 */}
                        {showTextEditor && (
                            <div className="task-wrapper">
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">Create Text File</h3>
                                    </div>
                                    <div className="card-content">
                                        <div className="text-editor-form">
                                            <div className="text-editor-form-group">
                                                <label htmlFor="text-file-name-input">File Name:</label>
                                                <input
                                                    id="text-file-name-input"
                                                    type="text"
                                                    value={fileName}
                                                    onChange={handleFileNameChange}
                                                    placeholder="Enter file name (without .txt extension)"
                                                    className="card-input"
                                                />
                                            </div>
                                            
                                            <div className="text-editor-form-group">
                                                <label htmlFor="text-file-content-input">Content:</label>
                                                <textarea
                                                    id="text-file-content-input"
                                                    value={textContent}
                                                    onChange={handleTextContentChange}
                                                    placeholder="Enter your text content here..."
                                                    className="text-editor-textarea"
                                                    rows={10}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-meta">
                                        <button 
                                            className="card-button"
                                            onClick={handleCreateAndUploadTxtFile}
                                            disabled={!textContent.trim() || !fileName.trim() || creatingFile}
                                            type="button"
                                        >
                                            {creatingFile ? '⏳ Creating...' : '📝 Create & Upload'}
                                        </button>
                                        <button 
                                            className="card-button"
                                            onClick={handleCancelTextEditor}
                                            type="button"
                                        >
                                            ❌ Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 已上傳文件預覽區域 */}
                        {renderUploadedFiles()}

                        {/* 狀態消息顯示 */}
                        {statusMessage && (
                            <div className={`file-management-status ${statusMessage.includes('Success') ? 'success' : 'error'}`}>
                                {statusMessage}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TaskDetail;