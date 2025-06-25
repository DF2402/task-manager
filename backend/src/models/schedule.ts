export interface Schedule {
    id: number;
    User_Id: number;
    Date: string;
    Created_At: string;
}

export interface CreateScheduleRequest {
    User_Id: number;
    Date: string;
}

export interface UpdateScheduleRequest {
    User_Id?: number;
    Date?: string;
} 