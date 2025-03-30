import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';
import AdminLogin from './AdminLogin.jsx';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;