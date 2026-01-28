import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaPhone, FaEnvelope, FaCalendarAlt, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Guests = () => {
  const [guests] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+91 98765 43210', lastVisit: '2024-01-15', totalBookings: 5, status: 'VIP' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+91 87654 32109', lastVisit: '2024-01-10', totalBookings: 2, status: 'Regular' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', phone: '+91 76543 21098', lastVisit: '2024-01-08', totalBookings: 8, status: 'VIP' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', phone: '+91 65432 10987', lastVisit: '2024-01-05', totalBookings: 1, status: 'New' },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'VIP': return 'bg-purple-100 text-purple-800';
      case 'Regular': return 'bg-blue-100 text-blue-800';
      case 'New': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Guests Management</h1>
        <input 
          type="text" 
          placeholder="Search guests..."
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6A87C] w-64"
        />
      </div>

      <div className="grid gap-4">
        {guests.map((guest, index) => (
          <motion.div
            key={guest.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#C6A87C] rounded-full flex items-center justify-center">
                  <FaUser className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{guest.name}</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="flex items-center text-sm text-gray-500">
                      <FaEnvelope className="mr-1" /> {guest.email}
                    </span>
                    <span className="flex items-center text-sm text-gray-500">
                      <FaPhone className="mr-1" /> {guest.phone}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(guest.status)}`}>
                  {guest.status}
                </span>
                <button className="text-blue-600 hover:text-blue-900 cursor-pointer">
                  <FaEdit />
                </button>
                <button className="text-red-600 hover:text-red-900 cursor-pointer">
                  <FaTrash />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <div className="flex space-x-6">
                <span className="text-sm text-gray-500">
                  Last Visit: <span className="font-medium text-gray-900">{guest.lastVisit}</span>
                </span>
                <span className="text-sm text-gray-500">
                  Total Bookings: <span className="font-medium text-[#C6A87C]">{guest.totalBookings}</span>
                </span>
              </div>
              <button className="px-4 py-2 bg-[#C6A87C] text-white rounded-lg hover:bg-[#B8996F] transition-colors cursor-pointer">
                View History
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Guests;