import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Tenants from './pages/Tenants';
import Leases from './pages/Leases';
import Payments from './pages/Payments';
import Maintenance from './pages/Maintenance';
import Utilities from './pages/Utilities';
import Login from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (userData, token) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <Router>
      {!isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      ) : (
        <div className="app">
          <Navbar user={user} onLogout={handleLogout} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/tenants" element={<Tenants />} />
              <Route path="/leases" element={<Leases />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/utilities" element={<Utilities />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      )}
    </Router>
  );
}

export default App;
