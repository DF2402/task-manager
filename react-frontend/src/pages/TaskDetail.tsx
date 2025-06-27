import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Task } from "../types/task";
import { User } from "../types/user";
import axios from "axios";

// File type definitions
interface UploadedFile {
  id: number;
  File_Name: string;
  File_Path: string;
  File_Type: string;
  File_Size: number;
  Created_At: string;
  Updated_At: string;
}

// Constants
const API_BASE_URL = "http://localhost:3001/api";
const FILE_UPLOAD_ENDPOINT = `${API_BASE_URL}/files/upload`;
const FILE_DOWNLOAD_ENDPOINT = `${API_BASE_URL}/files/download`;
const FILE_DELETE_ENDPOINT = `${API_BASE_URL}/files`;
const FILE_PREVIEW_ENDPOINT = `${API_BASE_URL}/files/preview`;

// Status messages
const STATUS_MESSAGES = {
  LOADING: "Loading task details...",
  TASK_NOT_FOUND: "Task not found",
  NO_TEXT_CONTENT: "Please enter some text content",
  NO_FILE_NAME: "Please enter a file name",
  NO_TASK: "Task not found",
  NO_FILES_SELECTED: "Please select files to upload",
  UPLOAD_SUCCESS: (count: number) => `Successfully uploaded ${count} file(s)`,
  CREATE_SUCCESS: (fileName: string) =>
    `Successfully created and uploaded "${fileName}"`,
  UPLOAD_ERROR: (error: string) => `Upload failed: ${error}`,
  CREATE_ERROR: (error: string) => `Failed to create file: ${error}`,
  FILES_LOAD_ERROR: "Failed to load uploaded files",
  DELETE_SUCCESS: (fileName: string) => `Successfully deleted "${fileName}"`,
  DELETE_ERROR: (error: string) => `Failed to delete file: ${error}`,
} as const;

// File type detection - extended support for more types
const FILE_TYPES = {
  IMAGE: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/bmp",
    "image/tiff",
  ],
  PDF: ["application/pdf"],
  TEXT: [
    "text/plain",
    "text/html",
    "text/css",
    "text/javascript",
    "application/json",
    "text/csv",
    "application/xml",
    "text/xml",
  ],
  VIDEO: [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/avi",
    "video/mov",
    "video/wmv",
  ],
  AUDIO: [
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/mpeg",
    "audio/mp4",
    "audio/aac",
  ],
  DOCUMENT: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
} as const;

interface FileListConstructor {
  new (files: File[]): FileList;
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
  const [textContent, setTextContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [creatingFile, setCreatingFile] = useState(false);

  // 通用狀態
  const [statusMessage, setStatusMessage] = useState<string>("");

  // 添加文件預覽狀態和處理函數
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);

  // ==================== 數據獲取 ====================

  const fetchTaskData = async (taskId: string): Promise<Task | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`);
      const result = await response.json();
      return result.success && result.data ? result.data : null;
    } catch (error) {
      console.error("Failed to fetch task data:", error);
      return null;
    }
  };

  const fetchUsersData = async (): Promise<User[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      const result = await response.json();
      return result.success && Array.isArray(result.data) ? result.data : [];
    } catch (error) {
      console.error("Failed to fetch users data:", error);
      return [];
    }
  };

  const fetchUploadedFiles = async (
    taskId: string
  ): Promise<UploadedFile[]> => {
    try {
      setLoadingFiles(true);
      const response = await fetch(`${API_BASE_URL}/files/task/${taskId}`);
      const result = await response.json();
      return result.success && Array.isArray(result.data) ? result.data : [];
    } catch (error) {
      console.error("Failed to fetch uploaded files:", error);
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
        fetchUploadedFiles(id),
      ]);

      setTask(taskData);
      setUsers(usersData);
      setUploadedFiles(filesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [id]);

  // ==================== 工具函數 ====================

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileType = (mimeType: string): string => {
    if (FILE_TYPES.IMAGE.includes(mimeType as any)) return "image";
    if (FILE_TYPES.PDF.includes(mimeType as any)) return "pdf";
    if (FILE_TYPES.TEXT.includes(mimeType as any)) return "text";
    if (FILE_TYPES.VIDEO.includes(mimeType as any)) return "video";
    if (FILE_TYPES.AUDIO.includes(mimeType as any)) return "audio";
    if (FILE_TYPES.DOCUMENT.includes(mimeType as any)) return "document";
    return "other";
  };

  const getFileIcon = (mimeType: string): string => {
    const type = getFileType(mimeType);
    switch (type) {
      case "image":
        return "🖼️";
      case "pdf":
        return "📄";
      case "text":
        return "📝";
      case "video":
        return "🎥";
      case "audio":
        return "🎵";
      case "document":
        return "📋";
      default:
        return "📎";
    }
  };

  const resetFileInput = (): void => {
    const fileInput = document.getElementById(
      "file-upload-input"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const resetTextEditor = (): void => {
    setTextContent("");
    setFileName("");
    setShowTextEditor(false);
  };

  const clearStatusMessage = (): void => {
    setStatusMessage("");
  };

  // ==================== 狀態處理 ====================

  const getStatusBadge = (task: Task) => {
    if (task.Done) {
      return (
        <span className="inline-block px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap min-w-fit shadow-md bg-gradient-to-r from-green-500 to-green-600 text-white">
          Done
        </span>
      );
    }
    if (task.To_review) {
      return (
        <span className="inline-block px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap min-w-fit shadow-md bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          To Review
        </span>
      );
    }
    if (task.Work_in_progress) {
      return (
        <span className="inline-block px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap min-w-fit shadow-md bg-gradient-to-r from-blue-400 to-blue-500 text-white">
          In Progress
        </span>
      );
    }
    return (
      <span className="inline-block px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap min-w-fit shadow-md bg-gradient-to-r from-slate-400 to-slate-500 text-white">
        To Do
      </span>
    );
  };

  const getUserName = (userId: number): string => {
    const user = users.find((u) => u.id === userId);
    return user?.Name || "Unknown User";
  };

  // ==================== 文件預覽處理 ====================

  const handlePreviewFile = async (file: UploadedFile) => {
    setSelectedFile(file);
  };

  const renderFilePreview = (file: UploadedFile) => {
    const isImage = file.File_Type.startsWith("image/");
    const isText =
      file.File_Type === "text/plain" || file.File_Type === "text/html";

    if (isImage) {
      return (
        <div className="file-preview-image">
          <img
            src={`${FILE_PREVIEW_ENDPOINT}/${file.id}`}
            alt={file.File_Name}
          />
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
        const uniqueFiles = combinedFiles.filter(
          (file, index, self) =>
            index ===
            self.findIndex((f) => f.name === file.name && f.size === file.size)
        );

        // 創建新的 FileList
        const dataTransfer = new DataTransfer();
        uniqueFiles.forEach((file) => dataTransfer.items.add(file));
        setSelectedFiles(dataTransfer.files);
      } else {
        setSelectedFiles(event.target.files);
      }
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles).filter(
        (_, index) => index !== indexToRemove
      );
      const dataTransfer = new DataTransfer();
      newFiles.forEach((file) => dataTransfer.items.add(file));
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
      Array.from(selectedFiles!).forEach((file) => {
        formData.append("files", file);
      });

      formData.append("taskId", task!.id.toString());

      const response = await fetch(FILE_UPLOAD_ENDPOINT, {
        method: "POST",
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
        throw new Error(result.message || "Upload failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatusMessage(STATUS_MESSAGES.UPLOAD_ERROR(errorMessage));
      console.error("Upload error:", error);
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
    const blob = new Blob([content], { type: "text/plain" });
    const fileNameWithExtension = name.endsWith(".txt") ? name : `${name}.txt`;
    return new File([blob], fileNameWithExtension, { type: "text/plain" });
  };

  const handleCreateAndUploadTxtFile = async (): Promise<void> => {
    if (!validateTextFileCreation()) return;

    setCreatingFile(true);
    clearStatusMessage();

    try {
      const file = createTextFile(textContent, fileName);
      const formData = new FormData();
      formData.append("files", file);
      formData.append("taskId", task!.id.toString());

      const response = await fetch(FILE_UPLOAD_ENDPOINT, {
        method: "POST",
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
        throw new Error(result.message || "Upload failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatusMessage(STATUS_MESSAGES.CREATE_ERROR(errorMessage));
      console.error("Create and upload error:", error);
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

  const handleTextContentChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    setTextContent(event.target.value);
  };

  const handleFileNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setFileName(event.target.value);
  };

  // ==================== 文件刪除處理 ====================

  const handleDeleteFile = async (
    fileId: number,
    fileName: string
  ): Promise<void> => {
    if (!window.confirm(`確定要刪除檔案 "${fileName}" 嗎？`)) {
      return;
    }

    setDeletingFileId(fileId);
    try {
      await axios.delete(`${FILE_DELETE_ENDPOINT}/${fileId}`);
      setUploadedFiles((files) => files.filter((f) => f.id !== fileId));
    } catch (error) {
      console.error("刪除檔案時發生錯誤:", error);
      alert("刪除檔案失敗，請稍後再試。");
    } finally {
      setDeletingFileId(null);
    }
  };

  // ==================== 渲染條件檢查 ====================

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center p-8 text-gray-600">
          <span className="animate-spin mr-2">⌛</span>
          {STATUS_MESSAGES.LOADING}
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center p-8 text-gray-500">
          {STATUS_MESSAGES.TASK_NOT_FOUND}
        </div>
      </div>
    );
  }

  // ==================== 主要渲染 ====================

  const renderUploadedFiles = () => {
    if (loadingFiles) {
      return (
        <div className="flex items-center justify-center p-4 text-gray-600">
          <span className="animate-spin mr-2">⌛</span>
          Loading files...
        </div>
      );
    }

    if (!uploadedFiles.length) {
      return (
        <div className="text-center p-4 text-gray-500">
          No files uploaded yet
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {uploadedFiles.map((file) => (
          <div
            key={file.id}
            className="bg-white rounded-xl shadow-md p-4 border border-gray-200 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {file.File_Name}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {formatFileSize(file.File_Size)}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-2">
                <button
                  onClick={() => handlePreviewFile(file)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  title="Preview"
                >
                  👁️
                </button>
                <a
                  href={`${FILE_DOWNLOAD_ENDPOINT}/${file.id}`}
                  download
                  className="text-green-600 hover:text-green-800 transition-colors"
                  title="Download"
                >
                  ⬇️
                </a>
                <button
                  onClick={() => handleDeleteFile(file.id, file.File_Name)}
                  disabled={deletingFileId === file.id}
                  className={`text-red-600 hover:text-red-800 transition-colors ${
                    deletingFileId === file.id
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  title="Delete"
                >
                  {deletingFileId === file.id ? "⌛" : "🗑️"}
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Created: {new Date(file.Created_At).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {loading ? (
        <div className="flex items-center justify-center p-8 text-gray-600">
          <span className="animate-spin mr-2">⌛</span>
          {STATUS_MESSAGES.LOADING}
        </div>
      ) : !task ? (
        <div className="text-center p-8 text-gray-500">
          {STATUS_MESSAGES.TASK_NOT_FOUND}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Task Header */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {task.Content}
                </h1>
                <p className="text-sm text-gray-600">
                  Assigned to: {getUserName(task.User_Id)}
                </p>
              </div>
              {getStatusBadge(task)}
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              <p>Created: {formatDate(task.Created_At)}</p>
              {task.Updated_At && <p>Updated: {formatDate(task.Updated_At)}</p>}
            </div>
          </div>

          {/* File Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Files ({uploadedFiles.length})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleToggleTextEditor}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Text File
                </button>
                <label className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors">
                  Upload Files
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Text Editor */}
            {showTextEditor && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <input
                    type="text"
                    value={fileName}
                    onChange={handleFileNameChange}
                    placeholder="Enter file name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={textContent}
                    onChange={handleTextContentChange}
                    placeholder="Enter text content"
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleCreateAndUploadTxtFile}
                      disabled={creatingFile}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {creatingFile ? "Creating..." : "Create & Upload"}
                    </button>
                    <button
                      onClick={handleCancelTextEditor}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Files Preview */}
            {selectedFiles && selectedFiles.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Selected Files
                </h3>
                <div className="space-y-2">
                  {Array.from(selectedFiles).map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white p-2 rounded border border-gray-200"
                    >
                      <span className="text-sm text-gray-600 truncate">
                        {file.name}
                      </span>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={handleFileUpload}
                    disabled={uploading}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {uploading ? "Uploading..." : "Upload All"}
                  </button>
                  <button
                    onClick={resetFileInput}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Status Message */}
            {statusMessage && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  statusMessage.includes("Successfully")
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {statusMessage}
              </div>
            )}

            {/* Uploaded Files List */}
            {renderUploadedFiles()}
          </div>

          {/* File Preview Modal */}
          {selectedFile && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedFile(null)}
            >
              <div
                className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {getFileIcon(selectedFile.File_Type)}
                    </span>
                    <span className="font-medium text-gray-900">
                      {selectedFile.File_Name}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4 overflow-auto max-h-[calc(90vh-8rem)]">
                  {renderFilePreview(selectedFile)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TaskDetail;
