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
