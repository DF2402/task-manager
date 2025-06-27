import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Navbar from "./components/navbar";
import CalendarPage from "./pages/CalendarPage";
import TaskDetail from "./pages/TaskDetail";
import LoginPage from "./pages/LoginPage";
import SchedulePage from "./pages/SchedulePage";
import DemoPage from "./pages/DemoPage";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/task/:id" element={<TaskDetail />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/demo" element={<DemoPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
