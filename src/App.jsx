import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import AddRoom from './pages/AddRoom';
import Bookings from './pages/Bookings';
import Guests from './pages/Guests';
import Reviews from './pages/Reviews';
import ReviewDetail from './pages/ReviewDetail';
import Contacts from './pages/Contacts';
import Gallery from './pages/Gallery';
import Services from './pages/Services';
import ServicesManagement from './pages/ServicesManagement';
import AddService from './pages/AddService';
import Enquiries from './pages/Enquiries';
import Revenue from './pages/Revenue';
import Managers from './pages/Managers';
import FoodStock from './pages/FoodStock';
import OrderHistory from './pages/OrderHistory';
import CreateOrder from './pages/CreateOrder';

import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import RoomDetail from './pages/RoomDetail';
import CreateBooking from './pages/CreateBooking';
import EditRoom from './pages/EditRoom';
import ManageCheckIns from './pages/ManageCheckIns';
import Billing from './pages/Billing';
import Invoice from './pages/Invoice';
import Banquets from './pages/Banquets';




import './App.css';

const AnimatedRoutes = ({ isAuthenticated, setIsAuthenticated }) => {
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
        <Route path="/login" element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" replace />} />
        <Route path="/resetpassword/:resettoken" element={!isAuthenticated ? <ResetPassword setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" replace />} />
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/rooms" element={isAuthenticated ? <Rooms /> : <Navigate to="/login" replace />} />
        <Route path="/banquets" element={isAuthenticated ? <Banquets /> : <Navigate to="/login" replace />} />
        <Route path="/add-room" element={isAuthenticated ? <AddRoom /> : <Navigate to="/login" replace />} />
        <Route path="/bookings" element={isAuthenticated ? <Bookings /> : <Navigate to="/login" replace />} />
        <Route path="/guests" element={isAuthenticated ? <Guests /> : <Navigate to="/login" replace />} />
        <Route path="/reviews" element={isAuthenticated ? <Reviews /> : <Navigate to="/login" replace />} />
        <Route path="/reviews/:id" element={isAuthenticated ? <ReviewDetail /> : <Navigate to="/login" replace />} />
        <Route path="/contacts" element={isAuthenticated ? <Contacts /> : <Navigate to="/login" replace />} />
        <Route path="/gallery" element={isAuthenticated ? <Gallery /> : <Navigate to="/login" replace />} />
        <Route path="/services" element={isAuthenticated ? <Services /> : <Navigate to="/login" replace />} />
        <Route path="/services-management" element={isAuthenticated ? <ServicesManagement /> : <Navigate to="/login" replace />} />
        <Route path="/add-service" element={isAuthenticated ? <AddService /> : <Navigate to="/login" replace />} />
        <Route path="/enquiries" element={isAuthenticated ? <Enquiries /> : <Navigate to="/login" replace />} />
        <Route path="/revenue" element={isAuthenticated ? <Revenue /> : <Navigate to="/login" replace />} />
        <Route path="/managers" element={isAuthenticated ? <Managers /> : <Navigate to="/login" replace />} />
        <Route path="/food-stock" element={isAuthenticated ? <FoodStock /> : <Navigate to="/login" replace />} />
        <Route path="/order-history" element={isAuthenticated ? <OrderHistory /> : <Navigate to="/login" replace />} />
        <Route path="/create-order" element={isAuthenticated ? <CreateOrder /> : <Navigate to="/login" replace />} />

        <Route path="/room-detail/:id" element={isAuthenticated ? <RoomDetail /> : <Navigate to="/login" replace />} />
        <Route path="/edit-room/:id" element={isAuthenticated ? <EditRoom /> : <Navigate to="/login" replace />} />
        <Route path="/create-booking" element={isAuthenticated ? <CreateBooking /> : <Navigate to="/login" replace />} />

        <Route path="/create-booking/:roomId" element={isAuthenticated ? <CreateBooking /> : <Navigate to="/login" replace />} />
        <Route path="/manage-checkins" element={isAuthenticated ? <ManageCheckIns /> : <Navigate to="/login" replace />} />
        <Route path="/billing" element={isAuthenticated ? <Billing /> : <Navigate to="/login" replace />} />
        <Route path="/invoice/:id" element={isAuthenticated ? <Invoice /> : <Navigate to="/login" replace />} />



      </Routes>
    </>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    return !!token;
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      setIsAuthenticated(true);
    } else if (!token && isAuthenticated) {
      setIsAuthenticated(false);
    }
  }, [isAuthenticated]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <Router>
        {isAuthenticated ? (
          <div className="flex">
            <Sidebar isOpen={sidebarOpen} setIsAuthenticated={setIsAuthenticated} />
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
              <Navbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
              <main className="p-6 mt-16 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen  ">
                <AnimatedRoutes isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
              </main>
            </div>
          </div>
        ) : (
          <AnimatedRoutes isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        )}
        <ToastContainer position="top-right" theme="dark" />
      </Router>
    </div>
  );
}

export default App;