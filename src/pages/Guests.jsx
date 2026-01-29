import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUser, FaPhone, FaEnvelope, FaCalendarAlt, FaEdit, FaTrash,
  FaSearch, FaFilter, FaCrown, FaStar, FaHistory, FaCheckCircle, FaSpinner
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import api from '../api/api';

const Guests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState([]);

  // Load from API
  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/guests');
      if (data.success) {
        setGuests(data.data.map(g => ({
          ...g,
          id: g._id // Map MongoDB _id to id
        })));
      }
    } catch (error) {
      toast.error('Failed to fetch guests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'VIP': return 'bg-amber-50 text-amber-600 border-amber-100 ring-amber-500/10';
      case 'Regular': return 'bg-blue-50 text-blue-600 border-blue-100 ring-blue-500/10';
      case 'New': return 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500/10';
      default: return 'bg-gray-50 text-gray-500 border-gray-100 ring-gray-500/10';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'VIP': return <FaCrown size={10} />;
      case 'Regular': return <FaStar size={10} />;
      case 'New': return <FaCheckCircle size={10} />;
      default: return null;
    }
  };

  const handleDelete = (id, name) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Deleting guest ${name} will remove all their records!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#111827',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Yes, delete it!',
      borderRadius: '20px'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { data } = await api.delete(`/guests/${id}`);
          if (data.success) {
            setGuests(guests.filter(g => g.id !== id));
            toast.success(`Guest ${name} deleted successfully!`);
          }
        } catch (error) {
          toast.error('Failed to delete guest');
        }
      }
    });
  };

  const filteredGuests = guests.filter(guest =>
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading guest records...</p>
        </div>
      ) : (
        <>
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Guest Registry</h1>
              <p className="text-gray-600 text-lg">Manage profiles, visit history, and loyalty status of your patrons.</p>
            </div>
            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <div className="relative group flex-1 lg:flex-none min-w-[300px]">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
                <input
                  type="text"
                  placeholder="Search by name, email or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#D4AF37] transition-all shadow-sm font-medium"
                />
              </div>
              <button className="flex items-center px-6 py-3.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-all font-bold shadow-lg shadow-gray-200 cursor-pointer">
                <FaFilter className="mr-2 text-xs" />
                Filters
              </button>
            </div>
          </div>

          {/* Stats Quick View */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
                <FaUser size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Total Guests</p>
                <p className="text-3xl font-black text-gray-900 leading-none">{guests.length}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner">
                <FaCrown size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">VIP Members</p>
                <p className="text-3xl font-black text-gray-900 leading-none">{guests.filter(g => g.status === 'VIP').length}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                <FaHistory size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Recent Activity</p>
                <p className="text-3xl font-black text-gray-900 leading-none">+{guests.filter(g => g.status === 'New').length} New</p>
              </div>
            </div>
          </div>

          {/* Main Table Container */}
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Guest Identity</th>
                    <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact Channels</th>
                    <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tier Status</th>
                    <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Engagement</th>
                    <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Last Visit</th>
                    <th className="px-8 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-[13px]">
                  <AnimatePresence>
                    {filteredGuests.map((guest, index) => (
                      <motion.tr
                        key={guest.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group hover:bg-gray-50/50 transition-colors duration-300"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm group-hover:scale-110 group-hover:bg-amber-50 group-hover:text-amber-600 group-hover:border-amber-100 transition-all">
                              <FaUser size={14} />
                            </div>
                            <div className="text-left">
                              <p className="font-bold text-gray-900 tracking-tight text-sm mb-0.5">{guest.name}</p>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{guest.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1 text-left">
                            <div className="flex items-center gap-2 text-gray-600 font-bold tracking-tight">
                              <FaEnvelope className="text-gray-300 text-[10px]" /> {guest.email}
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 font-medium">
                              <FaPhone className="text-gray-200 text-[10px]" /> {guest.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ring-4 transition-all ${getStatusStyle(guest.status)}`}>
                            {getStatusIcon(guest.status)}
                            {guest.status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-left">
                            <span className="font-black text-gray-900 text-sm">#{guest.totalBookings}</span>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100/50 inline-block px-2 rounded ml-2">Total Stays</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-left">
                            <p className="font-bold text-gray-900 tracking-tight">
                              {new Date(guest.lastVisit).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">COMPLETED</p>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37] hover:shadow-lg transition-all cursor-pointer">
                              <FaEdit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(guest.id, guest.name)}
                              className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-rose-500 hover:border-rose-100 hover:shadow-lg transition-all cursor-pointer"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>

          {/* No Results Fallback */}
          {filteredGuests.length === 0 && (
            <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 py-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <FaUser size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No Guests Found</h3>
              <p className="text-gray-500 mt-2 max-w-xs mx-auto">We couldn't find any results matching "{searchTerm}". Please try a different query.</p>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default Guests;