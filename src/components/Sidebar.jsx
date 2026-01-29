import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaBed, FaCalendarAlt, FaUsers, FaStar, FaImages, FaCog, FaSignOutAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';

const Sidebar = ({ isOpen, setIsAuthenticated }) => {
  const location = useLocation();

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
        setIsAuthenticated(false);
      }
    });
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: FaHome },
    { name: 'Rooms', path: '/rooms', icon: FaBed },
    { name: 'Bookings', path: '/bookings', icon: FaCalendarAlt },
    { name: 'Guests', path: '/guests', icon: FaUsers },
    { name: 'Reviews', path: '/reviews', icon: FaStar },
    { name: 'Gallery', path: '/gallery', icon: FaImages },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-30 border-r border-slate-700 transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'} flex flex-col`}>
      <div className={`p-6 border-b border-slate-700/50 ${!isOpen && 'py-10 px-5'}`}>
        {isOpen ? (
          <>
            <h2 className="text-2xl font-serif text-[#D4AF37] font-bold">Prime Admin</h2>
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
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-3 py-3 text-sm font-medium transition-all cursor-pointer mx-2 rounded-lg group ${isActive
                  ? 'bg-gradient-to-r from-[#D4AF37]/20 to-[#B8860B]/10 text-[#D4AF37] border-l-4 border-[#D4AF37] shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-[#D4AF37]'
                }`}
              title={!isOpen ? item.name : ''}
            >
              <Icon className={`text-lg ${isOpen ? 'mr-3' : 'mx-auto'}`} />
              {isOpen && <span>{item.name}</span>}
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