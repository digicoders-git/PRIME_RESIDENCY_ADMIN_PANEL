import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaRupeeSign, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Today</p>
                            <p className="text-2xl font-bold text-gray-900">₹{analytics.daily?.toLocaleString() || 0}</p>
                        </div>
                        <FaRupeeSign className="text-green-500 text-2xl" />
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">This Month</p>
                            <p className="text-2xl font-bold text-gray-900">₹{analytics.monthly?.toLocaleString() || 0}</p>
                        </div>
                        <FaCalendarAlt className="text-blue-500 text-2xl" />
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">This Year</p>
                            <p className="text-2xl font-bold text-gray-900">₹{analytics.yearly?.toLocaleString() || 0}</p>
                        </div>
                        <FaChartLine className="text-purple-500 text-2xl" />
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Records</p>
                            <p className="text-2xl font-bold text-gray-900">{revenues.length}</p>
                        </div>
                        <FaRupeeSign className="text-[#D4AF37] text-2xl" />
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Revenue Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Track and manage hotel revenue</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-[#D4AF37] text-white px-6 py-3 rounded-xl hover:bg-[#B8860B] transition-colors font-medium"
                >
                    <FaPlus /> Add Revenue
                </button>
            </div>

            {/* Revenue Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <th className="px-6 py-4 text-left">Date</th>
                                <th className="px-6 py-4 text-left">Source</th>
                                <th className="px-6 py-4 text-left">Amount</th>
                                <th className="px-6 py-4 text-left">Description</th>
                                <th className="px-6 py-4 text-left">Payment</th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {revenues.map((revenue) => (
                                <tr key={revenue._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {new Date(revenue.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        <div className="flex items-center gap-2">
                                            {revenue.source}
                                            {revenue.bookingSource && (
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    revenue.bookingSource === 'Website' 
                                                        ? 'bg-blue-100 text-blue-800' 
                                                        : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                    {revenue.bookingSource}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-green-600">
                                        ₹{revenue.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                        {revenue.description}
                                        {revenue.bookingId && (
                                            <div className="text-xs text-blue-500 mt-1">
                                                Booking ID: {revenue.bookingId._id || revenue.bookingId}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            {revenue.paymentMethod}
                                            {revenue.paymentMethod === 'Online' && revenue.bookingSource === 'Website' && (
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Razorpay
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(revenue.status)}`}>
                                            {revenue.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(revenue)}
                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                                            >
                                                <FaEdit size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(revenue._id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-xl font-bold mb-4">
                            {editingRevenue ? 'Edit Revenue' : 'Add Revenue'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                                <select
                                    value={formData.source}
                                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-lg"
                                    required
                                >
                                    <option value="Room Booking">Room Booking</option>
                                    <option value="Service">Service</option>
                                    <option value="Food & Beverage">Food & Beverage</option>
                                    <option value="Event">Event</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                <select
                                    value={formData.paymentMethod}
                                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-lg"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Online">Online</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-lg"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#D4AF37] text-white py-3 rounded-lg hover:bg-[#B8860B] font-medium"
                                >
                                    {editingRevenue ? 'Update' : 'Add'} Revenue
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-medium"
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