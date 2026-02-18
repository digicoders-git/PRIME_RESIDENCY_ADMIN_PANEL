import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaBed, FaCalendarAlt, FaUsers, FaStar, FaImages, FaCog, FaSignOutAlt, FaEnvelope, FaConciergeBell, FaQuestionCircle, FaRupeeSign, FaClipboardCheck, FaFileInvoiceDollar, FaGlassCheers, FaUserTie, FaUtensils, FaHistory, FaPlusCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import api from '../api/api';

const Sidebar = ({ isOpen, setIsAuthenticated }) => {
  const location = useLocation();
  const [enquiryCount, setEnquiryCount] = useState(0);

  // Initialize state from localStorage immediately
  const getUserData = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      role: user.role || 'admin',
      property: user.property || '',
      permissions: user.permissions || {}
    };
  };

  const [userRole, setUserRole] = useState(() => getUserData().role);
  const [userProperty, setUserProperty] = useState(() => getUserData().property);
  const [permissions, setPermissions] = useState(() => getUserData().permissions);

  useEffect(() => {
    const userData = getUserData();
    setUserRole(userData.role);
    setUserProperty(userData.property);
    setPermissions(userData.permissions);
  }, []);

  useEffect(() => {
    fetchEnquiryCount();
    const interval = setInterval(fetchEnquiryCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchEnquiryCount = async () => {
    try {
      const res = await api.get('/enquiries');
      const count = res.data.data.filter(e => e.status === 'New').length;
      setEnquiryCount(count);
    } catch (error) {
      console.error('Failed to fetch enquiry count', error);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#D4AF37',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      }
    });
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: FaHome, permission: null },
    { name: 'Check-in/Out', path: '/manage-checkins', icon: FaClipboardCheck, permission: 'checkInOut' },
    { name: 'Bookings', path: '/bookings', icon: FaCalendarAlt, permission: 'viewBookings' },
    { name: 'Rooms', path: '/rooms', icon: FaBed, permission: 'viewRooms' },
    { name: 'Banquets & Lawns', path: '/banquets', icon: FaGlassCheers, permission: 'viewRooms' },
    { name: 'Billing', path: '/billing', icon: FaFileInvoiceDollar, permission: 'billing' },
    { name: 'Revenue', path: '/revenue', icon: FaRupeeSign, permission: 'viewHistory' },
    { name: 'Food Stock', path: '/food-stock', icon: FaUtensils, permission: null },
    { name: 'Create Order', path: '/create-order', icon: FaPlusCircle, permission: 'manager' },
    { name: 'Order History', path: '/order-history', icon: FaHistory, permission: null },
    { name: 'Managers', path: '/managers', icon: FaUserTie, permission: 'admin' },
    { name: 'Services Mgmt', path: '/services-management', icon: FaCog, permission: 'admin' },
    { name: 'Reviews', path: '/reviews', icon: FaStar, permission: 'admin' },
    { name: 'Contacts', path: '/contacts', icon: FaEnvelope, permission: 'admin' },
    { name: 'Enquiries', path: '/enquiries', icon: FaQuestionCircle, count: enquiryCount, permission: 'admin' },
    { name: 'Gallery', path: '/gallery', icon: FaImages, permission: 'admin' },
    { name: 'Services', path: '/services', icon: FaConciergeBell, permission: 'admin' },
  ];

  // Filter menu items based on user role and permissions
  const filteredMenuItems = menuItems.filter(item => {
    if (userRole.toLowerCase() === 'admin') {
      // Admin can't see manager-only items
      return item.permission !== 'manager';
    }
    if (item.permission === 'admin') return false; // Managers can't see admin-only items
    if (item.permission === 'manager') return true; // Manager-only items
    if (item.permission === null) return true; // Items without permission
    return permissions[item.permission] === true; // Check if manager has permission
  });

  return (
    <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-30 border-r border-slate-700 transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'} flex flex-col`}>
      <div className={`p-6 border-b border-slate-700/50 ${!isOpen && 'py-10 px-5'}`}>
        {isOpen ? (
          <>
            <h2 className="text-2xl font-serif text-[#D4AF37] font-bold">
              {userProperty === 'Prem Kunj' ? 'Prem Kunj Admin' : 'Prime Admin'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">Hotel Management</p>
          </>
        ) : (
          <div className="flex justify-center py-2">
            <div className="w-10 aspect-square h-10 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] rounded-lg flex items-center justify-center">
              <span className="text-slate-900 font-bold text-lg">P</span>
            </div>
          </div>
        )}
      </div>

      <nav className="mt-6 gap-3 flex flex-col flex-1 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-3 py-3 text-sm font-medium transition-all cursor-pointer mx-2 rounded-lg group relative ${isActive
                ? 'bg-gradient-to-r from-[#D4AF37]/20 to-[#B8860B]/10 text-[#D4AF37] border-l-4 border-[#D4AF37] shadow-lg'
                : 'text-slate-300 hover:bg-slate-700/50 hover:text-[#D4AF37]'
                }`}
              title={!isOpen ? item.name : ''}
            >
              <Icon className={`text-lg ${isOpen ? 'mr-3' : 'mx-auto'}`} />
              {isOpen && <span className="flex-1">{item.name}</span>}

              {/* Badge Count */}

            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-3 text-sm font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-all cursor-pointer group"
          title={!isOpen ? 'Logout' : ''}
        >
          <FaSignOutAlt className={`${isOpen ? 'mr-3' : 'mx-auto'}`} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;