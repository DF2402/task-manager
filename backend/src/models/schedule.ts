export interface Schedule {
    id: number;
    User_Id: number | null;
    Date: string | null;
    Created_At: string;
}

export interface CreateScheduleRequest {
    User_Id?: number;
    Date?: string;
}

export interface UpdateScheduleRequest {
    User_Id?: number;
    Date?: string;
} 