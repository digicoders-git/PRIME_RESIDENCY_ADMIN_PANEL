import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import {
  FaCalendarAlt, FaUser, FaPhone, FaEnvelope, FaSearch, FaFilter,
  FaEye, FaEdit, FaTrash, FaPlus, FaDownload, FaChevronLeft,
  FaChevronRight, FaBed, FaMapMarkerAlt, FaCreditCard, FaClock,
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaSpinner,
  FaBuilding, FaGlobe, FaLaptop, FaIdCard, FaFileInvoiceDollar
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import ReceiptModal from '../components/ReceiptModal';

import api from '../api/api';

const Bookings = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    advance: '',
    paymentMethod: 'Cash'
  });

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [bookings, setBookings] = useState([]);

  // Load from API
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings');
      if (data.success) {
        setBookings(data.data.map(b => ({
          ...b,
          id: b._id, // Map MongoDB _id to id for frontend
          bookingId: b._id.substring(b._id.length - 6).toUpperCase() // Short display ID
        })));
      }
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };


  const statusOptions = ['All', 'Pending', 'Confirmed', 'Checked-in', 'Checked-out', 'Cancelled'];

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || booking.status === statusFilter;
    const matchesDate = !dateFilter || booking.checkIn === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);

  // Analytics
  const analytics = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'Confirmed').length,
    pending: bookings.filter(b => b.status === 'Pending').length,
    checkedIn: bookings.filter(b => b.status === 'Checked-in').length,
    totalRevenue: bookings.reduce((sum, b) => sum + b.amount, 0),
    paidAmount: bookings.reduce((sum, b) => sum + b.advance, 0),
    pendingAmount: bookings.reduce((sum, b) => sum + b.balance, 0)
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { data } = await api.put(`/bookings/${id}`, { status: newStatus });
      if (data.success) {
        setBookings(prev => prev.map(booking =>
          booking.id === id ? { ...booking, status: newStatus } : booking
        ));
        toast.success(`Booking status updated to ${newStatus}`);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = (id, guest) => {
    Swal.fire({
      title: 'Cancel Booking?',
      text: `Cancel booking for ${guest}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#D4AF37',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, cancel it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Instead of hard delete, maybe just update status to Cancelled?
          // But our route has a DELETE endpoint. Let's use it or status update.
          // For now, let's update status to Cancelled via API.
          const { data } = await api.put(`/bookings/${id}`, { status: 'Cancelled' });
          if (data.success) {
            setBookings(prev => prev.map(booking =>
              booking.id === id ? { ...booking, status: 'Cancelled' } : booking
            ));
            toast.success('Booking cancelled successfully!');
          }
        } catch (error) {
          toast.error('Failed to cancel booking');
        }
      }
    });
  };

  const handlePaymentUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/bookings/${selectedBooking.id}/payment`, paymentData);
      if (data.success) {
        setSelectedBooking(data.data);
        setBookings(prev => prev.map(booking =>
          booking.id === selectedBooking.id ? { ...booking, ...data.data } : booking
        ));
        setShowPaymentModal(false);
        setPaymentData({ advance: '', paymentMethod: 'Cash' });
        toast.success('Payment updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update payment');
    }
  };

  const exportBookings = () => {
    toast.success('Bookings exported successfully!');
  };


  if (selectedBooking) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-8"
      >
        {/* Back Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedBooking(null)}
            className="flex mb-3 items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors cursor-pointer"
          >
            <FaChevronLeft /> Back to Bookings
          </button>
          <div className="flex  items-center gap-3">
            <button className="flex mb-3 items-center px-4 py-2 bg-white border border-gray-200 text-amber-600 rounded-xl hover:bg-gray-50 transition-all font-bold shadow-sm cursor-pointer">
              <FaEdit className="mr-2" /> Edit Booking
            </button>
            <button
              onClick={() => handleDelete(selectedBooking.id, selectedBooking.guest)}
              className="flex items-center px-4 mb-3 py-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all font-bold cursor-pointer"
            >
              <FaTrash className="mr-2" /> Cancel Booking
            </button>
          </div>
        </div>

        {/* Main Content Card (Clean Minimalist) */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden min-h-[700px]">
          {/* Refined Header */}
          <div className="p-10 pb-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 bg-gradient-to-b from-gray-50/50 to-white">
            <div className="flex items-end gap-8 flex-wrap lg:flex-nowrap">
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl bg-white p-1.5 shadow-lg border border-gray-100 ring-4 ring-white">
                  <div className="w-full h-full rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center text-amber-600 text-4xl font-extrabold shadow-inner">
                    {selectedBooking.guest.charAt(0)}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-emerald-500 shadow-sm">
                  <FaCheckCircle size={14} />
                </div>
              </div>
              <div className="mb-4 space-y-2 text-left">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{selectedBooking.guest}</h2>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${selectedBooking.status === 'Confirmed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    selectedBooking.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      selectedBooking.status === 'Checked-in' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        selectedBooking.status === 'Cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                    }`}>
                    {selectedBooking.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-gray-400 font-bold tracking-wider text-xs font-serif">
                  <span className="flex items-center gap-2"><FaUser className="text-gray-300" size={10} /> {selectedBooking.id}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                  <span className="flex items-center gap-2">#{selectedBooking.roomNumber}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-32 p-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Left Section: Details (Span 8) */}
            <div className="lg:col-span-8 space-y-16">

              {/* Information Cards (Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Guest Profile Card */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 space-y-6">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Guest Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100"><FaPhone size={14} /></div>
                      <div className="text-left">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Contact Number</p>
                        <p className="text-sm font-black text-gray-900 tracking-tight">{selectedBooking.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100"><FaEnvelope size={14} /></div>
                      <div className="text-left">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                        <p className="text-sm font-black text-gray-900 tracking-tight truncate max-w-[200px]">{selectedBooking.email}</p>
                      </div>
                    </div>
                    {selectedBooking.idType && (
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100"><FaIdCard size={14} /></div>
                        <div className="text-left">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">ID Details</p>
                          <p className="text-sm font-black text-gray-900 tracking-tight">{selectedBooking.idType}: {selectedBooking.idNumber}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stay Summary Card */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 space-y-6">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Stay Configuration</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100"><FaBed size={14} /></div>
                      <div className="text-left">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Unit Selection</p>
                        <p className="text-sm font-black text-gray-900 tracking-tight">{selectedBooking.room}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100"><FaUser size={14} /></div>
                      <div className="text-left">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Guest Count</p>
                        <p className="text-sm font-black text-gray-900 tracking-tight">{selectedBooking.adults} Adults, {selectedBooking.children} Kids</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Refined Timeline (Minimalist) */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Reservation Period</h3>
                </div>

                <div className="bg-gray-50/50 rounded-[2.5rem] p-8 border border-gray-100/50 flex flex-col md:flex-row items-center gap-10">
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Arrival</p>
                    <p className="text-2xl font-black text-gray-900 leading-tight">
                      {new Date(selectedBooking.checkIn).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-xs font-bold text-emerald-600 mt-1 uppercase tracking-widest">12:00 PM Check-in</p>
                  </div>

                  <div className="flex items-center gap-4 px-8 py-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <FaCalendarAlt className="text-amber-500" size={14} />
                    <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{selectedBooking.nights} Nights</span>
                  </div>

                  <div className="flex-1 text-center md:text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Departure</p>
                    <p className="text-2xl font-black text-gray-900 leading-tight">
                      {new Date(selectedBooking.checkOut).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-xs font-bold text-rose-600 mt-1 uppercase tracking-widest">11:00 AM Check-out</p>
                  </div>
                </div>
              </div>

              {/* Clean Special Instructions */}
              <div className="bg-amber-50/50 p-8 rounded-3xl border border-amber-100/50 text-left">
                <div className="flex items-center gap-3 mb-4 text-amber-600">
                  <FaEdit size={14} />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Additional Notes</h3>
                </div>
                <p className="text-base font-medium text-amber-900/80 leading-relaxed italic">
                  {selectedBooking.specialRequests || 'No additional instructions or special requests provided for this booking.'}
                </p>
              </div>
            </div>

            {/* Right Section: Sidebar (Span 4) */}
            <div className="lg:col-span-4 space-y-12">

              {/* Clean Payment Box */}
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 space-y-8">
                <div className="flex justify-between items-center text-left">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Financial Summary</h3>
                  <div className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${selectedBooking.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    selectedBooking.paymentStatus === 'Partial' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                    {selectedBooking.paymentStatus} Status
                  </div>
                </div>

                <div className="space-y-1 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Valuation</p>
                  <p className="text-5xl font-extrabold text-gray-900 tracking-tighter italic">
                    ₹{selectedBooking.amount.toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50 text-center">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Prepaid</p>
                    <p className="text-lg font-black text-gray-900 tracking-tight">₹{selectedBooking.advance.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50 text-center">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Balance</p>
                    <p className="text-lg font-black text-rose-600 tracking-tight">₹{selectedBooking.balance.toLocaleString()}</p>
                  </div>
                </div>



                <button
                  onClick={() => setShowReceiptModal(true)}
                  className="w-full mt-4 cursor-pointer py-4 bg-white border-2 border-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center justify-center gap-2"
                >
                  <FaFileInvoiceDollar size={14} /> View Receipt
                </button>
              </div>

              {/* Source Card */}
              <div className="bg-white rounded-2xl p-6  mt-8 border border-gray-100 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                    {selectedBooking.source === 'Website' ? <FaGlobe size={14} /> : <FaLaptop size={14} />}
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Booking Channel</p>
                    <p className="text-sm font-black text-gray-900 leading-none">{selectedBooking.source}</p>
                  </div>
                </div>

                {/* ID Details */}
                {selectedBooking.idType && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">ID Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Type:</span>
                        <span className="text-xs font-semibold">{selectedBooking.idType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Number:</span>
                        <span className="text-xs font-semibold">{selectedBooking.idNumber}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-50 mx-auto"></div>
              </div>

              {/* Control Console */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">System Controls</h3>
                <div className="relative">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-amber-500">

                  </div>
                  <select
                    className="w-full text-xs font-black appearance-none bg-white border-2 border-gray-100 rounded-2xl px-12 py-4 focus:outline-none focus:border-amber-500 transition-all cursor-pointer shadow-sm uppercase tracking-widest"
                    value={selectedBooking.status}
                    onChange={(e) => {
                      handleStatusChange(selectedBooking.id, e.target.value);
                      setSelectedBooking(prev => ({ ...prev, status: e.target.value }));
                    }}
                  >
                    {['Pending', 'Confirmed', 'Checked-in', 'Checked-out', 'Cancelled'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <FaChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 rotate-90" size={12} />
                </div>
              </div>

            </div>
          </div>
        </div>
        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold mb-4">Update Payment</h3>
              <form onSubmit={handlePaymentUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Advance Amount</label>
                  <input
                    type="number"
                    value={paymentData.advance}
                    onChange={(e) => setPaymentData({ ...paymentData, advance: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder={`Max: ₹${selectedBooking.amount}`}
                    max={selectedBooking.amount}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[#D4AF37] text-white py-3 rounded-lg hover:bg-[#B8860B] font-medium"
                  >
                    Update Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          booking={selectedBooking}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading bookings...</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Bookings Management</h1>
              <p className="text-gray-600 text-lg">Manage hotel reservations, guest check-ins, and booking status.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={exportBookings}
                className="flex items-center px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-semibold shadow-sm cursor-pointer"
              >
                <FaDownload className="mr-2 text-gray-500" />
                Export Data
              </button>
              <button
                onClick={() => navigate('/create-booking')}
                className="flex items-center px-6 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-xl hover:translate-y-[-2px] hover:shadow-xl transition-all duration-300 font-bold cursor-pointer"
              >
                <FaPlus className="mr-2" />
                New Booking
              </button>

            </div>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-2">

            {[
              { label: 'Total Bookings', value: analytics.total, icon: FaCalendarAlt, bg: 'bg-blue-50', text: 'text-blue-500' },
              { label: 'Confirmed', value: analytics.confirmed, icon: FaCheckCircle, bg: 'bg-emerald-50', text: 'text-emerald-500' },
              { label: 'Total Revenue', value: `₹${analytics.totalRevenue.toLocaleString()}`, icon: FaCreditCard, bg: 'bg-amber-50', text: 'text-amber-500' },
              { label: 'Pending Amount', value: `₹${analytics.pendingAmount.toLocaleString()}`, icon: FaClock, bg: 'bg-rose-50', text: 'text-rose-500' }
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4, shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all"
              >
                <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0 transition-transform`}>
                  <item.icon className={`${item.text} text-xl`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{item.label}</p>
                  <p className="text-xl font-extrabold text-gray-900 truncate tracking-tight">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="w-full lg:flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by guest, booking ID, or room..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:bg-white transition-all"
                />
              </div>
              <div className="w-full lg:w-auto flex flex-wrap gap-4">
                <div className="relative flex-1 lg:flex-none">
                  <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-10 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 appearance-none cursor-pointer"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status} Status</option>
                    ))}
                  </select>
                </div>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="flex-1 lg:flex-none px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Pagination Summary */}
          <div className="flex justify-end items-center mt-4 mb-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-gray-500 font-medium">Items per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border-2 border-gray-100 px-4 py-2 rounded-xl text-gray-700 font-bold focus:outline-none focus:border-[#D4AF37] transition-colors cursor-pointer"
                >
                  {[5, 10, 20, 50].map(val => <option key={val} value={val}>{val}</option>)}
                </select>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600 font-medium">
                Showing <span className="text-gray-900">{startIndex + 1}</span> to <span className="text-gray-900">{Math.min(startIndex + itemsPerPage, filteredBookings.length)}</span> of {filteredBookings.length}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden text-[13px]">
            <div className="overflow-x-auto no-scrollbar">


              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-4 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Guest Identity</th>
                    <th className="px-4 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Unit Selection</th>
                    <th className="px-4 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Stay Duration</th>
                    <th className="px-4 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Source</th>
                    <th className="px-4 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Current Status</th>
                    <th className="px-4 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Financials</th>
                    <th className="px-4 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Actions</th>

                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentBookings.map((booking) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group hover:bg-gray-50/50 transition-colors duration-300"
                    >
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm group-hover:scale-110 group-hover:bg-amber-50 group-hover:text-amber-600 group-hover:border-amber-100 transition-all">
                            <FaUser size={11} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 truncate text-xs">{booking.guest}</div>

                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{booking.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-gray-800 text-xs tracking-tight">{booking.room}</span>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Premium Unit</span>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex flex-col text-left">
                          <span className="font-black text-gray-900 tracking-tight text-xs">{new Date(booking.checkIn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                          <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{booking.nights} Nights stay</span>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-1.5">
                          {booking.source === 'Website' ? (
                            <div className="flex items-center gap-2 text-[8px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 uppercase tracking-widest">
                              <FaGlobe className="text-[9px]" /> Web
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-[8px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100 uppercase tracking-widest">
                              <FaLaptop className="text-[9px]" /> Desk
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${booking.status === 'Confirmed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          booking.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            booking.status === 'Checked-in' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              booking.status === 'Cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                          }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex flex-col leading-tight text-left">
                          <span className="font-black text-gray-900 text-xs italic">₹{booking.amount.toLocaleString()}</span>
                          <span className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${booking.paymentStatus === 'Paid' ? 'text-emerald-500' :
                            booking.paymentStatus === 'Partial' ? 'text-amber-500' : 'text-rose-500'
                            }`}>
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37] hover:shadow-lg transition-all cursor-pointer"
                          >
                            <FaEye size={10} />
                          </button>
                          <button
                            onClick={() => handleDelete(booking.id, booking.guest)}
                            className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-rose-500 hover:border-rose-100 hover:shadow-lg transition-all cursor-pointer"
                          >
                            <FaTrash size={10} />
                          </button>
                        </div>
                      </td>

                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {
            totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-3 text-gray-400 hover:text-[#D4AF37] hover:bg-gray-50 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <FaChevronLeft />
                  </button>

                  <div className="flex items-center">
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-12 h-12 rounded-xl text-sm font-bold transition-all ${currentPage === pageNum
                              ? 'bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/30'
                              : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return <span key={pageNum} className="px-2 text-gray-300">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-3 text-gray-400 hover:text-[#D4AF37] hover:bg-gray-50 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            )
          }

          {/* No Results */}
          {
            currentBookings.length === 0 && (
              <div className="text-center py-16">
                <div className=" flex text-gray-400 text-6xl mb-6 justify-center"><FaBuilding /></div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">No bookings found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
        </>
      )}
    </motion.div>
  );
};

export default Bookings;