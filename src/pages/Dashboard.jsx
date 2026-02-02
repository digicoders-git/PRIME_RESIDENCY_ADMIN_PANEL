import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaBed, FaUsers, FaCalendarAlt, FaRupeeSign, FaArrowUp,
  FaStar, FaImages, FaClock, FaCheckCircle, FaUserPlus,
  FaChartBar, FaPercent, FaMoneyBillWave, FaExternalLinkAlt
} from 'react-icons/fa';

import api from '../api/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    rooms: [],
    bookings: [],
    guests: [],
    reviews: [],
    gallery: [],
    revenue: {}
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [roomsRes, bookingsRes, guestsRes, galleryRes, revenueRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/bookings'),
        api.get('/guests'),
        api.get('/gallery'),
        api.get('/revenue/analytics')
      ]);

      console.log('Revenue Analytics Data:', revenueRes.data.data); // Debug log

      setData({
        rooms: roomsRes.data.data || [],
        bookings: bookingsRes.data.data || [],
        guests: guestsRes.data.data || [],
        reviews: [], // Reviews endpoint not implemented yet
        gallery: galleryRes.data.data || [],
        revenue: revenueRes.data.data || {}
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
      // Fallback to empty or toast error
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = data.bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  const avgRating = (data.reviews.reduce((sum, r) => sum + r.rating, 0) / data.reviews.length || 0).toFixed(1);
  const occupiedRooms = data.bookings.filter(b => b.status === 'Checked-in').length;
  const occupancyRate = ((occupiedRooms / data.rooms.length) * 100 || 0).toFixed(0);

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${(data.revenue.monthly / 1000 || 0).toFixed(1)}k`,
      change: '+12.5%',
      icon: FaRupeeSign,
      color: 'bg-gradient-to-br from-amber-400 to-amber-600',
      label: 'Monthly Earnings',
      path: '/revenue'
    },
    {
      title: 'Active Bookings',
      value: data.bookings.filter(b => b.status !== 'Cancelled').length,
      change: '+4',
      icon: FaCalendarAlt,
      color: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
      label: 'Total Reservations',
      path: '/bookings'
    },
    {
      title: 'Occupancy Rate',
      value: `${occupancyRate}%`,
      change: '+2%',
      icon: FaChartBar,
      color: 'bg-gradient-to-br from-blue-400 to-blue-600',
      label: 'Room Usage',
      path: '/rooms'
    },
    {
      title: 'Guest Satisfaction',
      value: `${avgRating}/5`,
      change: '+0.2',
      icon: FaStar,
      color: 'bg-gradient-to-br from-purple-400 to-purple-600',
      label: 'Avg Star Rating',
      path: '/reviews'
    },
  ];

  // Revenue Chart Mock Data
  const chartData = data.revenue.weeklyTrend || [
    { _id: '2024-01-01', total: 0, online: 0, offline: 0 },
    { _id: '2024-01-02', total: 0, online: 0, offline: 0 },
    { _id: '2024-01-03', total: 0, online: 0, offline: 0 },
    { _id: '2024-01-04', total: 0, online: 0, offline: 0 },
    { _id: '2024-01-05', total: 0, online: 0, offline: 0 },
    { _id: '2024-01-06', total: 0, online: 0, offline: 0 },
    { _id: '2024-01-07', total: 0, online: 0, offline: 0 }
  ];
  
  console.log('Chart Data:', chartData); // Debug log

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-[1600px] mx-auto space-y-12 pb-12"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
          <p className="mt-4 text-gray-600 font-medium tracking-widest uppercase text-[10px]">Loading Analytics...</p>
        </div>
      ) : (
        <>
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-[#D4AF37]/5 -rotate-12 translate-x-12">
              <FaBed size={150} />
            </div>
            <div className="text-left relative z-10">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">Administrator Dashboard</span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">Welcome to <span className="text-[#D4AF37]">Prime Residency</span></h1>
              <p className="text-gray-500 font-medium mt-1">Manage your hotel operations and property performance from one place.</p>
            </div>
            <div className="flex items-center gap-4 mt-3 relative z-10">
              <button
                onClick={() => navigate('/create-booking')}
                className="px-6 py-3 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-black transition-all cursor-pointer"
              >
                Quick Booking
              </button>
              <div className="flex items-center gap-3 bg-emerald-50 py-3 px-5 rounded-xl border border-emerald-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">System live</span>
              </div>
            </div>
          </div>

          {/* Primary Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 mt-3 lg:grid-cols-4 gap-6">

            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(stat.path)}
                  className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer group relative overflow-hidden flex items-center gap-5 text-left"
                >
                  <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center shadow-lg shadow-gray-200 group-hover:scale-105 transition-transform flex-shrink-0 relative z-10`}>
                    <Icon className="text-white text-3xl" />
                  </div>

                  <div className="relative z-10 flex-1 min-w-0 ">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1.5">{stat.title}</p>
                    <p className="text-2xl font-black text-gray-900 leading-none">{stat.value}</p>
                    <div className="flex items-center mt-2 gap-2">
                      <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-widest">{stat.change}</span>
                      <span className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter truncate">{stat.label}</span>
                    </div>
                  </div>

                  {/* Watermark Icon */}
                  <div className="absolute right-2 bottom-18 opacity-[0.03] group-hover:scale-105 group-hover:opacity-[0.08] transition-all duration-700 text-black pointer-events-none">
                    <Icon size={40} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Recent Bookings Table & Chart */}
            <div className="lg:col-span-8 space-y-12">
              {/* Revenue Chart Visualization */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 text-left mt-3"

              >
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Revenue Analytics</h3>
                    <p className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Performance trend this week</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-2 text-[10px] font-black text-amber-400 uppercase tracking-widest">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span> 
                      Online (Website)
                    </span>
                    <span className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <span className="w-2 h-2 rounded-full bg-slate-500"></span> 
                      Offline (Desk)
                    </span>
                  </div>
                </div>

                <div className="flex items-end justify-between h-48 gap-4 px-4">
                  {chartData.map((d, i) => {
                    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    const maxAmount = Math.max(...chartData.map(item => item.total || 0));
                    const onlineHeight = maxAmount > 0 ? ((d.online || 0) / maxAmount) * 100 : 2;
                    const offlineHeight = maxAmount > 0 ? ((d.offline || 0) / maxAmount) * 100 : 2;
                    const dayName = dayNames[new Date(d._id).getDay()];
                    
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                        <div className="w-full relative flex flex-col items-center justify-end h-40">
                          {/* Online Revenue Bar */}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${onlineHeight}%` }}
                            transition={{ delay: i * 0.1, duration: 1, ease: "easeOut" }}
                            className="w-full max-w-[40px] bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-xl relative group-hover:from-[#D4AF37] group-hover:to-amber-400 transition-all duration-300 shadow-lg shadow-amber-200/20"
                            style={{ minHeight: (d.online || 0) > 0 ? '4px' : '1px' }}
                          >
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Online: ₹{(d.online || 0).toLocaleString()}
                            </div>
                          </motion.div>
                          {/* Offline Revenue Bar */}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${offlineHeight}%` }}
                            transition={{ delay: i * 0.1 + 0.05, duration: 1, ease: "easeOut" }}
                            className="w-full max-w-[40px] bg-gradient-to-t from-slate-600 to-slate-400 rounded-b-xl relative transition-all duration-300 shadow-lg shadow-slate-200/20"
                            style={{ minHeight: (d.offline || 0) > 0 ? '4px' : '1px' }}
                          >
                            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Offline: ₹{(d.offline || 0).toLocaleString()}
                            </div>
                          </motion.div>
                        </div>
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{dayName}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Table */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-7 rounded-3xl mt-3 shadow-sm border border-gray-100"

              >
                <div className="flex justify-between items-center mb-10">
                  <div className="text-left space-y-1">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Live Booking Stream</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Latest arrivals and stays</p>
                  </div>
                  <button
                    onClick={() => navigate('/bookings')}
                    className="text-[10px] font-black text-[#D4AF37] bg-amber-50 px-5 py-2.5 rounded-xl uppercase tracking-widest border border-amber-100 hover:bg-[#D4AF37] hover:text-white transition-all cursor-pointer"
                  >
                    Explore All Bookings
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-4">
                    <thead>
                      <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        <th className="pb-4 pl-4">Guest Identity</th>
                        <th className="pb-4">Stay Unit</th>
                        <th className="pb-4">Status</th>
                        <th className="pb-4 text-right pr-4">Finance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.bookings.slice(0, 5).map((booking, idx) => (
                        <tr
                          key={idx}
                          onClick={() => navigate('/bookings')}
                          className="group hover:bg-slate-50 transition-all rounded-2xl cursor-pointer"
                        >
                          <td className="py-5 pl-4 bg-slate-50/50 group-hover:bg-slate-100 rounded-l-2xl border-y border-l border-transparent group-hover:border-slate-200">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:text-amber-600 transition-all shadow-sm">
                                {booking.guest.charAt(0)}
                              </div>
                              <div>
                                <p className="font-black text-gray-900 text-sm leading-none mb-1">{booking.guest}</p>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">{booking.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 bg-slate-50/50 group-hover:bg-slate-100 border-y border-transparent group-hover:border-slate-200">
                            <p className="text-xs font-bold text-gray-700">{booking.room}</p>
                            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Premium Unit</p>
                          </td>
                          <td className="py-5 bg-slate-50/50 group-hover:bg-slate-100 border-y border-transparent group-hover:border-slate-200">
                            <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border transition-all ${booking.status === 'Confirmed' || booking.status === 'Checked-in'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : 'bg-amber-50 text-amber-600 border-amber-100'
                              }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="py-5 text-right pr-4 bg-slate-50/50 group-hover:bg-slate-100 rounded-r-2xl border-y border-r border-transparent group-hover:border-slate-200">
                            <p className="text-sm font-black text-gray-900 italic">₹{(booking.amount || 0).toLocaleString()}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{booking.date}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>

            {/* Quick Operations & Resource Mix */}
            <div className="lg:col-span-4 space-y-8">

              {/* Resource Mix Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 text-left mt-3"

              >
                <h3 className="text-xl font-black text-gray-900 mb-8 tracking-tight">Property Asset Mix</h3>
                <div className="space-y-6">
                  {[
                    { label: 'Room Units', count: data.rooms.length, icon: FaBed, color: 'text-blue-500', bg: 'bg-blue-50', path: '/rooms' },
                    { label: 'Verified Guests', count: data.guests.length, icon: FaUsers, color: 'text-purple-500', bg: 'bg-purple-50', path: '/guests' },
                    { label: 'Media Assets', count: data.gallery.length, icon: FaImages, color: 'text-emerald-500', bg: 'bg-emerald-50', path: '/gallery' },
                    { label: 'Guest Feedback', count: data.reviews.length, icon: FaStar, color: 'text-amber-500', bg: 'bg-amber-50', path: '/reviews' }
                  ].map((item, i) => (
                    <div
                      key={i}
                      onClick={() => navigate(item.path)}
                      className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-3 rounded-2xl transition-all border border-transparent hover:border-slate-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                          <item.icon size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                          <p className="text-lg font-black text-gray-900">{item.count} Active</p>
                        </div>
                      </div>
                      <FaExternalLinkAlt size={10} className="text-gray-200 group-hover:text-amber-500 transition-colors" />
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Connect & Ops */}
              <div className="bg-slate-900 p-8 rounded-[2rem] mt-3 shadow-2xl text-left relative overflow-hidden group">

                <div className="absolute top-0 right-0 p-10 opacity-10 text-white group-hover:scale-110 transition-transform duration-700">
                  <FaUserPlus size={100} />
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-2xl flex items-center justify-center mb-6 border border-[#D4AF37]/30">
                    <FaChartBar className="text-[#D4AF37]" />
                  </div>
                  <h3 className="text-white text-2xl font-black tracking-tight mb-2 italic">Operation Center</h3>
                  <p className="text-slate-400 text-xs font-medium mb-10 pr-10 leading-relaxed">Execute primary workflows for front-desk and room management instantly.</p>
                  <div className="grid grid-cols-1 gap-4">
                    <button
                      onClick={() => navigate('/create-booking')}
                      className="w-full py-5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg hover:translate-y-[-2px] active:translate-y-0 transition-all cursor-pointer"
                    >
                      Create New Booking
                    </button>
                    <button
                      onClick={() => navigate('/add-room')}
                      className="w-full py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all cursor-pointer border border-white/10"
                    >
                      Register New Room
                    </button>
                    <button
                      onClick={() => navigate('/guests')}
                      className="w-full py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all cursor-pointer border border-white/10"
                    >
                      Manage Profiles
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Dashboard;