export interface Upload {
    id: number;
    File_Id: number | null;
    Task_Id: number | null;
    Created_At: string;
}

export interface CreateUploadRequest {
    File_Id?: number;
    Task_Id?: number;
}

export interface UpdateUploadRequest {
    File_Id?: number;
    Task_Id?: number;
} 