import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaFileInvoiceDollar, FaSearch, FaPrint, FaEye, FaMoneyBillWave, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../api/api';

const Billing = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentData, setPaymentData] = useState({
        advance: '',
        paymentMethod: 'Cash'
    });

    useEffect(() => {
        fetchBookings();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchTerm]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/bookings');
            if (res.data.success) {
                setBookings(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentUpdate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put(`/bookings/${selectedBooking._id}/payment`, paymentData);
            if (data.success) {
                setBookings(prev => prev.map(b =>
                    b._id === selectedBooking._id ? { ...b, ...data.data } : b
                ));
                setShowPaymentModal(false);
                setPaymentData({ advance: '', paymentMethod: 'Cash' });
                alert('Payment updated successfully!');
            }
        } catch (error) {
            console.error('Payment update error:', error);
            alert('Failed to update payment');
        }
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesFilter = filter === 'All' || booking.paymentStatus === filter;
        const matchesSearch =
            booking.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking._id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-700 border-green-200';
            case 'Partial': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Pending': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto"
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-serif text-slate-800 flex items-center gap-3">
                        <FaFileInvoiceDollar className="text-[#D4AF37]" /> Billing & Invoices
                    </h1>
                    <p className="text-slate-500 mt-1">Manage payments and generate invoices</p>
                </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
                    <h3 className="text-2xl font-black text-slate-800">₹{bookings.reduce((acc, b) => acc + (b.amount || 0), 0).toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Collected</p>
                    <h3 className="text-2xl font-black text-emerald-600">₹{bookings.reduce((acc, b) => acc + (b.advance || 0), 0).toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Balance</p>
                    <h3 className="text-2xl font-black text-rose-500">₹{bookings.reduce((acc, b) => acc + (b.balance || 0), 0).toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Paid Bookings</p>
                    <h3 className="text-2xl font-black text-blue-600">{bookings.filter(b => b.paymentStatus === 'Paid').length} / {bookings.length}</h3>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by guest or booking ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D4AF37] transition-colors"
                    />
                </div>

                <div className="flex gap-2">
                    {['All', 'Paid', 'Partial', 'Pending'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                ? 'bg-[#D4AF37] text-white shadow-md'
                                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Pagination Controls Top */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 px-2 gap-4">
                <div className="text-sm text-slate-500">
                    Showing <span className="font-bold text-slate-800">{startIndex + 1}</span> to <span className="font-bold text-slate-800">{Math.min(startIndex + itemsPerPage, filteredBookings.length)}</span> of <span className="font-bold text-slate-800">{filteredBookings.length}</span> results
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Rows per page:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm focus:outline-none focus:border-[#D4AF37]"
                        >
                            {[5, 10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-4 font-semibold text-slate-600">Booking ID</th>
                                <th className="p-4 font-semibold text-slate-600">Guest</th>
                                <th className="p-4 font-semibold text-slate-600">Room</th>
                                <th className="p-4 font-semibold text-slate-600">Amount</th>
                                <th className="p-4 font-semibold text-slate-600">Paid</th>
                                <th className="p-4 font-semibold text-slate-600">Balance</th>
                                <th className="p-4 font-semibold text-slate-600">Status</th>
                                <th className="p-4 font-semibold text-slate-600 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-500">Loading billing data...</td>
                                </tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-500">No records found.</td>
                                </tr>
                            ) : (
                                currentBookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-mono text-sm text-slate-500">
                                            {booking._id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="p-4 font-medium text-slate-800">
                                            {booking.guest}
                                            <div className="text-xs text-slate-400 font-normal">{booking.email}</div>
                                        </td>
                                        <td className="p-4 text-slate-600">
                                            {booking.room} <span className="text-slate-400">({booking.roomNumber})</span>
                                        </td>
                                        <td className="p-4 font-medium text-slate-800">₹{booking.amount}</td>
                                        <td className="p-4 text-green-600">₹{booking.advance}</td>
                                        <td className="p-4 text-red-500 font-medium">₹{booking.balance}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.paymentStatus)}`}>
                                                {booking.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedBooking(booking);
                                                        setPaymentData({
                                                            advance: booking.advance,
                                                            paymentMethod: 'Cash'
                                                        });
                                                        setShowPaymentModal(true);
                                                    }}
                                                    className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                    title="Update Payment"
                                                >
                                                    <FaMoneyBillWave size={18} />
                                                </button>
                                                <Link
                                                    to={`/invoice/${booking._id}`}
                                                    className="p-2 text-slate-500 hover:text-[#D4AF37] hover:bg-slate-100 rounded-lg transition-all"
                                                    title="Generate Invoice"
                                                >
                                                    <FaFileInvoiceDollar size={18} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls Bottom */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8 mb-8">
                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-3 text-slate-400 hover:text-[#D4AF37] hover:bg-slate-50 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                        >
                            <FaChevronLeft size={16} />
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
                                            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all cursor-pointer ${currentPage === pageNum
                                                ? 'bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/30'
                                                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                } else if (
                                    pageNum === currentPage - 2 ||
                                    pageNum === currentPage + 2
                                ) {
                                    return <span key={pageNum} className="px-1 text-slate-300">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-3 text-slate-400 hover:text-[#D4AF37] hover:bg-slate-50 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                        >
                            <FaChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
                    >
                        <h3 className="text-xl font-bold mb-4 text-slate-800">Update Payment</h3>
                        <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex justify-between mb-1">
                                <span className="text-sm text-slate-500">Total Amount:</span>
                                <span className="font-bold text-slate-800">₹{selectedBooking.amount}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm text-slate-500">Already Paid:</span>
                                <span className="font-bold text-emerald-600">₹{selectedBooking.advance}</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-200 mt-2 pt-2">
                                <span className="text-sm font-bold text-slate-800">Remaining Due:</span>
                                <span className="font-bold text-rose-500">₹{selectedBooking.balance}</span>
                            </div>
                        </div>

                        <form onSubmit={handlePaymentUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Total Received Amount (Cumulative)</label>
                                <input
                                    type="number"
                                    value={paymentData.advance}
                                    onChange={(e) => setPaymentData({ ...paymentData, advance: e.target.value })}
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                                    placeholder={`New total paid amount...`}
                                    max={selectedBooking.amount}
                                    required
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Enter the total amount received from this guest so far.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                                <select
                                    value={paymentData.paymentMethod}
                                    onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
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
                                    className="flex-1 bg-[#D4AF37] text-white py-3 rounded-xl hover:bg-[#B8860B] font-bold shadow-lg shadow-yellow-500/20 transition-all"
                                >
                                    Update Payment
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl hover:bg-slate-200 font-bold transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default Billing;
