import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login/login.jsx';
import ResetPassword from './ResetPassword/reset.jsx';
import Home from './Homepage/homepage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/home" element={<Home />} /> 
      </Routes>
    </Router>
  );
}

export default App;