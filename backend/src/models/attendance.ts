export interface Attendance {
    id: number;
    Worker_Id: number;
    Date: string;
}

export interface CreateAttendanceRequest {
    Worker_Id: number;
    Date: string;
}

export interface UpdateAttendanceRequest {
    Worker_Id?: number;
    Date?: string;
}