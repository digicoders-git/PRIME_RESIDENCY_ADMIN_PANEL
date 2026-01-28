import React from 'react';
import { FaBell, FaUser, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = ({ toggleSidebar, sidebarOpen }) => {
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
          <button className="relative p-2 text-slate-300 hover:text-[#D4AF37] transition-colors cursor-pointer rounded-lg hover:bg-slate-700/50">
            <FaBell className="text-xl" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-3 cursor-pointer hover:bg-slate-700/50 rounded-lg p-2 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] rounded-full flex items-center mr-3 justify-center">
              <FaUser className="text-slate-900 text-sm" />
            </div>
            <span className="text-sm font-medium text-white">Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;