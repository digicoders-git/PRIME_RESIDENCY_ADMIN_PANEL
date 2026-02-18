import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHistory, FaBuilding, FaFilter, FaCheckCircle, FaMoneyBillWave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../api/api';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [propertyFilter, setPropertyFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('Delivered');
    const [user, setUser] = useState({ role: 'Admin', property: '' });

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);
        if (userData.role === 'Manager' && userData.property) {
            setPropertyFilter(userData.property);
        }
    }, []);

    useEffect(() => {
        if (propertyFilter) {
            fetchOrders();
        }
    }, [propertyFilter, statusFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const params = {};
            
            if (userData.role === 'Manager' && userData.property) {
                params.property = userData.property;
            } else if (userData.role === 'Admin' && propertyFilter !== 'All') {
                params.property = propertyFilter;
            }
            
            const { data } = await api.get('/food-orders', { params });
            if (data.success) {
                // Always filter only Delivered orders
                const filteredOrders = data.data.filter(o => o.status === 'Delivered');
                setOrders(filteredOrders);
            }
        } catch (error) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const statusOptions = ['Delivered'];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Accepted': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Preparing': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <FaHistory className="text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black">Order History</h1>
                        <p className="text-yellow-100 text-sm mt-0.5">Track all food orders and payments</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-4">
                <div className="flex flex-wrap gap-3 items-center">
                    <FaFilter className="text-gray-400" />
                    
                    {user.role === 'Admin' && (
                        <div className="flex gap-2 items-center">
                            <label className="text-xs font-bold text-gray-700">Property:</label>
                            {['All', 'Prime Residency', 'Prem Kunj'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPropertyFilter(p)}
                                    className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${
                                        propertyFilter === p 
                                            ? 'bg-[#D4AF37] text-white shadow-md' 
                                            : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-2 items-center ml-auto">
                        <span className="px-3 py-2 rounded-lg font-bold text-xs bg-green-100 text-green-700 border-2 border-green-200">
                            ✓ Showing Delivered Orders Only
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Total Orders</p>
                            <p className="text-3xl font-black text-gray-900 mt-1">{orders.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <FaHistory className="text-2xl text-blue-600" />
                        </div>
                    </div>
                </motion.div>

                <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Delivered</p>
                            <p className="text-3xl font-black text-gray-900 mt-1">{orders.filter(o => o.status === 'Delivered').length}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <FaCheckCircle className="text-2xl text-green-600" />
                        </div>
                    </div>
                </motion.div>

                <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl shadow-md p-5 border-l-4 border-amber-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Total Revenue</p>
                            <p className="text-3xl font-black text-gray-900 mt-1">₹{orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                            <FaMoneyBillWave className="text-2xl text-amber-600" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-600 uppercase tracking-wider">Date & Time</th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-600 uppercase tracking-wider">Room</th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-600 uppercase tracking-wider">Guest</th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-600 uppercase tracking-wider">Property</th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-600 uppercase tracking-wider">Items</th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-600 uppercase tracking-wider">Amount</th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-600 uppercase tracking-wider">Delivery</th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-600 uppercase tracking-wider">Payment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <FaHistory className="text-4xl text-gray-300" />
                                            <p className="text-gray-500 text-sm font-medium">No orders found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <motion.tr 
                                        key={order._id} 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="text-xs font-bold text-gray-900">
                                                {new Date(order.orderDate).toLocaleDateString('en-IN')}
                                            </div>
                                            <div className="text-[10px] text-gray-500">
                                                {new Date(order.orderDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-base font-black text-gray-900">#{order.roomNumber}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-bold text-gray-900">{order.guestName}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold">
                                                {order.property}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-xs space-y-0.5">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="font-medium text-gray-700">
                                                        {item.name} <span className="text-gray-500">x{item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-base font-black text-gray-900">₹{order.totalAmount.toLocaleString()}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 ${
                                                order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                order.status === 'Preparing' ? 'bg-purple-100 text-purple-700' :
                                                order.status === 'Accepted' ? 'bg-blue-100 text-blue-700' :
                                                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {order.status === 'Delivered' && <FaCheckCircle className="text-[10px]" />}
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold inline-flex items-center gap-1">
                                                <FaMoneyBillWave className="text-[10px]" />
                                                Paid
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


        </motion.div>
    );
};

export default OrderHistory;
