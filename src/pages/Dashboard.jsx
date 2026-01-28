import React from 'react';
import { motion } from 'framer-motion';
import { FaBed, FaUsers, FaCalendarAlt, FaRupeeSign, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const Dashboard = () => {
  const stats = [
    { title: 'Total Rooms', value: '18', change: '+2', icon: FaBed, color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
    { title: 'Active Bookings', value: '24', change: '+5', icon: FaCalendarAlt, color: 'bg-gradient-to-r from-emerald-500 to-emerald-600' },
    { title: 'Total Guests', value: '156', change: '+12', icon: FaUsers, color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
    { title: 'Revenue', value: '₹2.5L', change: '+8%', icon: FaRupeeSign, color: 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B]' },
  ];

  const recentBookings = [
    { id: 1, guest: 'John Doe', room: 'Presidential Suite', date: '2024-01-15', status: 'Confirmed' },
    { id: 2, guest: 'Jane Smith', room: 'Deluxe Room', date: '2024-01-16', status: 'Pending' },
    { id: 3, guest: 'Mike Johnson', room: 'Executive Room', date: '2024-01-17', status: 'Confirmed' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back, Admin!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer group hover:border-[#D4AF37]/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <FaArrowUp className="text-emerald-500 text-xs mr-1" />
                    <span className="text-sm text-emerald-500 font-medium">{stat.change}</span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="text-white text-xl" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{booking.guest}</p>
                  <p className="text-sm text-gray-500">{booking.room}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">{booking.date}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full p-3 bg-[#C6A87C] text-white rounded-lg hover:bg-[#B8996F] transition-colors cursor-pointer">
              Add New Booking
            </button>
            <button className="w-full p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
              Manage Rooms
            </button>
            <button className="w-full p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
              View Reports
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;