import Calendar from '../components/calendar';
import { useState, useEffect } from 'react';

interface AttendanceData {
    date: string;
    worker_id: number;
}

interface WorkerData {
    id: number;
    name: string;
}

interface AttendanceApiResponse {
    success: boolean;
    data: AttendanceData[];
    count: number;
}

interface WorkerApiResponse {
    success: boolean;
    data: WorkerData[];
    count: number;
}

interface CalendarProps {
    attendanceData: AttendanceData[];
    workerData: WorkerData[];
}

function CalendarPage() {
    const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
    const [workerData, setWorkerData] = useState<WorkerData[]>([]);
    
    const fetchAttendanceData = async () => {
        const response = await fetch('http://localhost:3001/api/attendance');
        const result: AttendanceApiResponse = await response.json();
        if (result.success && Array.isArray(result.data)) {
            setAttendanceData(result.data);
        } else {
            throw new Error('Invalid data format received from server');
        }
    };

    const fetchWorkerData = async () => {
        const response = await fetch('http://localhost:3001/api/workers');
        const result: WorkerApiResponse = await response.json();
        if (result.success && Array.isArray(result.data)) {
            setWorkerData(result.data);
        } else {
            throw new Error('Invalid data format received from server');
        }
    };

    const [data, setData] = useState<CalendarProps>({
        attendanceData: attendanceData,
        workerData: workerData
    });

    useEffect(() => {
        fetchAttendanceData();
        fetchWorkerData();
    }, []);

    useEffect(() => {
        setData({
            attendanceData: attendanceData,
            workerData: workerData
        });
    }, [attendanceData, workerData]);

    return (
        <div>
            <Calendar attendanceData={data.attendanceData} workerData={data.workerData} />
        </div>
    );
}

export default CalendarPage;