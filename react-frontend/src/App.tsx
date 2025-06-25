import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Navbar from './components/navbar';
import CalendarPage from './pages/CalendarPage';
import TaskDetail from './pages/TaskDetail';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <div className="app">
      <Navbar />
      <div className="content">
        <Routes>
          
          <Route path="/" element={<HomePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/task/:id" element={<TaskDetail />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
