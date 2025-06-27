import Calendar from "../components/calendar";
import { useGet } from "../hooks/useGet";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/index.css";

// Backend API response data type
interface ScheduleData {
  id: number;
  User_Id: number;
  Date: string;
  Created_At: string;
}

interface User {
  id: number;
  Name: string;
  Email: string;
  Active: boolean;
}

// Calendar component data type
interface CalendarAttendanceData {
  date: string;
  worker_id: number;
}

interface CalendarWorkerData {
  id: number;
  name: string;
}

function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const navigate = useNavigate();

  // Fetch users data
  const users = useGet<{
    error?: string;
    success?: boolean;
    data?: User[];
  }>({
    url: "/api/users",
    name: "users",
  });

  // Fetch schedules data
  const schedules = useGet<{
    error?: string;
    success?: boolean;
    data?: ScheduleData[];
  }>({
    url: "/api/schedule",
    name: "schedule",
  });

  // Calculate calendar grid data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const weeks: (number | null)[][] = [];
    let currentWeek: (number | null)[] = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startOffset; i++) {
      currentWeek.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    }

    // Add empty cells for remaining days
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);

    return weeks;
  }, [currentDate]);

  // Render loading state
  if (users.data === "loading" || schedules.data === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-6"></div>
          <p className="text-gray-700 text-lg font-medium">
            Loading calendar data...
          </p>
        </div>
      </div>
    );
  }

  // Render error state
  if (users.data?.error || schedules.data?.error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="bg-red-50/80 p-8 rounded-2xl shadow-xl text-center max-w-lg w-full mx-4">
          <div className="text-red-600 text-2xl font-semibold mb-4">
            Error Loading Data
          </div>
          <p className="text-gray-700 text-base">
            {users.data?.error || schedules.data?.error}
          </p>
          <button
            onClick={() => {
              users.reload();
              schedules.reload();
            }}
            className="mt-6 px-6 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Transform data to match Calendar component requirements
  const transformedAttendance =
    schedules.data?.data?.map((schedule) => ({
      date: schedule.Date,
      worker_id: schedule.User_Id,
    })) || [];

  const transformedWorkers =
    users.data?.data?.map((user) => ({
      id: user.id,
      name: user.Name,
    })) || [];

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const formattedDate = `${selectedDate.getFullYear()}-${String(
      selectedDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    navigate(`/schedule?date=${formattedDate}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Calendar Management
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.setMonth(currentDate.getMonth() - 1))
                )
              }
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span className="text-xl font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.setMonth(currentDate.getMonth() + 1))
                )
              }
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 overflow-hidden">
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {dayNames.map((day) => (
              <div
                key={day}
                className="bg-white p-4 text-center font-semibold text-gray-700"
              >
                {day}
              </div>
            ))}
            {calendarData.map((week, weekIndex) =>
              week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  onClick={() => day && handleDateClick(day)}
                  className={`bg-white p-4 min-h-[100px] ${
                    day
                      ? "hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                      : "bg-gray-50"
                  } border border-gray-100`}
                >
                  {day && (
                    <div className="flex flex-col h-full">
                      <span className="text-gray-700">{day}</span>
                      {users.data !== "loading" &&
                        schedules.data !== "loading" &&
                        users.data?.success &&
                        schedules.data?.success && (
                          <div className="flex-1 mt-2">
                            {transformedAttendance
                              .filter((attendance) => {
                                const attendanceDate = new Date(
                                  attendance.date
                                );
                                return (
                                  attendanceDate.getDate() === day &&
                                  attendanceDate.getMonth() ===
                                    currentDate.getMonth() &&
                                  attendanceDate.getFullYear() ===
                                    currentDate.getFullYear()
                                );
                              })
                              .map((attendance) => {
                                const worker = transformedWorkers.find(
                                  (w) => w.id === attendance.worker_id
                                );
                                return (
                                  <div
                                    key={`${attendance.date}-${attendance.worker_id}`}
                                    className="text-sm p-1 mb-1 bg-blue-100 text-blue-800 rounded"
                                  >
                                    {worker?.name}
                                  </div>
                                );
                              })}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;
