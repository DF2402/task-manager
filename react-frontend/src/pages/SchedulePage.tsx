import { useGet } from "../hooks/useGet";
import { User } from "../types/user";
import { Task } from "../types/task";
import { Schedule } from "../types/schedule";
import { useState, useMemo } from "react";
import "../styles/index.css";

function SchedulePage() {
  const [isGridView, setIsGridView] = useState(false);
  const [scheduleOnsite, setScheduleOnsite] = useState<Schedule[]>([]);
  const [isToggling, setIsToggling] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 日期切換函數
  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  // Fetch all schedules for schedule info calculation
  const allSchedules = useGet<{
    error?: string;
    success?: boolean;
    data?: { id: number; User_Id: number; Date: string; Created_At: string }[];
  }>({
    url: "/api/schedule",
    name: "all schedules",
  });

  // Check if user is onsite
  const isUserOnsite = (userId: number) => {
    if (schedules.data !== "loading" && schedules.data?.data) {
      return schedules.data.data.some(
        (schedule) => schedule.User_Id === userId
      );
    }
    return false;
  };

  // Toggle user schedule status
  const toggleScheduleOnsite = async (userId: number) => {
    setIsToggling(userId);
    try {
      const dateStr = `${year}-${month}-${day}`;
      const userIsOnsite = isUserOnsite(userId);

      if (userIsOnsite) {
        // Find and delete today's schedule for the user
        if (schedules.data !== "loading" && schedules.data?.data) {
          const userSchedule = schedules.data.data.find(
            (schedule) => schedule.User_Id === userId
          );
          if (userSchedule) {
            const response = await fetch(
              `http://localhost:3001/api/schedule/${userSchedule.id}`,
              {
                method: "DELETE",
              }
            );
            if (response.ok) {
              // Reload data
              schedules.reload();
            }
          }
        }
      } else {
        // Create new schedule
        const response = await fetch("http://localhost:3001/api/schedule", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            User_Id: userId,
            Date: dateStr,
          }),
        });
        if (response.ok) {
          // Reload data
          schedules.reload();
        }
      }
    } catch (error) {
      console.error("Error toggling schedule:", error);
    } finally {
      setIsToggling(null);
    }
  };

  const userList = useGet<{
    error?: string;
    success?: boolean;
    data: { id: number; Name: string }[];
  }>({ url: "/api/users", name: "user list" });
  const taskList = useGet<{
    error?: string;
    tasks: { id: number; name: string }[];
  }>({ url: "/api/tasks", name: "task list" });

  const year = selectedDate.getFullYear();
  const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
  const day = String(selectedDate.getDate()).padStart(2, "0");
  const schedules = useGet<{
    error?: string;
    success?: boolean;
    data?: { id: number; User_Id: number; Date: string; Created_At: string }[];
    count?: number;
  }>({
    url: "/api/schedule/date/" + year + "-" + month + "-" + day,
    name: "schedule list",
    deps: [selectedDate], // 添加依賴，當日期改變時重新獲取數據
  });
  const onsiteCount =
    typeof schedules.data === "object" ? schedules.data?.count || 0 : 0;

  if (userList.data != "loading" && userList.data?.data) {
    userList.data.data.sort((a, b) => {
      const aOnsite = isUserOnsite(a.id);
      const bOnsite = isUserOnsite(b.id);

      // Sort onsite users first
      if (aOnsite && !bOnsite) return -1;
      if (!aOnsite && bOnsite) return 1;
      return 0;
    });
  }

  // Calculate days since last schedule and next schedule status
  const calculateScheduleInfo = (userId: number) => {
    if (allSchedules.data === "loading" || !allSchedules.data?.data) {
      return { daysSinceLastSchedule: null, hasNextSchedule: false };
    }

    const today = new Date(selectedDate);
    today.setHours(0, 0, 0, 0);

    // Get all schedules for this user
    const userSchedules = allSchedules.data.data
      .filter((schedule) => schedule.User_Id === userId)
      .map((schedule) => {
        const date = new Date(schedule.Date);
        date.setHours(0, 0, 0, 0);
        return {
          date,
          dateStr: schedule.Date,
        };
      });

    if (userSchedules.length === 0) {
      return {
        daysSinceLastSchedule: null,
        hasNextSchedule: false,
        nextScheduleDate: null,
        lastScheduleDate: null,
      };
    }

    // Sort schedules by date
    userSchedules.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Find last schedule before today
    const lastSchedule = [...userSchedules]
      .reverse()
      .find((schedule) => schedule.date.getTime() < today.getTime());

    // Find next schedule after today
    const nextSchedule = userSchedules.find(
      (schedule) => schedule.date.getTime() > today.getTime()
    );

    // Calculate days difference
    const daysSinceLastSchedule = lastSchedule
      ? Math.floor(
          (today.getTime() - lastSchedule.date.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

    // Format dates
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    return {
      daysSinceLastSchedule,
      hasNextSchedule: !!nextSchedule,
      nextScheduleDate: nextSchedule ? formatDate(nextSchedule.dateStr) : null,
      lastScheduleDate: lastSchedule ? formatDate(lastSchedule.dateStr) : null,
    };
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Schedule Management
        </h1>
        <button
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          onClick={() => setIsGridView(!isGridView)}
        >
          {isGridView ? "List View" : "Grid View"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => changeDate(-1)}
            className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="text-lg font-semibold text-gray-700">
            {selectedDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </div>
          <button
            onClick={() => changeDate(1)}
            className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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
        <div className="text-sm font-medium text-gray-600 text-center">
          Onsite Count:
          <span className="text-blue-600 font-bold ml-1">{onsiteCount}</span>
        </div>
      </div>

      {userList.render((data) => {
        return (
          <div
            className={`grid gap-4 ${
              isGridView
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}
          >
            {(data.data || []).map((user) => {
              const isOnsite = isUserOnsite(user.id);
              const scheduleInfo = calculateScheduleInfo(user.id);
              return (
                <div
                  key={user.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isToggling !== user.id) {
                      toggleScheduleOnsite(user.id);
                    }
                  }}
                  className={`
                    relative overflow-hidden
                    ${
                      isOnsite
                        ? "bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                        : "bg-gradient-to-br from-red-50 to-red-100 border-red-200"
                    }
                    border rounded-xl p-4
                    transform transition-all duration-300
                    ${
                      isToggling === user.id
                        ? "animate-pulse"
                        : "hover:shadow-lg hover:-translate-y-1"
                    }
                    cursor-pointer
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col flex-grow">
                      <span className="text-lg font-semibold mb-1">
                        {user.Name}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          isOnsite ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isToggling === user.id
                          ? "Loading..."
                          : isOnsite
                          ? "Onsite"
                          : "Offsite"}
                      </span>
                      {/* Schedule Info Display */}
                      <div className="mt-2 space-y-1.5">
                        {scheduleInfo.lastScheduleDate && (
                          <div className="flex items-center text-xs text-gray-600">
                            <svg
                              className="w-3 h-3 mr-1 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="truncate">
                              Last: {scheduleInfo.lastScheduleDate}
                              {scheduleInfo.daysSinceLastSchedule !== null &&
                                ` (${scheduleInfo.daysSinceLastSchedule} days ago)`}
                            </span>
                          </div>
                        )}
                        <div
                          className={`flex items-center text-xs ${
                            scheduleInfo.hasNextSchedule
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          <svg
                            className="w-3 h-3 mr-1 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="truncate">
                            {scheduleInfo.hasNextSchedule
                              ? `Next: ${scheduleInfo.nextScheduleDate}`
                              : "No upcoming schedule"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`
                      w-3 h-3 rounded-full ml-3 flex-shrink-0
                      ${isOnsite ? "bg-green-500 animate-pulse" : "bg-red-500"}
                    `}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default SchedulePage;
