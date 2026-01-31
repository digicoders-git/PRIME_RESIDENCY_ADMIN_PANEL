import React, { useState, useEffect } from 'react';
import { FaBell, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import NotificationModal from './NotificationModal';

const Navbar = ({ toggleSidebar, sidebarOpen }) => {
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/enquiries');
      const newEnquiries = res.data.data.filter(enq => enq.status === 'New');
      setNotificationCount(newEnquiries.length);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={`fixed top-0 right-0 h-16 bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg z-20 border-b border-slate-700 transition-all duration-300 ${sidebarOpen ? 'left-64' : 'left-16'}`}>
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 text-slate-300 hover:text-[#D4AF37] transition-colors cursor-pointer rounded-lg hover:bg-slate-700/50"
          >
            {sidebarOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
          <h1 className="ml-4 text-lg font-semibold text-white">Dashboard</h1>
        </div>



        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-300 hover:text-[#D4AF37] transition-colors cursor-pointer rounded-lg hover:bg-slate-700/50"
            title="View Notifications"
          >
            <FaBell className="text-xl" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full px-1 shadow-sm ring-1 ring-slate-900">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          <div className="flex items-center space-x-3 cursor-pointer hover:bg-slate-700/50 rounded-lg p-2 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] rounded-full flex items-center mr-3 justify-center">
              <FaUser className="text-slate-900 text-sm" />
            </div>
            <span className="text-sm font-medium text-white">Admin</span>
          </div>
        </div>
      </div>

      <NotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
};

export default Navbar;