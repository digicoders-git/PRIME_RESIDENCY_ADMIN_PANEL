import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaRupeeSign, FaCalendarAlt, FaChartLine, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import Swal from 'sweetalert2';
import api from '../api/api';

const Revenue = () => {
    const [revenues, setRevenues] = useState([]);
    const [analytics, setAnalytics] = useState({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRevenue, setEditingRevenue] = useState(null);
    const [formData, setFormData] = useState({
        source: 'Room Booking',
        amount: '',
        description: '',
        paymentMethod: 'Cash',
        status: 'Received',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchRevenues();
        fetchAnalytics();
    }, []);

    const fetchRevenues = async () => {
        try {
            const res = await api.get('/revenue');
            setRevenues(res.data.data);
        } catch (error) {
            console.error('Failed to fetch revenues', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/revenue/analytics');
            setAnalytics(res.data.data);
        } catch (error) {
            console.error('Failed to fetch analytics', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRevenue) {
                await api.put(`/revenue/${editingRevenue._id}`, formData);
                Swal.fire('Updated!', 'Revenue record updated successfully.', 'success');
            } else {
                await api.post('/revenue', formData);
                Swal.fire('Added!', 'Revenue record added successfully.', 'success');
            }
            fetchRevenues();
            fetchAnalytics();
            resetForm();
        } catch (error) {
            Swal.fire('Error!', 'Failed to save revenue record.', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Revenue Record?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/revenue/${id}`);
                setRevenues(revenues.filter(rev => rev._id !== id));
                fetchAnalytics();
                Swal.fire('Deleted!', 'Revenue record has been deleted.', 'success');
            } catch (error) {
                Swal.fire('Error!', 'Failed to delete revenue record.', 'error');
            }
        }
    };

    const handleEdit = (revenue) => {
        setEditingRevenue(revenue);
        setFormData({
            source: revenue.source,
            amount: revenue.amount,
            description: revenue.description,
            paymentMethod: revenue.paymentMethod,
            status: revenue.status,
            date: new Date(revenue.date).toISOString().split('T')[0]
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            source: 'Room Booking',
            amount: '',
            description: '',
            paymentMethod: 'Cash',
            status: 'Received',
            date: new Date().toISOString().split('T')[0]
        });
        setEditingRevenue(null);
        setShowModal(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Received': return 'bg-green-100 text-green-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Refunded': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-[1600px] mx-auto"
        >
            {/* Analytics Cards */}

            {/* Booking Payment Stats Section */}
            {analytics.bookingStats && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Payment Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {['daily', 'weekly', 'monthly', 'yearly'].map((period) => {
                            const stats = analytics.bookingStats[period];
                            if (!stats) return null;

                            const periodLabel = period === 'daily' ? 'Today' :
                                period === 'weekly' ? 'This Week' :
                                    period === 'monthly' ? 'This Month' : 'This Year';

                            return (
                                <div key={period} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-gray-700">{periodLabel}</h3>
                                        <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                            {stats.totalBookings} Bookings
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Total Value</p>
                                            <p className="text-xl font-bold text-gray-900">₹{stats.totalAmount.toLocaleString()}</p>
                                        </div>


                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Performance Trend Section */}
            {analytics.weeklyTrend && analytics.weeklyTrend.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Revenue Analytics</h2>
                            <p className="text-sm text-gray-500">Performance trend this week</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 bg-[#D4AF37] rounded-full"></div>
                            <span className="text-gray-600">Daily Revenue</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-4">
                        {analytics.weeklyTrend.map((day, index) => {
                            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                            const maxAmount = Math.max(...analytics.weeklyTrend.map(d => d.total));
                            const height = maxAmount > 0 ? (day.total / maxAmount) * 100 : 0;

                            return (
                                <div key={day._id} className="text-center">
                                    <div className="h-32 flex items-end justify-center mb-2">
                                        <div
                                            className="w-8 bg-gradient-to-t from-[#D4AF37] to-[#B8860B] rounded-t-lg transition-all duration-500 hover:opacity-80"
                                            style={{ height: `${height}%`, minHeight: day.total > 0 ? '8px' : '2px' }}
                                            title={`₹${day.total.toLocaleString()}`}
                                        ></div>
                                    </div>
                                    <p className="text-xs font-medium text-gray-600">
                                        {dayNames[new Date(day._id).getDay()]}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        ₹{day.total.toLocaleString()}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Source Breakdown */}
            {analytics.sourceBreakdown && analytics.sourceBreakdown.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue by Source</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {analytics.sourceBreakdown.map((source, index) => {
                            const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
                            const bgColors = ['bg-blue-50', 'bg-green-50', 'bg-purple-50', 'bg-orange-50', 'bg-pink-50'];
                            const textColors = ['text-blue-600', 'text-green-600', 'text-purple-600', 'text-orange-600', 'text-pink-600'];

                            return (
                                <div key={source._id} className={`${bgColors[index % 5]} rounded-xl p-4`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className={`font-bold ${textColors[index % 5]}`}>{source._id}</h3>
                                        <div className={`w-3 h-3 ${colors[index % 5]} rounded-full`}></div>
                                    </div>
                                    <p className="text-2xl font-black text-gray-900">₹{source.total.toLocaleString()}</p>
                                    <p className="text-sm text-gray-500">{source.count} transactions</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Revenue Records Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Revenue Records</h2>
                        <p className="text-sm text-gray-500">Recent revenue transactions</p>
                    </div>
                    {/* <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8860B] transition-all flex items-center gap-2"
                    >
                        <FaPlus /> Add Revenue
                    </button> */}
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mx-auto"></div>
                        <p className="mt-2 text-gray-500">Loading revenue records...</p>
                    </div>
                ) : revenues.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-500">No revenue records found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {revenues.map((revenue) => (
                                    <tr key={revenue._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{revenue.source}</div>
                                                <div className="text-sm text-gray-500">{revenue.description}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-[#D4AF37]">₹{revenue.amount.toLocaleString()}</div>
                                            <div className="text-xs text-gray-500">{revenue.paymentMethod}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(revenue.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(revenue.status)}`}>
                                                {revenue.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                {/* <button
                                                    onClick={() => handleEdit(revenue)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(revenue._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <FaTrash />
                                                </button> */}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Revenue Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            {editingRevenue ? 'Edit Revenue' : 'Add Revenue'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                                <select
                                    name="source"
                                    value={formData.source}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                                >
                                    <option value="Room Booking">Room Booking</option>
                                    <option value="Restaurant">Restaurant</option>
                                    <option value="Spa">Spa</option>
                                    <option value="Events">Events</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                                    rows="3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                <select
                                    name="paymentMethod"
                                    value={formData.paymentMethod}
                                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Online">Online</option>
                                    <option value="Card">Card</option>
                                    <option value="UPI">UPI</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8860B] transition-all"
                                >
                                    {editingRevenue ? 'Update' : 'Add'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Revenue;