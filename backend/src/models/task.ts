export interface Task {
    id: number;
    Content: string;
    User_Id: number;
    Work_in_progress: boolean;
    To_review: boolean;
    Done: boolean;
    Created_At: string;
    Updated_At: string;
}

export interface CreateTaskRequest {
    Content: string;
    User_Id: number;
    Work_in_progress?: boolean;
    To_review?: boolean;
    Done?: boolean;
}

export interface UpdateTaskRequest {
    Content?: string;
    User_Id?: number;
    Work_in_progress?: boolean;
    To_review?: boolean;
    Done?: boolean;
}