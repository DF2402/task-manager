export interface File {
    id: number;
    File_Name: string;
    File_Path: string;
    File_Type: string;
    File_Size: number;
    Created_At: string;
    Updated_At: string;
}

export interface CreateFileRequest {
    File_Name: string;
    File_Path: string;
    File_Type: string;
    File_Size: number;
}

export interface UpdateFileRequest {
    File_Name?: string;
    File_Path?: string;
    File_Type?: string;
    File_Size?: number;
} 