import React from 'react';
import { BrowserRouter, Routes, Route, } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';
import UserDashboard from './UserDashboard';
import Login from './Login.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/" element={<Login/>} />
        {/* Redirect old login paths to the main login page */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/user/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
