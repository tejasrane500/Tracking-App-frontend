import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthForm from './Components/AuthForm';
import Dashboard from "./Components/Dashboard";
import ProfileForm from './Components/ProfileForm';
import { Toaster } from 'react-hot-toast';
import LiveMap from './Components/LiveMap';
import History from './Components/History';
import ContactList from './Components/ContactList';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null); // Data handle karne ke liye
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const savedUser = sessionStorage.getItem('user');
  if (savedUser) {
    try {
      const parsedUser = JSON.parse(savedUser);
      // Check karein ki _id mil rahi hai ya nahi
      console.log("Checking ID in Storage:", parsedUser._id || parsedUser.id);
      
      setUserData(parsedUser);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Parse error", err);
    }
  }
  setLoading(false); // Loading ko band karna zaroori hai blank screen hatane ke liye
}, []); // Dependency array khali rakhein taaki loop na ho

  const handleLogin = (data) => {
    // 1. Pehle data ko localStorage mein save karo (Yeh missing tha!)
    sessionStorage.setItem('user', JSON.stringify(data.user || data)); 
    if(data.token) localStorage.setItem('token', data.token);

    // 2. Phir state update karo
    setUserData(data.user || data);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    setUserData(null);
    setIsAuthenticated(false);
  };

  // 2. Jab tak check ho raha hai tab tak kuch mat dikhao (Screen flash rokne ke liye)
  if (loading) return null;

  return (
    <Router>
      {/* Toaster ko sabse upar rakhein taaki notifications har page pe dikhein */}
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        {/* Login Page */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <AuthForm onLogin={handleLogin} /> : <Navigate to="/profile" />} 
        />

        {/* Dashboard (Parent Layout) */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Dashboard onLogout={handleLogout} userData={userData} /> : <Navigate to="/login" />}
        >
          {/* Default: Login ke baad seedha profile dikhe Dashboard ke andar */}
          <Route index element={<Navigate to="/profile" replace />} />
          
          {/* Ye Routes ab Dashboard ke <Outlet /> mein render honge */}
          <Route path="profile" element={<ProfileForm userData={userData} />} />
          <Route path="dashboard" element={<LiveMap userData={userData} />} />
          <Route path="contacts" element={<ContactList userData={userData} />} />
          <Route path="history" element={<History/>} />
        </Route>

        {/* Default Route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;