import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaCalendarCheck, FaSignOutAlt, FaSignInAlt, FaUserCheck,
    FaClock, FaPhone, FaBed, FaCheckCircle, FaSpinner,
    FaSearch, FaFilter, FaMoneyBillWave, FaConciergeBell, FaFileInvoiceDollar, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const ManageCheckIns = () => {
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [activeTab, setActiveTab] = useState('arrivals'); // arrivals, departures, in-house
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [stats, setStats] = useState({
        checkInsToday: 0,
        checkOutsToday: 0,
        currentlyOccupied: 0,
        pendingArrivals: 0,
        pendingDepartures: 0
    });

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm]);

    const fetchData = async () => {
        try {
            const { data } = await api.get('/bookings');
            console.log("API Response:", data);
            if (data.success) {
                const allBookings = data.data.map(b => ({
                    ...b,
                    id: b._id,
                    bookingId: b._id ? b._id.substring(b._id.length - 6).toUpperCase() : 'N/A'
                }));
                console.log("Mapped Bookings:", allBookings);

                // Debug dates for the first few bookings
                if (allBookings.length > 0) {
                    allBookings.slice(0, 3).forEach(b => {
                        const d = new Date(b.checkIn);
                        const checkInDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                        console.log(`Booking ${b.guest}: CheckInRaw=${b.checkIn}, ParsedLocal=${checkInDate}`);
                    });
                }

                setBookings(allBookings);
                calculateStats(allBookings);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            if (loading) toast.error('Failed to load check-in data');
        } finally {
            setLoading(false);
        }
    };

    const getTodayStr = () => {
        const d = new Date();
        const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        console.log("System Today:", str);
        return str;
    };

    const calculateStats = (data) => {
        const today = getTodayStr();

        const arrivalsToday = data.filter(b => {
            if (!b.checkIn) return false;
            const d = new Date(b.checkIn);
            const checkInDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            return checkInDate === today;
        });
        const checkIns = arrivalsToday.length;
        const pendingArr = arrivalsToday.filter(b => b.status === 'Confirmed' || b.status === 'Pending').length;

        const departuresToday = data.filter(b => {
            if (!b.checkOut) return false;
            const d = new Date(b.checkOut);
            const checkOutDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            return checkOutDate === today;
        });
        const checkOuts = departuresToday.length;
        const pendingDep = departuresToday.filter(b => b.status === 'Checked-in').length;

        const occupied = data.filter(b => b.status === 'Checked-in').length;

        setStats({
            checkInsToday: checkIns,
            checkOutsToday: checkOuts,
            currentlyOccupied: occupied,
            pendingArrivals: pendingArr,
            pendingDepartures: pendingDep
        });
    };

    const handleStatusUpdate = async (id, newStatus, guestName) => {
        Swal.fire({
            title: `<span class="text-[#D4AF37]">${newStatus === 'Checked-in' ? 'Check In Guest' : 'Check Out Guest'}</span>`,
            html: `Proceed with <b>${newStatus}</b> for <br/><span class="text-xl font-bold">${guestName}</span>?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#D4AF37',
            cancelButtonColor: '#d33',
            confirmButtonText: newStatus === 'Checked-in' ? 'Yes, Check In' : 'Yes, Check Out',
            background: '#fff',
            customClass: {
                popup: 'rounded-2xl',
                title: 'font-serif'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const { data } = await api.put(`/bookings/${id}`, { status: newStatus });
                    if (data.success) {
                        toast.success(`${guestName} has been ${newStatus.toLowerCase()} successfully!`);
                        fetchData();
                    }
                } catch (error) {
                    toast.error('Failed to update status');
                }
            }
        });
    };

    // Filter Data based on Active Tab
    const getFilteredData = () => {
        const today = getTodayStr();
        let data = [];

        if (activeTab === 'arrivals') {
            data = bookings.filter(b => {
                if (!b.checkIn) return false;
                const d = new Date(b.checkIn);
                const checkInDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

                // Show Pending Arrivals for Today
                return checkInDate === today && (b.status === 'Confirmed' || b.status === 'Pending');
            });
        } else if (activeTab === 'departures') {
            data = bookings.filter(b => {
                if (!b.checkOut) return false;
                const d = new Date(b.checkOut);
                const checkOutDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

                return checkOutDate === today && b.status === 'Checked-in';
            });
        } else if (activeTab === 'in-house') {
            data = bookings.filter(b => b.status === 'Checked-in');
        }

        if (searchTerm) {
            data = data.filter(b =>
                (b.guest && b.guest.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (b.roomNumber && b.roomNumber.toString().includes(searchTerm)) ||
                (b.bookingId && b.bookingId.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        return data;
    };

    const allFilteredData = getFilteredData();

    // Pagination logic
    const totalPages = Math.ceil(allFilteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = allFilteredData.slice(startIndex, startIndex + itemsPerPage);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#D4AF37]"></div>
                <p className="mt-6 text-gray-500 font-bold uppercase tracking-widest text-sm">Loading Reception...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-[1600px] mx-auto pb-12"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-gray-900">Front Desk Operations</h1>
                    <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
                        <FaConciergeBell className="text-[#D4AF37]" />
                        Welcome to the daily check-in/out management console.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        System Live
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Today's Date</p>
                        <p className="text-lg font-bold text-gray-900">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards - Premium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    onClick={() => setActiveTab('arrivals')}
                    whileHover={{ y: -5 }}
                    className={`cursor-pointer p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${activeTab === 'arrivals'
                        ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-white shadow-xl shadow-yellow-500/20 border-yellow-400'
                        : 'bg-white text-gray-800 border-gray-100 shadow-sm hover:shadow-md'
                        }`}
                >
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${activeTab === 'arrivals' ? 'text-yellow-50' : 'text-gray-400'}`}>Arrivals Today</p>
                            <h3 className="text-4xl font-extrabold tracking-tight">{stats.pendingArrivals} <span className="text-lg opacity-60 font-medium">/ {stats.checkInsToday}</span></h3>
                            <p className={`text-xs mt-2 font-medium ${activeTab === 'arrivals' ? 'text-yellow-50' : 'text-[#D4AF37]'}`}>
                                {stats.pendingArrivals > 0 ? `${stats.pendingArrivals} Pending Check-in` : 'All Arrived'}
                            </p>
                        </div>
                        <div className={`p-3 rounded-xl ${activeTab === 'arrivals' ? 'bg-white/20' : 'bg-yellow-50 text-[#D4AF37]'}`}>
                            <FaSignInAlt size={24} />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    onClick={() => setActiveTab('departures')}
                    whileHover={{ y: -5 }}
                    className={`cursor-pointer p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${activeTab === 'departures'
                        ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-xl shadow-slate-400/20 border-slate-600'
                        : 'bg-white text-gray-800 border-gray-100 shadow-sm hover:shadow-md'
                        }`}
                >
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${activeTab === 'departures' ? 'text-slate-200' : 'text-gray-400'}`}>Departures Today</p>
                            <h3 className="text-4xl font-extrabold tracking-tight">{stats.pendingDepartures} <span className="text-lg opacity-60 font-medium">/ {stats.checkOutsToday}</span></h3>
                            <p className={`text-xs mt-2 font-medium ${activeTab === 'departures' ? 'text-slate-300' : 'text-slate-500'}`}>
                                {stats.pendingDepartures > 0 ? `${stats.pendingDepartures} Due Checkout` : 'All Departed'}
                            </p>
                        </div>
                        <div className={`p-3 rounded-xl ${activeTab === 'departures' ? 'bg-white/20' : 'bg-slate-50 text-slate-500'}`}>
                            <FaSignOutAlt size={24} />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    onClick={() => setActiveTab('in-house')}
                    whileHover={{ y: -5 }}
                    className={`cursor-pointer p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${activeTab === 'in-house'
                        ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-xl shadow-emerald-500/20 border-emerald-500'
                        : 'bg-white text-gray-800 border-gray-100 shadow-sm hover:shadow-md'
                        }`}
                >
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${activeTab === 'in-house' ? 'text-emerald-50' : 'text-gray-400'}`}>In-House Guests</p>
                            <h3 className="text-4xl font-extrabold tracking-tight">{stats.currentlyOccupied}</h3>
                            <p className={`text-xs mt-2 font-medium ${activeTab === 'in-house' ? 'text-emerald-50' : 'text-emerald-600'}`}>
                                Currently Occupied
                            </p>
                        </div>
                        <div className={`p-3 rounded-xl ${activeTab === 'in-house' ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}`}>
                            <FaUserCheck size={24} />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden min-h-[500px]">
                {/* Toolbar */}
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/30">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        {activeTab === 'arrivals' && <><FaSignInAlt className="text-[#D4AF37]" /> Pending Arrivals</>}
                        {activeTab === 'departures' && <><FaSignOutAlt className="text-slate-600" /> Pending Departures</>}
                        {activeTab === 'in-house' && <><FaUserCheck className="text-emerald-600" /> Active Guests</>}
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500 font-bold">{allFilteredData.length} Records</span>
                    </h2>

                    <div className="relative w-full md:w-96 group">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search guest, room number, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 transition-all font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500 hidden lg:block">
                            Showing <span className="font-bold text-gray-900">{startIndex + 1}</span> to <span className="font-bold text-gray-900">{Math.min(startIndex + itemsPerPage, allFilteredData.length)}</span> of {allFilteredData.length}
                        </div>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="bg-white border-2 border-gray-100 px-4 py-2 rounded-xl text-gray-700 font-bold focus:outline-none focus:border-[#D4AF37] transition-colors cursor-pointer text-sm"
                        >
                            {[5, 10, 20, 50].map(val => <option key={val} value={val}>{val} per page</option>)}
                        </select>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50 text-left">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Room Detail</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Guest Info</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Timeline</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Financials</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            <AnimatePresence>
                                {allFilteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center opacity-40">
                                                <FaConciergeBell className="text-6xl mb-4 text-gray-300" />
                                                <p className="text-xl font-bold text-gray-800">No records found</p>
                                                <p className="text-sm text-gray-500">There are no guests in this category at the moment.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentData.map(booking => (
                                        <motion.tr
                                            key={booking.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.5)' }}
                                            className="group transition-colors"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-5">
                                                    {/* Room Number Box */}
                                                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 transition-transform group-hover:scale-105 ${activeTab === 'arrivals' ? 'bg-yellow-50 border-yellow-100' :
                                                        activeTab === 'departures' ? 'bg-slate-50 border-slate-200' :
                                                            'bg-emerald-50 border-emerald-100'
                                                        }`}>
                                                        <span className={`text-[9px] uppercase font-black tracking-widest mb-0.5 ${activeTab === 'arrivals' ? 'text-yellow-400' :
                                                            activeTab === 'departures' ? 'text-slate-400' :
                                                                'text-emerald-400'
                                                            }`}>NO.</span>
                                                        <span className={`text-lg font-black leading-none ${activeTab === 'arrivals' ? 'text-[#D4AF37]' :
                                                            activeTab === 'departures' ? 'text-slate-700' :
                                                                'text-emerald-700'
                                                            }`}>
                                                            {booking.roomNumber || <span className="text-xs opacity-50">N/A</span>}
                                                        </span>
                                                    </div>

                                                    {/* Room Text Details */}
                                                    <div className="flex flex-col justify-center">
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Room Type</span>
                                                        <h4 className="font-extrabold text-gray-900 text-sm tracking-tight leading-tight">{booking.room || 'Standard Room'}</h4>
                                                        <span className="text-[10px] font-semibold text-gray-400 mt-1 flex items-center gap-1.5 opacity-80">
                                                            <FaBed size={10} />
                                                            <span className="tracking-wide">{booking.bedType || 'Premium Unit'}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{booking.guest}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-500 flex items-center gap-1">
                                                            <FaPhone size={8} /> {booking.phone}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="space-y-1">
                                                    {activeTab === 'arrivals' && (
                                                        <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-xs">
                                                            <FaSignInAlt /> Arrive: Today
                                                        </div>
                                                    )}
                                                    {activeTab === 'departures' && (
                                                        <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                                                            <FaSignOutAlt /> Depart: Today
                                                        </div>
                                                    )}
                                                    {activeTab === 'in-house' && (
                                                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                                                            <FaUserCheck /> In House
                                                        </div>
                                                    )}
                                                    <p className="text-[10px] text-gray-400 font-medium pl-5">{booking.nights} Nights</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Balance</p>
                                                    <p className={`font-black text-sm tracking-tight ${booking.balance > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                        {booking.balance > 0 ? `Due: ₹${booking.balance}` : 'Paid'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${booking.status === 'Confirmed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    booking.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        booking.status === 'Checked-in' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            'bg-gray-50 text-gray-500 border-gray-100'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/invoice/${booking.id}`}
                                                    className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37] shadow-sm transition-all"
                                                    title="View Invoice"
                                                >
                                                    <FaFileInvoiceDollar size={14} />
                                                </Link>
                                                {booking.status !== 'Cancelled' && (
                                                    <button
                                                        onClick={() => {
                                                            if (activeTab === 'arrivals' || booking.status !== 'Checked-in') {
                                                                handleStatusUpdate(booking.id, 'Checked-in', booking.guest);
                                                            } else {
                                                                handleStatusUpdate(booking.id, 'Checked-out', booking.guest);
                                                            }
                                                        }}
                                                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transform active:scale-95 transition-all w-28 ${(activeTab === 'arrivals' || booking.status !== 'Checked-in')
                                                            ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white shadow-yellow-500/20 hover:translate-y-[-2px]'
                                                            : 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-slate-400/20 hover:translate-y-[-2px]'
                                                            }`}
                                                    >
                                                        {(activeTab === 'arrivals' || booking.status !== 'Checked-in') ? 'Check In' : 'Check Out'}
                                                    </button>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls Bottom */}
                {totalPages > 1 && (
                    <div className="flex justify-center p-8 border-t border-gray-50 bg-gray-50/10">
                        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-3 text-gray-400 hover:text-[#D4AF37] hover:bg-gray-50 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
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
                                                className={`w-12 h-12 rounded-xl text-sm font-bold transition-all cursor-pointer ${currentPage === pageNum
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
                                className="p-3 text-gray-400 hover:text-[#D4AF37] hover:bg-gray-50 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                            >
                                <FaChevronRight />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ManageCheckIns;
