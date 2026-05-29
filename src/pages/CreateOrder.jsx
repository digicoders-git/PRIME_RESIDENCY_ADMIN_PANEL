import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrash, FaUtensils, FaCheckCircle, FaFilter, FaMoneyBillWave, FaClipboardList, FaCreditCard, FaSearch, FaTimes, FaTag } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../api/api';
import { loadRazorpayScript, createRazorpayOrder } from '../utils/payment';

const CreateOrder = () => {
    const [availableRooms, setAvailableRooms] = useState([]);
    const [foodItems, setFoodItems] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [orderItems, setOrderItems] = useState([{ foodItemId: '', quantity: '' }]);
    const [openSelectorIndex, setOpenSelectorIndex] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const selectorRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState({ property: '' });
    const [recentOrders, setRecentOrders] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [roomFilter, setRoomFilter] = useState('All');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);
        fetchAvailableRooms(userData.property);
        fetchFoodItems(userData.property);
        fetchRecentOrders(userData.property);
        fetchCategories(userData.property);
    }, []);

    const fetchCategories = async (property) => {
        try {
            const params = property ? { property } : {};
            const { data } = await api.get('/food-items/categories', { params });
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch categories', error);
        }
    };

    // Close selector on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (selectorRef.current && !selectorRef.current.contains(e.target)) {
                setOpenSelectorIndex(null);
                setSearchQuery('');
                setSelectedCategory('All');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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
                // Populate booking data to check payment status
                const ordersWithBooking = await Promise.all(
                    data.data.map(async (order) => {
                        try {
                            const bookingId = order.bookingId?._id || order.bookingId;
                            const { data: bookingData } = await api.get(`/bookings/${bookingId}`);
                            return { ...order, bookingDetails: bookingData.data };
                        } catch (error) {
                            return order;
                        }
                    })
                );
                setRecentOrders(ordersWithBooking.slice(0, 10));
            }
        } catch (error) {
            console.error('Failed to fetch orders');
        }
    };

    const addOrderItem = () => {
        setOrderItems([...orderItems, { foodItemId: '', quantity: '' }]);
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

    const FOOD_CATEGORIES = ['All', ...new Set(categories.map(c => c.name))];

    const getCategoryColors = (cat) => {
        const colors = {
            All: { bg: 'bg-gray-700', text: 'text-white', border: 'border-gray-700', lightBg: 'bg-gray-100', lightText: 'text-gray-700' },
            Snacks: { bg: 'bg-yellow-500', text: 'text-white', border: 'border-yellow-500', lightBg: 'bg-yellow-50', lightText: 'text-yellow-700' },
            Beverages: { bg: 'bg-cyan-500', text: 'text-white', border: 'border-cyan-500', lightBg: 'bg-cyan-50', lightText: 'text-cyan-700' },
            Other: { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-500', lightBg: 'bg-purple-50', lightText: 'text-purple-700' },
            Breakfast: { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-500', lightBg: 'bg-orange-50', lightText: 'text-orange-700' },
            Lunch: { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-500', lightBg: 'bg-emerald-50', lightText: 'text-emerald-700' },
            Dinner: { bg: 'bg-indigo-500', text: 'text-white', border: 'border-indigo-500', lightBg: 'bg-indigo-50', lightText: 'text-indigo-700' }
        };
        
        if (colors[cat]) return colors[cat];

        const customPalettes = [
            { bg: 'bg-rose-500', text: 'text-white', border: 'border-rose-500', lightBg: 'bg-rose-50', lightText: 'text-rose-700' },
            { bg: 'bg-amber-600', text: 'text-white', border: 'border-amber-600', lightBg: 'bg-amber-50', lightText: 'text-amber-700' },
            { bg: 'bg-teal-500', text: 'text-white', border: 'border-teal-500', lightBg: 'bg-teal-50', lightText: 'text-teal-700' },
            { bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-500', lightBg: 'bg-pink-50', lightText: 'text-pink-700' },
            { bg: 'bg-lime-600', text: 'text-white', border: 'border-lime-600', lightBg: 'bg-lime-50', lightText: 'text-lime-700' }
        ];

        let hash = 0;
        const str = cat || 'Other';
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % customPalettes.length;
        return customPalettes[index];
    };

    const getFilteredFoodItems = () => {
        return foodItems.filter(food => {
            const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
            const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    };

    const handleSelectFoodItem = (index, food) => {
        updateOrderItem(index, 'foodItemId', food._id);
        setOpenSelectorIndex(null);
        setSearchQuery('');
        setSelectedCategory('All');
    };

    const openSelector = (index) => {
        setOpenSelectorIndex(index);
        setSearchQuery('');
        setSelectedCategory('All');
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

        // Validate stock availability
        for (const item of validItems) {
            const foodItem = foodItems.find(f => f._id === item.foodItemId);
            if (foodItem && item.quantity > foodItem.stock) {
                toast.error(`Insufficient stock for ${foodItem.name}. Available: ${foodItem.stock}`);
                return;
            }
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

    // Check if room's food orders are paid by checking booking balance
    const isRoomPaid = () => {
        if (roomFilter === 'All' || filteredOrders.length === 0) return false;
        const booking = filteredOrders[0]?.bookingDetails;
        if (!booking) return false;
        // Check if booking balance is 0 or less (fully paid)
        return booking.balance <= 0;
    };

    const stats = {
        totalOrders: filteredOrders.length,
        totalRevenue: filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        paidOrders: filteredOrders.filter(o => o.bookingDetails?.balance <= 0).length,
        pendingAmount: filteredOrders
            .filter(o => o.bookingDetails?.balance > 0)
            .reduce((sum, o) => sum + o.totalAmount, 0)
    };

    const handleRoomPayment = async () => {
        const amount = stats.totalRevenue;
        const roomOrders = filteredOrders.filter(o => o.roomNumber === roomFilter);
        
        if (roomOrders.length === 0) {
            toast.error('No orders found for this room');
            return;
        }

        const bookingId = roomOrders[0]?.bookingId?._id || roomOrders[0]?.bookingId;
        
        if (!bookingId) {
            toast.error('Invalid booking ID');
            return;
        }

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
                            // Get current booking to check existing advance
                            const { data: bookingData } = await api.get(`/bookings/${bookingId}`);
                            const currentAdvance = bookingData.data.advance || 0;
                            const totalAdvance = currentAdvance + amount;

                            await api.put(`/bookings/${bookingId}/payment`, {
                                advance: amount,
                                paymentMethod: 'Online'
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

                toast.success('Cash payment recorded successfully!');
                setShowPaymentModal(false);
                fetchRecentOrders(user.property);
            } catch (error) {
                console.error('Payment error:', error);
                toast.error(error.response?.data?.message || 'Failed to record payment');
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
                    {roomFilter !== 'All' && filteredOrders.length > 0 && !isRoomPaid() && (
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:shadow-lg font-bold cursor-pointer"
                        >
                            <FaCreditCard /> Pay All Orders (₹{stats.totalRevenue})
                        </button>
                    )}
                    {roomFilter !== 'All' && filteredOrders.length > 0 && isRoomPaid() && (
                        <div className="flex items-center gap-2 px-6 py-2 bg-green-100 text-green-700 rounded-xl font-bold border-2 border-green-200">
                            <FaCheckCircle /> All Orders Paid
                        </div>
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
                                            order.bookingDetails?.balance <= 0 ? 'bg-green-100 text-green-700' :
                                            order.bookingDetails?.balance > 0 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {order.bookingDetails?.balance <= 0 ? 'Paid' : 'Pending'}
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl border border-amber-100"
                    >
                        {/* Premium Gradient Header */}
                        <div className="bg-gradient-to-r from-[#D4AF37] via-[#C5A028] to-[#B8860B] px-8 py-5 flex justify-between items-center text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                    <FaUtensils className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-wide uppercase">New Food Order</h3>
                                    <p className="text-xs text-yellow-100 mt-0.5 opacity-90">Select room and add culinary delights</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedRoom('');
                                    setOrderItems([{ foodItemId: '', quantity: '' }]);
                                }}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer font-bold"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Room Selector Card */}
                            <div className="bg-amber-50/45 p-6 rounded-2xl border border-amber-100/50 shadow-sm">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Checked-in Room</label>
                                <div className="relative">
                                    <select
                                        value={selectedRoom}
                                        onChange={(e) => setSelectedRoom(e.target.value)}
                                        className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 text-sm font-bold text-gray-800 transition-all shadow-inner"
                                    >
                                        <option value="">-- Choose a checked-in room --</option>
                                        {availableRooms.map(booking => (
                                            <option key={booking._id} value={booking._id}>
                                                Room {booking.roomNumber} - {booking.guest}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Order Items Section */}
                            <div ref={selectorRef} className="space-y-4">
                                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                    <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                                        <FaClipboardList className="text-[#D4AF37]" /> Items to Order
                                    </h4>
                                    <button
                                        onClick={addOrderItem}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:shadow-lg transition-all"
                                    >
                                        <FaPlus size={10} /> Add Another Item
                                    </button>
                                </div>

                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                                    {orderItems.map((item, index) => {
                                        const selectedFood = foodItems.find(f => f._id === item.foodItemId);
                                        const catColor = selectedFood ? getCategoryColors(selectedFood.category) : null;
                                        return (
                                            <div key={index} className="flex flex-col gap-2 p-4 bg-gray-50/70 border border-gray-100 rounded-xl hover:border-amber-200 transition-all hover:bg-amber-50/10">
                                                {/* Trigger Button */}
                                                <div className="flex gap-3 items-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => openSelectorIndex === index ? setOpenSelectorIndex(null) : openSelector(index)}
                                                        className={`flex-1 flex items-center justify-between p-3.5 border rounded-xl text-left transition-all cursor-pointer ${
                                                            openSelectorIndex === index
                                                                ? 'border-[#D4AF37] bg-amber-50/70 ring-2 ring-[#D4AF37]/20 shadow-md'
                                                                : selectedFood
                                                                    ? 'border-gray-200 bg-white hover:border-[#D4AF37]'
                                                                    : 'border-dashed border-gray-300 hover:border-[#D4AF37] bg-white text-gray-400'
                                                        }`}
                                                    >
                                                        {selectedFood ? (
                                                            <div className="flex items-center gap-2.5 min-w-0">
                                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${catColor?.lightBg} ${catColor?.lightText} whitespace-nowrap`}>
                                                                    {selectedFood.category}
                                                                </span>
                                                                <span className="font-extrabold text-gray-800 truncate text-sm">{selectedFood.name}</span>
                                                                <span className="text-[#D4AF37] font-black text-sm whitespace-nowrap">₹{selectedFood.price}</span>
                                                                <span className="text-xs text-gray-400 whitespace-nowrap bg-gray-100 px-2 py-0.5 rounded">Stock: {selectedFood.stock}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs font-bold flex items-center gap-2">
                                                                <FaSearch className="text-xs" /> Search & Select Food Item...
                                                            </span>
                                                        )}
                                                        <span className="text-gray-400 ml-2 text-xs">{openSelectorIndex === index ? '▲' : '▼'}</span>
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || '')}
                                                        placeholder="Qty"
                                                        className="w-24 p-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37] text-sm text-center font-bold text-gray-800"
                                                    />
                                                    {orderItems.length > 1 && (
                                                        <button
                                                            onClick={() => removeOrderItem(index)}
                                                            className="p-3.5 bg-rose-50 text-rose-600 rounded-xl cursor-pointer hover:bg-rose-100 border border-rose-100 transition-colors"
                                                            title="Delete item"
                                                        >
                                                            <FaTrash size={14} />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Smart Food Selector Dropdown */}
                                                <AnimatePresence>
                                                    {openSelectorIndex === index && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scaleY: 1 }}
                                                            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="w-full bg-white border border-[#D4AF37] rounded-xl shadow-xl overflow-hidden z-50 mt-1"
                                                        >
                                                            {/* Search Bar */}
                                                            <div className="p-3 border-b border-gray-100 bg-amber-50/50">
                                                                <div className="relative">
                                                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                                                    <input
                                                                        autoFocus
                                                                        type="text"
                                                                        value={searchQuery}
                                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                                        placeholder="Search items by name..."
                                                                        className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs bg-white font-medium"
                                                                    />
                                                                    {searchQuery && (
                                                                        <button
                                                                            onClick={() => setSearchQuery('')}
                                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                                                        >
                                                                            <FaTimes className="text-[10px]" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Category Tabs */}
                                                            <div className="flex gap-1 p-2 overflow-x-auto border-b border-gray-100 bg-gray-50 scrollbar-hide">
                                                                {FOOD_CATEGORIES.map(cat => {
                                                                    const catItems = cat === 'All' ? foodItems : foodItems.filter(f => f.category === cat);
                                                                    const isActive = selectedCategory === cat;
                                                                    const color = getCategoryColors(cat);
                                                                    return (
                                                                        <button
                                                                            key={cat}
                                                                            onClick={() => setSelectedCategory(cat)}
                                                                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all cursor-pointer border ${
                                                                                isActive
                                                                                    ? `${color.bg} ${color.text} ${color.border} shadow-sm scale-105`
                                                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                                                            }`}
                                                                        >
                                                                            <FaTag className="text-[10px]" />
                                                                            {cat}
                                                                            <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                                                                                isActive ? 'bg-white/30' : 'bg-gray-100 text-gray-500'
                                                                            }`}>{catItems.length}</span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>

                                                            {/* Items Grid */}
                                                            <div className="max-h-52 overflow-y-auto p-2 bg-white">
                                                                {getFilteredFoodItems().length === 0 ? (
                                                                    <div className="text-center py-6 text-gray-400">
                                                                        <FaUtensils className="mx-auto text-xl mb-2 opacity-30" />
                                                                        <p className="text-xs font-semibold">No items found</p>
                                                                    </div>
                                                                ) : (
                                                                    <div className="grid grid-cols-1 gap-1">
                                                                        {getFilteredFoodItems().map(food => {
                                                                            const isSelected = item.foodItemId === food._id;
                                                                            const fColor = getCategoryColors(food.category);
                                                                            return (
                                                                                <button
                                                                                    key={food._id}
                                                                                    type="button"
                                                                                    onClick={() => handleSelectFoodItem(index, food)}
                                                                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                                                                                        isSelected
                                                                                            ? 'bg-amber-50/70 border-2 border-[#D4AF37]'
                                                                                            : 'hover:bg-gray-50 border-2 border-transparent'
                                                                                    }`}
                                                                                >
                                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${fColor.lightBg} ${fColor.lightText} whitespace-nowrap`}>
                                                                                            {food.category}
                                                                                        </span>
                                                                                        <span className="font-semibold text-gray-800 text-xs truncate">{food.name}</span>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-3 ml-2 shrink-0">
                                                                                        <span className="text-[#D4AF37] font-black text-xs">₹{food.price}</span>
                                                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                                                            food.stock <= 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                                                                        }`}>
                                                                                            {food.stock <= 5 ? `Low: ${food.stock}` : `Stock: ${food.stock}`}
                                                                                        </span>
                                                                                        {isSelected && <FaCheckCircle className="text-[#D4AF37]" />}
                                                                                    </div>
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Luxury Total Bar */}
                            <div className="bg-[#D4AF37]/5 p-5 rounded-2xl border border-[#D4AF37]/20 flex justify-between items-center shadow-inner">
                                <span className="text-sm font-black text-gray-500 uppercase tracking-widest">Total Bill Amount</span>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-[#D4AF37] drop-shadow-sm">₹{calculateTotal()}</span>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Inclusive of all local taxes</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-4">
                            <button
                                onClick={handleCreateOrder}
                                disabled={loading || !selectedRoom || orderItems.filter(i => i.foodItemId).length === 0}
                                className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold cursor-pointer hover:shadow-lg disabled:opacity-50 transition-all hover:scale-[1.01] uppercase tracking-wider text-xs"
                            >
                                {loading ? 'Processing Order...' : 'Confirm & Deliver Order'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedRoom('');
                                    setOrderItems([{ foodItemId: '', quantity: '' }]);
                                }}
                                className="flex-1 py-4 bg-white border border-gray-200 text-gray-500 rounded-xl font-bold cursor-pointer hover:bg-gray-50 transition-all uppercase tracking-wider text-xs"
                            >
                                Dismiss
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
                                        className={`p-4 rounded-xl border-2 font-bold transition-all ${paymentMethod === 'Cash'
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <FaMoneyBillWave className="mx-auto mb-2 text-2xl" />
                                        Cash Payment
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('Online')}
                                        className={`p-4 rounded-xl border-2 font-bold transition-all ${paymentMethod === 'Online'
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
