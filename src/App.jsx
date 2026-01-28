import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Loader from './components/Loader';

// Pages
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Bookings from './pages/Bookings';
import Guests from './pages/Guests';
import Reviews from './pages/Reviews';
import Gallery from './pages/Gallery';
import Settings from './pages/Settings';
import Login from './pages/Login';

import './App.css';

const AnimatedRoutes = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      <AnimatePresence>
        {loading && <Loader key="loader" />}
      </AnimatePresence>
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/guests" element={<Guests />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <Router>
        {isAuthenticated ? (
          <div className="flex">
            <Sidebar isOpen={sidebarOpen} />
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
              <Navbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
              <main className="p-6 mt-16 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen  ">
                <AnimatedRoutes />
              </main>
            </div>
          </div>
        ) : (
          <AnimatedRoutes />
        )}
        <ToastContainer position="bottom-right" theme="dark" />
      </Router>
    </div>
  );
}

export default App;