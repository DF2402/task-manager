import { useState, useEffect } from 'react';

interface AttendanceData {
    date: string;
    worker_id: number;
}

interface WorkerData {
    id: number;
    name: string;
}

interface CalendarProps {
    attendanceData: AttendanceData[];
    workerData: WorkerData[];
}

function Calendar({ attendanceData, workerData }: CalendarProps) {
    const [date, setDate] = useState(new Date());
    const month = date.getMonth();
    const year = date.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];

    // 生成日曆網格的天數數組
    const getDaysArray = () => {
        const daysArray = [];
        
        // 添加上個月的天數
        const prevMonthDays = new Date(year, month, 0).getDate();
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            daysArray.push({
                day: prevMonthDays - i,
                currentMonth: false,
                date: new Date(year, month - 1, prevMonthDays - i)
            });
        }
        
        // 添加當前月的天數
        for (let i = 1; i <= daysInMonth; i++) {
            daysArray.push({
                day: i,
                currentMonth: true,
                date: new Date(year, month, i),
                isToday: today.getDate() === i && 
                        today.getMonth() === month && 
                        today.getFullYear() === year
            });
        }
        
        // 添加下個月的天數
        const remainingDays = 42 - daysArray.length; // 6行7列 = 42個格子
        for (let i = 1; i <= remainingDays; i++) {
            daysArray.push({
                day: i,
                currentMonth: false,
                date: new Date(year, month + 1, i)
            });
        }
        
        return daysArray;
    };

    const fetchAttendanceData = async () => {
        const response = await fetch('http://localhost:3001/api/attendance');
        const data = await response.json();
        console.log(data);
    };

    useEffect(() => {
        fetchAttendanceData();
    }, []);

    const handlePrevMonth = () => {
        setDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setDate(new Date(year, month + 1, 1));
    };

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <div className="calendar-title">
                    {months[month]} {year}
                </div>
                <div className="calendar-navigation">
                    <button onClick={handlePrevMonth}>&lt; Prev</button>
                    <button onClick={() => setDate(new Date())}>Today</button>
                    <button onClick={handleNextMonth}>Next &gt;</button>
                </div>
            </div>

            <div className="calendar-grid">
                {/* 星期標題 */}
                {daysOfWeek.map(day => (
                    <div key={day} className="calendar-weekday">
                        {day}
                    </div>
                ))}

                {/* 日期格子 */}
                {getDaysArray().map((dayInfo, index) => (
                    <div
                        key={`${dayInfo.date.toISOString().split('T')[0]}-${dayInfo.day}`}
                        className={`calendar-day ${!dayInfo.currentMonth ? 'different-month' : ''} 
                                  ${dayInfo.isToday ? 'today' : ''}`}
                    >
                        <div className="calendar-day-number">{dayInfo.day}</div>
                        <div className="attendance-data">
                            {attendanceData.map((attendance, attendanceIndex) => (
                                attendance.date === dayInfo.date.toISOString().split('T')[0] && (
                                    <div key={`${attendance.date}-${attendance.worker_id}-${attendanceIndex}`} className="attendance-data-item" >
                                        {attendance.worker_id}
                                    </div>
                                )
                            ))}
                            {/* 這裡可以添加事件顯示 */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Calendar;