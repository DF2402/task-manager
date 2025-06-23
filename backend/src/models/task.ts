export interface Task {
    id: number;
    Content: string;
    Worker_Id: number;
    Work_in_progress: boolean;
    To_review: boolean;
    Done: boolean;
    Created_At: string;
    Updated_At: string;
}

export interface CreateTaskRequest {
    Content: string;
    Worker_Id: number;
}

export interface UpdateTaskRequest {
    Content?: string;
    Worker_Id?: number;
    Work_in_progress?: boolean;
    To_review?: boolean;
    Done?: boolean;
}