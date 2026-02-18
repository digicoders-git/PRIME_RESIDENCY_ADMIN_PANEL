import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaUtensils, FaCheckCircle, FaFilter, FaMoneyBillWave, FaClipboardList, FaCreditCard } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../api/api';
import { loadRazorpayScript, createRazorpayOrder } from '../utils/payment';

const CreateOrder = () => {
    const [availableRooms, setAvailableRooms] = useState([]);
    const [foodItems, setFoodItems] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [orderItems, setOrderItems] = useState([{ foodItemId: '', quantity: 1 }]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState({ property: '' });
    const [recentOrders, setRecentOrders] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [roomFilter, setRoomFilter] = useState('All');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);
        fetchAvailableRooms(userData.property);
        fetchFoodItems(userData.property);
        fetchRecentOrders(userData.property);
    }, []);

    const fetchAvailableRooms = async (property) => {
        try {
            const params = property ? { property } : {};
            const { data } = await api.get('/bookings', { params });
            if (data.success) {
                const checkedIn = data.data.filter(b => b.status === 'Checked-in');
                setAvailableRooms(checkedIn);
            }
        } catch (error) {
            toast.error('Failed to fetch rooms');
        }
    };

    const fetchFoodItems = async (property) => {
        try {
            const params = property ? { property } : {};
            const { data } = await api.get('/food-items', { params });
            if (data.success) {
                setFoodItems(data.data.filter(item => item.stock > 0));
            }
        } catch (error) {
            toast.error('Failed to fetch food items');
        }
    };

    const fetchRecentOrders = async (property) => {
        try {
            const params = property ? { property } : {};
            const { data } = await api.get('/food-orders', { params });
            if (data.success) {
                setRecentOrders(data.data.slice(0, 10));
            }
        } catch (error) {
            console.error('Failed to fetch orders');
        }
    };

    const addOrderItem = () => {
        setOrderItems([...orderItems, { foodItemId: '', quantity: 1 }]);
    };

    const removeOrderItem = (index) => {
        if (orderItems.length > 1) {
            setOrderItems(orderItems.filter((_, i) => i !== index));
        }
    };

    const updateOrderItem = (index, field, value) => {
        const updated = [...orderItems];
        updated[index][field] = value;
        setOrderItems(updated);
    };

    const calculateTotal = () => {
        return orderItems.reduce((sum, item) => {
            const foodItem = foodItems.find(f => f._id === item.foodItemId);
            return sum + (foodItem ? foodItem.price * item.quantity : 0);
        }, 0);
    };

    const handleCreateOrder = async () => {
        if (!selectedRoom) {
            toast.error('Please select a room');
            return;
        }

        const validItems = orderItems.filter(item => item.foodItemId && item.quantity > 0);
        if (validItems.length === 0) {
            toast.error('Please add at least one item');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/food-orders', {
                bookingId: selectedRoom,
                items: validItems,
                status: 'Delivered'
            });
            if (data.success) {
                toast.success('Order created and delivered successfully!');
                setSelectedRoom('');
                setOrderItems([{ foodItemId: '', quantity: 1 }]);
                setShowModal(false);
                fetchFoodItems(user.property);
                fetchRecentOrders(user.property);
            }
        } catch (error) {
            toast.error('Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = roomFilter === 'All' 
        ? recentOrders 
        : recentOrders.filter(o => o.roomNumber === roomFilter);

    const stats = {
        totalOrders: filteredOrders.length,
        totalRevenue: filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        paidOrders: filteredOrders.length,
        pendingAmount: 0
    };

    const handleRoomPayment = async () => {
        const amount = stats.totalRevenue;
        const bookingId = filteredOrders[0]?.bookingId;

        if (paymentMethod === 'Online') {
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                toast.error('Failed to load payment gateway');
                return;
            }

            try {
                const orderData = await createRazorpayOrder(amount, `FOOD_${roomFilter}_${Date.now()}`);
                
                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount: orderData.data.amount,
                    currency: 'INR',
                    name: 'Prime Residency',
                    description: `Food orders payment for Room ${roomFilter}`,
                    order_id: orderData.data.id,
                    handler: async (response) => {
                        try {
                            await api.put(`/bookings/${bookingId}/payment`, {
                                advance: amount,
                                paymentMethod: 'Online'
                            });

                            await api.post('/revenue', {
                                source: 'Food Order',
                                amount: amount,
                                category: 'Food',
                                description: `Food orders payment for Room ${roomFilter}`,
                                property: user.property
                            });

                            toast.success('Payment successful!');
                            setShowPaymentModal(false);
                            fetchRecentOrders(user.property);
                        } catch (error) {
                            toast.error('Failed to record payment');
                        }
                    },
                    theme: { color: '#D4AF37' },
                    modal: {
                        ondismiss: () => toast.info('Payment cancelled')
                    }
                };

                const razorpay = new window.Razorpay(options);
                razorpay.open();
            } catch (error) {
                toast.error('Failed to create payment order');
            }
        } else {
            try {
                await api.put(`/bookings/${bookingId}/payment`, {
                    advance: amount,
                    paymentMethod: 'Cash'
                });

                await api.post('/revenue', {
                    source: 'Food Order',
                    amount: amount,
                    category: 'Food',
                    description: `Food orders payment for Room ${roomFilter}`,
                    property: user.property
                });

                toast.success('Cash payment recorded successfully!');
                setShowPaymentModal(false);
                fetchRecentOrders(user.property);
            } catch (error) {
                toast.error('Failed to record payment');
            }
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <FaUtensils className="text-2xl" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black">Food Orders</h1>
                            <p className="text-yellow-100 text-sm mt-0.5">Manage and track all food orders</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-[#D4AF37] rounded-xl font-bold hover:shadow-xl transition-all cursor-pointer"
                    >
                        <FaPlus /> Create Order
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Total Orders</p>
                            <p className="text-3xl font-black text-gray-900 mt-1">{stats.totalOrders}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <FaClipboardList className="text-2xl text-blue-600" />
                        </div>
                    </div>
                </motion.div>

                <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl shadow-md p-5 border-l-4 border-amber-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Total Revenue</p>
                            <p className="text-3xl font-black text-gray-900 mt-1">₹{stats.totalRevenue}</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                            <FaMoneyBillWave className="text-2xl text-amber-600" />
                        </div>
                    </div>
                </motion.div>

                <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Paid Orders</p>
                            <p className="text-3xl font-black text-gray-900 mt-1">{stats.paidOrders}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <FaCheckCircle className="text-2xl text-green-600" />
                        </div>
                    </div>
                </motion.div>

                <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Pending</p>
                            <p className="text-3xl font-black text-gray-900 mt-1">₹{stats.pendingAmount}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <FaMoneyBillWave className="text-2xl text-red-600" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Room Filter */}
            <div className="bg-white rounded-xl shadow-md p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FaFilter className="text-gray-400" />
                        <label className="text-sm font-bold text-gray-700">Filter by Room:</label>
                        <select
                            value={roomFilter}
                            onChange={(e) => setRoomFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] font-medium"
                        >
                            <option value="All">All Rooms</option>
                            {[...new Set(recentOrders.map(o => o.roomNumber))].sort().map(roomNum => (
                                <option key={roomNum} value={roomNum}>Room {roomNum}</option>
                            ))}
                        </select>
                    </div>
                    {roomFilter !== 'All' && filteredOrders.length > 0 && (
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:shadow-lg font-bold cursor-pointer"
                        >
                            <FaCreditCard /> Pay All Orders (₹{stats.totalRevenue})
                        </button>
                    )}
                </div>
            </div>

            {/* Orders Table */}
            {filteredOrders.length > 0 && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900">Orders List</h3>
                    </div>
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Time</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Room</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Guest</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Items</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredOrders.map(order => (
                                <motion.tr 
                                    key={order._id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {new Date(order.orderDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-4 py-3 font-bold">{order.roomNumber}</td>
                                    <td className="px-4 py-3">{order.guestName}</td>
                                    <td className="px-4 py-3">
                                        <div className="text-xs">
                                            {order.items.map((item, idx) => (
                                                <div key={idx}>{item.name} x{item.quantity}</div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-bold">₹{order.totalAmount}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                            order.status === 'Preparing' ? 'bg-purple-100 text-purple-700' :
                                            order.status === 'Accepted' ? 'bg-blue-100 text-blue-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Order Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-2xl font-black text-gray-900">Create New Order</h3>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Select Room</label>
                                <select
                                    value={selectedRoom}
                                    onChange={(e) => setSelectedRoom(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                >
                                    <option value="">-- Choose a checked-in room --</option>
                                    {availableRooms.map(booking => (
                                        <option key={booking._id} value={booking._id}>
                                            Room {booking.roomNumber} - {booking.guest}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-sm font-bold text-gray-700">Order Items</label>
                                    <button
                                        onClick={addOrderItem}
                                        className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg text-sm font-bold cursor-pointer"
                                    >
                                        <FaPlus /> Add
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {orderItems.map((item, index) => (
                                        <div key={index} className="flex gap-2">
                                            <select
                                                value={item.foodItemId}
                                                onChange={(e) => updateOrderItem(index, 'foodItemId', e.target.value)}
                                                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                            >
                                                <option value="">-- Select item --</option>
                                                {foodItems.map(food => (
                                                    <option key={food._id} value={food._id}>
                                                        {food.name} - ₹{food.price}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                className="w-20 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                            />
                                            {orderItems.length > 1 && (
                                                <button
                                                    onClick={() => removeOrderItem(index)}
                                                    className="p-3 bg-red-500 text-white rounded-lg cursor-pointer"
                                                >
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold">Total</span>
                                    <span className="text-2xl font-black text-[#D4AF37]">₹{calculateTotal()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex gap-3">
                            <button
                                onClick={handleCreateOrder}
                                disabled={loading || !selectedRoom || orderItems.filter(i => i.foodItemId).length === 0}
                                className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold cursor-pointer hover:bg-emerald-600 disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Order'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedRoom('');
                                    setOrderItems([{ foodItemId: '', quantity: 1 }]);
                                }}
                                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 w-full max-w-lg">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <FaCreditCard className="text-emerald-500" /> Pay All Orders - Room {roomFilter}
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-sm text-gray-600 mb-2">Total Orders: <span className="font-bold text-gray-900">{filteredOrders.length}</span></p>
                                <div className="border-t border-gray-200 pt-3 mt-3">
                                    <p className="text-lg font-black text-emerald-600">Total Amount: ₹{stats.totalRevenue}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-700">Payment Method</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setPaymentMethod('Cash')}
                                        className={`p-4 rounded-xl border-2 font-bold transition-all ${
                                            paymentMethod === 'Cash'
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <FaMoneyBillWave className="mx-auto mb-2 text-2xl" />
                                        Cash Payment
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('Online')}
                                        className={`p-4 rounded-xl border-2 font-bold transition-all ${
                                            paymentMethod === 'Online'
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <FaCreditCard className="mx-auto mb-2 text-2xl" />
                                        Online Payment
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleRoomPayment}
                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-bold cursor-pointer hover:shadow-lg"
                                >
                                    {paymentMethod === 'Cash' ? 'Record Cash Payment' : 'Proceed to Payment'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setPaymentMethod('Cash');
                                    }}
                                    className="flex-1 bg-gray-200 py-4 rounded-xl font-bold cursor-pointer hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default CreateOrder;
