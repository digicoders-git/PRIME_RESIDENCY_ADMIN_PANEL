import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Bookings = () => {
  const [bookings] = useState([
    { 
      id: 1, 
      guest: 'John Doe', 
      email: 'john@example.com', 
      phone: '+91 98765 43210',
      room: 'Presidential Suite', 
      checkIn: '2024-01-15', 
      checkOut: '2024-01-18',
      status: 'Confirmed',
      amount: '45000'
    },
    { 
      id: 2, 
      guest: 'Jane Smith', 
      email: 'jane@example.com', 
      phone: '+91 87654 32109',
      room: 'Deluxe Suite', 
      checkIn: '2024-01-16', 
      checkOut: '2024-01-19',
      status: 'Pending',
      amount: '19500'
    },
    { 
      id: 3, 
      guest: 'Mike Johnson', 
      email: 'mike@example.com', 
      phone: '+91 76543 21098',
      room: 'Executive Room', 
      checkIn: '2024-01-17', 
      checkOut: '2024-01-20',
      status: 'Confirmed',
      amount: '24000'
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (id, newStatus) => {
    toast.success(`Booking status updated to ${newStatus}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
        <div className="flex space-x-3">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6A87C] cursor-pointer">
            <option>All Status</option>
            <option>Confirmed</option>
            <option>Pending</option>
            <option>Cancelled</option>
          </select>
          <input 
            type="date" 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6A87C] cursor-pointer"
          />
        </div>
      </div>

      <div className="grid gap-6">
        {bookings.map((booking, index) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#C6A87C] rounded-full flex items-center justify-center">
                  <FaUser className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{booking.guest}</h3>
                  <p className="text-sm text-gray-500">Booking #{booking.id}</p>
                </div>
              </div>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <FaEnvelope className="text-gray-400" />
                <span className="text-sm text-gray-600">{booking.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaPhone className="text-gray-400" />
                <span className="text-sm text-gray-600">{booking.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaCalendarAlt className="text-gray-400" />
                <span className="text-sm text-gray-600">{booking.checkIn} to {booking.checkOut}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-500">Room: <span className="font-medium text-gray-900">{booking.room}</span></p>
                <p className="text-sm text-gray-500">Amount: <span className="font-medium text-[#C6A87C]">₹{booking.amount}</span></p>
              </div>
              <div className="flex space-x-2">
                <select 
                  onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C6A87C]"
                  defaultValue={booking.status}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <button className="px-4 py-1 text-sm bg-[#C6A87C] text-white rounded hover:bg-[#B8996F] transition-colors cursor-pointer">
                  View Details
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Bookings;