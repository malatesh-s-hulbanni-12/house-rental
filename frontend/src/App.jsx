import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './components/Login';
import AdminDashboard from './pages/AdminDashboard';
import MyCreations from './pages/MyCreations';
// In App.jsx - Add this route
import FeedbackDashboard from './pages/FeedbackDashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');

  // Check login status on app load
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const email = localStorage.getItem('adminEmail');
    if (loggedIn && email) {
      setIsLoggedIn(true);
      setAdminEmail(email);
    }
  }, []);

  const handleLogin = (email) => {
    setIsLoggedIn(true);
    setAdminEmail(email);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('adminEmail', email);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAdminEmail('');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('adminEmail');
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar 
          isLoggedIn={isLoggedIn} 
          adminEmail={adminEmail} 
          onLogout={handleLogout} 
        />
        
        <Routes>
  <Route path="/" element={<Home />} />
  <Route 
    path="/login" 
    element={
      !isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Navigate to="/admin" />
      )
    } 
          />
          <Route 
    path="/admin" 
    element={
      isLoggedIn ? (
        <AdminDashboard adminEmail={adminEmail} />
      ) : (
        <Navigate to="/login" />
      )
    } 
          />

          // Add this route in your Routes
<Route path="/admin/feedback" element={<FeedbackDashboard />} />




        </Routes>
      </div>
    </Router>
  );
}

export default App;