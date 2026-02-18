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

  const [userName, setUserName] = useState('Admin');
  const [userRole, setUserRole] = useState('admin');
  const [userProperty, setUserProperty] = useState('');

  useEffect(() => {
    // Get user details
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name || 'User');
    setUserRole(user.role || 'admin');
    setUserProperty(user.property || '');

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Changed from 10000 to 30000 (30 seconds)
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
          {userRole === 'admin' && (
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-300 hover:text-[#D4AF37] transition-colors cursor-pointer rounded-lg hover:bg-slate-700/50"
            >
              <FaBell className="text-xl" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
          )}



          <div className="flex items-center space-x-3 cursor-pointer hover:bg-slate-700/50 rounded-lg p-2 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] rounded-full flex items-center mr-3 justify-center">
              <FaUser className="text-slate-900 text-sm" />
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-white">{userName}</span>
              <span className="text-xs text-slate-400 capitalize">{userRole}{userProperty ? ` - ${userProperty}` : ''}</span>
            </div>
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