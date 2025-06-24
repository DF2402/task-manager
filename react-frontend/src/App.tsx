import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import WorkerPage from './pages/WorkerPage';
import Navbar from './components/navbar';
import CalendarPage from './pages/CalendarPage';

function App() {
  return (
    <div className="app">
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/workers" element={<WorkerPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
