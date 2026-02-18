import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUtensils, FaPlus, FaEdit, FaTrash, FaBuilding, FaClipboardList, FaFileInvoice, FaEye, FaPrint, FaMoneyBillWave, FaCreditCard, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../api/api';
import { loadRazorpayScript, createRazorpayOrder } from '../utils/payment';

const FoodStock = () => {
    const [items, setItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [propertyFilter, setPropertyFilter] = useState('All');
    const [activeTab, setActiveTab] = useState('stock');
    const [user, setUser] = useState({ role: 'Admin', property: '' });
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [availableRooms, setAvailableRooms] = useState([]);
    const [orderItems, setOrderItems] = useState([{ foodItemId: '', quantity: 1 }]);
    const [roomFilter, setRoomFilter] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderBillModal, setShowOrderBillModal] = useState(false);
    const [showAllOrdersPrint, setShowAllOrdersPrint] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [showRoomPayModal, setShowRoomPayModal] = useState(false);
    const [selectedRoomForPay, setSelectedRoomForPay] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    const [formData, setFormData] = useState({
        name: '',
        category: 'Snacks',
        price: '',
        stock: '',
        unit: 'piece',
        property: 'Prime Residency',
        description: ''
    });

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);
        if (userData.role === 'Manager' && userData.property) {
            setPropertyFilter(userData.property);
            setFormData(prev => ({ ...prev, property: userData.property }));
        }
        fetchAvailableRooms();
    }, []);

    useEffect(() => {
        if (propertyFilter) {
            fetchItems();
            fetchOrders();
        }
    }, [propertyFilter]);

    const fetchItems = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const params = {};
            if (userData.role === 'Manager' && userData.property) {
                params.property = userData.property;
            } else if (userData.role === 'Admin' && propertyFilter !== 'All') {
                params.property = propertyFilter;
            }
            
            const { data } = await api.get('/food-items', { params });
            if (data.success) setItems(data.data);
        } catch (error) {
            toast.error('Failed to fetch items');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const params = {};
            if (userData.role === 'Manager' && userData.property) {
                params.property = userData.property;
            } else if (userData.role === 'Admin' && propertyFilter !== 'All') {
                params.property = propertyFilter;
            }
            
            const { data } = await api.get('/food-orders', { params });
            if (data.success) setOrders(data.data);
        } catch (error) {
            toast.error('Failed to fetch orders');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editItem) {
                const { data } = await api.put(`/food-items/${editItem._id}`, formData);
                if (data.success) {
                    setItems(prev => prev.map(i => i._id === editItem._id ? data.data : i));
                    toast.success('Item updated');
                }
            } else {
                const { data } = await api.post('/food-items', formData);
                if (data.success) {
                    setItems(prev => [...prev, data.data]);
                    toast.success('Item added');
                }
            }
            setShowModal(false);
            resetForm();
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this item?')) return;
        try {
            await api.delete(`/food-items/${id}`);
            setItems(prev => prev.filter(i => i._id !== id));
            toast.success('Item deleted');
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: 'Snacks',
            price: '',
            stock: '',
            unit: 'piece',
            property: user.property || 'Prime Residency',
            description: ''
        });
        setEditItem(null);
    };

    const openEdit = (item) => {
        setEditItem(item);
        setFormData({
            name: item.name,
            category: item.category,
            price: item.price,
            stock: item.stock,
            unit: item.unit,
            property: item.property,
            description: item.description || ''
        });
        setShowModal(true);
    };

    const handleStatusUpdate = async (orderId, status) => {
        try {
            const { data } = await api.put(`/food-orders/${orderId}/status`, { status });
            if (data.success) {
                setOrders(prev => prev.map(o => o._id === orderId ? data.data : o));
                toast.success('Order status updated');
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const fetchAvailableRooms = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const params = {};
            if (userData.role === 'Manager' && userData.property) {
                params.property = userData.property;
            } else if (userData.role === 'Admin' && propertyFilter !== 'All') {
                params.property = propertyFilter;
            }
            
            const { data } = await api.get('/bookings', { params });
            if (data.success) {
                const checkedInBookings = data.data.filter(b => b.status === 'Checked-in');
                setAvailableRooms(checkedInBookings);
            }
        } catch (error) {
            console.error('Failed to fetch rooms');
        }
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

        try {
            const { data } = await api.post('/food-orders', {
                bookingId: selectedRoom,
                items: validItems,
                status: 'Delivered'
            });
            if (data.success) {
                toast.success('Order created and delivered successfully');
                setShowOrderModal(false);
                setSelectedRoom('');
                setOrderItems([{ foodItemId: '', quantity: 1 }]);
                fetchOrders();
            }
        } catch (error) {
            toast.error('Failed to create order');
        }
    };

    const addOrderItem = () => {
        setOrderItems([...orderItems, { foodItemId: '', quantity: 1 }]);
    };

    const removeOrderItem = (index) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };

    const updateOrderItem = (index, field, value) => {
        const updated = [...orderItems];
        updated[index][field] = value;
        setOrderItems(updated);
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowOrderBillModal(true);
    };

    const handlePrintOrder = () => {
        window.print();
    };

    const handlePrintAllOrders = () => {
        setShowAllOrdersPrint(true);
        setTimeout(() => window.print(), 100);
    };

    const handlePayOrder = (order) => {
        setSelectedOrder(order);
        setPaymentAmount(order.totalAmount.toString());
        setShowPaymentModal(true);
    };

    const handlePaymentSubmit = async () => {
        try {
            const amount = parseFloat(paymentAmount);
            if (isNaN(amount) || amount <= 0) {
                toast.error('Please enter a valid amount');
                return;
            }

            const { data } = await api.put(`/bookings/${selectedOrder.bookingId}/payment`, {
                advance: amount,
                paymentMethod: 'Cash'
            });
            if (data.success) {
                // Add to revenue
                try {
                    await api.post('/revenue', {
                        source: 'Food Order',
                        amount: amount,
                        category: 'Food',
                        description: `Food order payment for Room ${selectedOrder.roomNumber}`,
                        property: selectedOrder.property
                    });
                } catch (revError) {
                    console.error('Failed to add to revenue:', revError);
                }
                
                toast.success('Payment recorded and added to revenue');
                setShowPaymentModal(false);
                setPaymentAmount('');
                fetchOrders();
            }
        } catch (error) {
            toast.error('Failed to record payment');
        }
    };

    const handleRoomPayment = (roomNumber) => {
        const roomOrders = orders.filter(o => o.roomNumber === roomNumber);
        const totalAmount = roomOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        setSelectedRoomForPay({ roomNumber, orders: roomOrders, totalAmount });
        setShowRoomPayModal(true);
    };

    const processRoomPayment = async () => {
        if (!selectedRoomForPay) return;

        const amount = selectedRoomForPay.totalAmount;
        const bookingId = selectedRoomForPay.orders[0]?.bookingId;

        if (paymentMethod === 'Online') {
            // Razorpay payment
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                toast.error('Failed to load payment gateway');
                return;
            }

            try {
                const orderData = await createRazorpayOrder(amount, `FOOD_${selectedRoomForPay.roomNumber}_${Date.now()}`);
                
                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount: orderData.data.amount,
                    currency: 'INR',
                    name: 'Prime Residency',
                    description: `Food orders payment for Room ${selectedRoomForPay.roomNumber}`,
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
                                description: `Food orders payment for Room ${selectedRoomForPay.roomNumber}`,
                                property: selectedRoomForPay.orders[0].property
                            });

                            toast.success('Payment successful!');
                            setShowRoomPayModal(false);
                            fetchOrders();
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
            // Cash payment
            try {
                await api.put(`/bookings/${bookingId}/payment`, {
                    advance: amount,
                    paymentMethod: 'Cash'
                });

                await api.post('/revenue', {
                    source: 'Food Order',
                    amount: amount,
                    category: 'Food',
                    description: `Food orders payment for Room ${selectedRoomForPay.roomNumber}`,
                    property: selectedRoomForPay.orders[0].property
                });

                toast.success('Cash payment recorded successfully!');
                setShowRoomPayModal(false);
                fetchOrders();
            } catch (error) {
                toast.error('Failed to record payment');
            }
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <FaUtensils className="text-[#D4AF37]" /> Food Management
                    </h1>
                    <p className="text-gray-500 mt-1">Manage food items stock</p>
                </div>
                <div className="flex gap-3">
                    {user.role === 'Admin' && (
                        <button
                            onClick={() => { resetForm(); setShowModal(true); }}
                            className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-white rounded-xl hover:bg-[#B8860B] font-bold cursor-pointer"
                        >
                            <FaPlus /> Add Item
                        </button>
                    )}
                </div>
            </div>

            <div className="flex gap-4 items-center">
                {user.role === 'Admin' && (
                    <div className="flex gap-2">
                        {['All', 'Prime Residency', 'Prem Kunj'].map(p => (
                            <button
                                key={p}
                                onClick={() => {
                                    setPropertyFilter(p);
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-2 rounded-lg font-bold ${propertyFilter === p ? 'bg-[#D4AF37] text-white' : 'bg-white border'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {activeTab === 'stock' && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Price</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Stock</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Property</th>
                                {user.role === 'Admin' && (
                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(item => (
                                <tr key={item._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{item.name}</td>
                                    <td className="px-4 py-3">{item.category}</td>
                                    <td className="px-4 py-3">₹{item.price}</td>
                                    <td className="px-4 py-3">
                                        <span className={`font-bold ${item.stock < 10 ? 'text-red-500' : 'text-green-500'}`}>
                                            {item.stock} {item.unit}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold">
                                            {item.property}
                                        </span>
                                    </td>
                                    {user.role === 'Admin' && (
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => openEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded cursor-pointer">
                                                <FaEdit />
                                            </button>
                                            <button onClick={() => handleDelete(item._id)} className="p-2 text-red-600 hover:bg-red-50 rounded cursor-pointer">
                                                <FaTrash />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {Math.ceil(items.length / itemsPerPage) > 1 && (
                <div className="flex justify-center mt-6">
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 text-gray-400 hover:text-[#D4AF37] hover:bg-gray-50 rounded-lg transition-all disabled:opacity-30 cursor-pointer"
                        >
                            <FaChevronLeft />
                        </button>

                        <div className="flex items-center gap-1">
                            {[...Array(Math.ceil(items.length / itemsPerPage))].map((_, i) => {
                                const pageNum = i + 1;
                                const totalPages = Math.ceil(items.length / itemsPerPage);
                                if (
                                    pageNum === 1 ||
                                    pageNum === totalPages ||
                                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                                                currentPage === pageNum
                                                    ? 'bg-[#D4AF37] text-white shadow-md'
                                                    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                    return <span key={pageNum} className="px-1 text-gray-300">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(items.length / itemsPerPage)))}
                            disabled={currentPage === Math.ceil(items.length / itemsPerPage)}
                            className="p-2 text-gray-400 hover:text-[#D4AF37] hover:bg-gray-50 rounded-lg transition-all disabled:opacity-30 cursor-pointer"
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 w-full max-w-md">
                        <h3 className="text-2xl font-bold mb-6">{editItem ? 'Edit' : 'Add'} Food Item</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                required
                                placeholder="Item Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-3 border rounded-xl"
                            />
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full p-3 border rounded-xl"
                            >
                                <option value="Breakfast">Breakfast</option>
                                <option value="Lunch">Lunch</option>
                                <option value="Dinner">Dinner</option>
                                <option value="Snacks">Snacks</option>
                                <option value="Beverages">Beverages</option>
                                <option value="Other">Other</option>
                            </select>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    required
                                    type="number"
                                    placeholder="Price"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="p-3 border rounded-xl"
                                />
                                <input
                                    required
                                    type="number"
                                    placeholder="Stock"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    className="p-3 border rounded-xl"
                                />
                            </div>
                            <select
                                value={formData.property}
                                onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                                disabled={user.role === 'Manager'}
                                className="w-full p-3 border rounded-xl"
                            >
                                <option value="Prime Residency">Prime Residency</option>
                                <option value="Prem Kunj">Prem Kunj</option>
                            </select>
                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="flex-1 bg-[#D4AF37] text-white py-3 rounded-xl font-bold cursor-pointer">
                                    {editItem ? 'Update' : 'Add'}
                                </button>
                                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 bg-gray-200 py-3 rounded-xl font-bold cursor-pointer">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {showOrderModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-bold mb-6">Create Food Order</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-700">Select Room (Checked-in Only)</label>
                                <select
                                    value={selectedRoom}
                                    onChange={(e) => setSelectedRoom(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                                    required
                                >
                                    <option value="">-- Choose a checked-in room --</option>
                                    {availableRooms.length === 0 ? (
                                        <option disabled>No checked-in rooms available</option>
                                    ) : (
                                        availableRooms.map(booking => (
                                            <option key={booking._id} value={booking._id}>
                                                Room {booking.roomNumber} - {booking.guest} ({booking.property})
                                            </option>
                                        ))
                                    )}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Only rooms with checked-in guests are shown</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-700">Order Items</label>
                                {orderItems.map((item, index) => (
                                    <div key={index} className="flex gap-2 mb-3 items-start">
                                        <div className="flex-1">
                                            <select
                                                value={item.foodItemId}
                                                onChange={(e) => updateOrderItem(index, 'foodItemId', e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                                                required
                                            >
                                                <option value="">-- Select food item --</option>
                                                {items.length === 0 ? (
                                                    <option disabled>No food items available</option>
                                                ) : (
                                                    items.filter(f => f.stock > 0).map(foodItem => (
                                                        <option key={foodItem._id} value={foodItem._id}>
                                                            {foodItem.name} - ₹{foodItem.price} (Stock: {foodItem.stock})
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                        </div>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                            className="w-24 p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                                            placeholder="Qty"
                                            required
                                        />
                                        {orderItems.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeOrderItem(index)}
                                                className="p-3 bg-red-500 text-white rounded-xl cursor-pointer hover:bg-red-600 transition-colors"
                                                title="Remove item"
                                            >
                                                <FaTrash />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addOrderItem}
                                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-bold cursor-pointer hover:bg-blue-600 transition-colors"
                                >
                                    + Add Another Item
                                </button>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <p className="text-sm text-gray-600">
                                    <strong>Note:</strong> Only food items with available stock are shown. Stock will be automatically reduced after order creation.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCreateOrder}
                                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold cursor-pointer hover:bg-green-700 transition-colors"
                                >
                                    Create Order
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowOrderModal(false);
                                        setSelectedRoom('');
                                        setOrderItems([{ foodItemId: '', quantity: 1 }]);
                                    }}
                                    className="flex-1 bg-gray-200 py-3 rounded-xl font-bold cursor-pointer hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Order Bill Modal */}
            {showOrderBillModal && selectedOrder && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40 print:hidden" onClick={() => setShowOrderBillModal(false)}></div>
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:relative print:p-0">
                        <motion.div 
                            initial={{ scale: 0.9 }} 
                            animate={{ scale: 1 }} 
                            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto print:max-w-none print:shadow-none print:rounded-none"
                        >
                        {/* Header - Hidden on print */}
                        <div className="bg-gray-900 px-6 py-4 flex justify-between items-center print:hidden">
                            <h3 className="text-white font-bold text-lg">Food Order Bill</h3>
                            <button
                                onClick={() => setShowOrderBillModal(false)}
                                className="text-gray-400 hover:text-white transition-colors p-2"
                            >
                                <FaTrash />
                            </button>
                        </div>

                        {/* Bill Content */}
                        <div className="p-8" id="order-bill-content">
                            {/* Header */}
                            <div className="text-center mb-8 border-b-2 border-gray-200 pb-6">
                                <h1 className="text-3xl font-black text-gray-900 uppercase">Prime Residency</h1>
                                <p className="text-sm text-gray-500 mt-1">Food Order Receipt</p>
                                <p className="text-xs text-gray-400 mt-2">Date: {new Date(selectedOrder.orderDate).toLocaleDateString('en-IN')}</p>
                            </div>

                            {/* Room & Guest Info */}
                            <div className="grid grid-cols-2 gap-6 mb-8 bg-gray-50 p-6 rounded-xl">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Room Number</p>
                                    <p className="text-2xl font-black text-gray-900">{selectedOrder.roomNumber}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Guest Name</p>
                                    <p className="text-lg font-bold text-gray-900">{selectedOrder.guestName}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Property</p>
                                    <p className="text-sm font-bold text-gray-700">{selectedOrder.property}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Order Status</p>
                                    <span className={`px-3 py-1 rounded text-xs font-bold inline-block ${
                                        selectedOrder.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                        selectedOrder.status === 'Accepted' ? 'bg-blue-100 text-blue-700' :
                                        selectedOrder.status === 'Preparing' ? 'bg-purple-100 text-purple-700' :
                                        selectedOrder.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                            </div>

                            {/* Items Table */}
                            <table className="w-full mb-8">
                                <thead>
                                    <tr className="bg-gray-100 border-y border-gray-200">
                                        <th className="py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase">Item</th>
                                        <th className="py-3 px-4 text-center text-xs font-bold text-gray-600 uppercase">Price</th>
                                        <th className="py-3 px-4 text-center text-xs font-bold text-gray-600 uppercase">Qty</th>
                                        <th className="py-3 px-4 text-right text-xs font-bold text-gray-600 uppercase">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {selectedOrder.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                                            <td className="py-3 px-4 text-center text-gray-600">₹{item.price}</td>
                                            <td className="py-3 px-4 text-center text-gray-600">{item.quantity}</td>
                                            <td className="py-3 px-4 text-right font-bold text-gray-900">₹{item.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Total */}
                            <div className="flex justify-end mb-8 border-t-2 border-gray-200 pt-4">
                                <div className="w-64">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-black text-gray-900 uppercase">Total Amount</span>
                                        <span className="text-2xl font-black text-[#D4AF37]">₹{selectedOrder.totalAmount}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="text-center text-xs text-gray-400 border-t border-gray-200 pt-4">
                                <p>Thank you for your order!</p>
                                <p className="mt-1">This is a computer generated receipt.</p>
                            </div>
                        </div>

                        {/* Actions - Hidden on print */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3 print:hidden">
                            <button
                                onClick={handlePrintOrder}
                                className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-white rounded-xl hover:bg-[#B8860B] font-bold cursor-pointer"
                            >
                                <FaPrint /> Print Bill
                            </button>
                            <button
                                onClick={() => setShowOrderBillModal(false)}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-bold cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
                </>
            )}

            {/* All Orders Print Modal */}
            {showAllOrdersPrint && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40 print:hidden" onClick={() => setShowAllOrdersPrint(false)}></div>
                    <div className="fixed inset-0 z-50 overflow-auto flex items-start justify-center p-4 print:static print:p-0" id="all-orders-print">
                        <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full my-8 print:my-0 print:shadow-none print:rounded-none print:max-w-none">
                            <div className="p-8 print:p-6">
                        {/* Header */}
                        <div className="text-center mb-8 border-b-2 border-gray-200 pb-6 print:mb-4 print:pb-4">
                            <h1 className="text-4xl font-black text-gray-900 uppercase">Prime Residency</h1>
                            <p className="text-lg text-gray-600 mt-2">All Food Orders Summary</p>
                            <p className="text-sm text-gray-500 mt-1">Date: {new Date().toLocaleDateString('en-IN')}</p>
                            <p className="text-sm text-gray-500">Property: {user.property || 'All Properties'}</p>
                        </div>

                        {/* Orders List */}
                        <div className="space-y-8">
                            {orders.filter(order => roomFilter === 'All' || order.roomNumber === roomFilter).map((order, idx) => (
                                <div key={order._id} className="border-2 border-gray-200 rounded-xl p-6 break-inside-avoid">
                                    {/* Order Header */}
                                    <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900">Order #{idx + 1}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{new Date(order.orderDate).toLocaleDateString('en-IN')}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded text-xs font-bold ${
                                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                            order.status === 'Accepted' ? 'bg-blue-100 text-blue-700' :
                                            order.status === 'Preparing' ? 'bg-purple-100 text-purple-700' :
                                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    {/* Room & Guest Info */}
                                    <div className="grid grid-cols-3 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase">Room</p>
                                            <p className="text-lg font-black text-gray-900">{order.roomNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase">Guest</p>
                                            <p className="text-sm font-bold text-gray-900">{order.guestName}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase">Property</p>
                                            <p className="text-sm font-bold text-gray-700">{order.property}</p>
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <table className="w-full mb-4">
                                        <thead>
                                            <tr className="bg-gray-100 text-xs">
                                                <th className="py-2 px-3 text-left font-bold text-gray-600">Item</th>
                                                <th className="py-2 px-3 text-center font-bold text-gray-600">Price</th>
                                                <th className="py-2 px-3 text-center font-bold text-gray-600">Qty</th>
                                                <th className="py-2 px-3 text-right font-bold text-gray-600">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items.map((item, i) => (
                                                <tr key={i} className="border-b border-gray-100">
                                                    <td className="py-2 px-3 text-sm">{item.name}</td>
                                                    <td className="py-2 px-3 text-center text-sm">₹{item.price}</td>
                                                    <td className="py-2 px-3 text-center text-sm">{item.quantity}</td>
                                                    <td className="py-2 px-3 text-right font-bold text-sm">₹{item.amount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Total */}
                                    <div className="flex justify-end pt-2 border-t border-gray-200">
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 uppercase font-bold">Order Total</p>
                                            <p className="text-xl font-black text-[#D4AF37]">₹{order.totalAmount}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Grand Total */}
                        <div className="mt-8 border-t-4 border-gray-300 pt-6">
                            <div className="flex justify-between items-center bg-gray-100 p-6 rounded-xl">
                                <span className="text-2xl font-black text-gray-900 uppercase">Grand Total</span>
                                <span className="text-3xl font-black text-[#D4AF37]">
                                    ₹{orders.filter(order => roomFilter === 'All' || order.roomNumber === roomFilter)
                                        .reduce((sum, order) => sum + order.totalAmount, 0)}
                                </span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 text-center text-xs text-gray-400 border-t border-gray-200 pt-4">
                            <p>This is a computer generated summary.</p>
                            <p className="mt-1">Total Orders: {orders.filter(order => roomFilter === 'All' || order.roomNumber === roomFilter).length}</p>
                        </div>

                        {/* Close Button - Hidden on print */}
                        <div className="mt-6 text-center print:hidden p-4 bg-gray-50 border-t">
                            <button
                                onClick={() => setShowAllOrdersPrint(false)}
                                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold cursor-pointer hover:bg-gray-800"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            </div>
                </>
            )}

            {/* Payment Modal */}
            {showPaymentModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 w-full max-w-md">
                        <h3 className="text-2xl font-bold mb-6">Record Payment</h3>
                        
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-sm text-gray-600">Room: <span className="font-bold text-gray-900">{selectedOrder.roomNumber}</span></p>
                                <p className="text-sm text-gray-600">Guest: <span className="font-bold text-gray-900">{selectedOrder.guestName}</span></p>
                                <p className="text-sm text-gray-600 mt-2">Order Amount: <span className="font-bold text-[#D4AF37] text-lg">₹{selectedOrder.totalAmount}</span></p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-700">Payment Amount</label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                                    placeholder="Enter amount"
                                />
                                <p className="text-xs text-gray-500 mt-1">This will be added to the booking's advance payment</p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handlePaymentSubmit}
                                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold cursor-pointer hover:bg-green-700"
                                >
                                    Record Payment
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setPaymentAmount('');
                                    }}
                                    className="flex-1 bg-gray-200 py-3 rounded-xl font-bold cursor-pointer hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Room Payment Modal */}
            {showRoomPayModal && selectedRoomForPay && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 w-full max-w-lg">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <FaCreditCard className="text-emerald-500" /> Pay All Orders - Room {selectedRoomForPay.roomNumber}
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-sm text-gray-600 mb-2">Total Orders: <span className="font-bold text-gray-900">{selectedRoomForPay.orders.length}</span></p>
                                <div className="space-y-1 mb-3">
                                    {selectedRoomForPay.orders.map((order, idx) => (
                                        <div key={order._id} className="text-xs text-gray-600">
                                            Order {idx + 1}: ₹{order.totalAmount} ({order.items.length} items)
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-gray-200 pt-3 mt-3">
                                    <p className="text-lg font-black text-emerald-600">Total Amount: ₹{selectedRoomForPay.totalAmount}</p>
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

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <p className="text-xs text-amber-800 font-medium">
                                    {paymentMethod === 'Cash' 
                                        ? '💵 Cash payment will be recorded immediately'
                                        : '💳 You will be redirected to payment gateway'}
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={processRoomPayment}
                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-bold cursor-pointer hover:shadow-lg transition-all"
                                >
                                    {paymentMethod === 'Cash' ? 'Record Cash Payment' : 'Proceed to Payment'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowRoomPayModal(false);
                                        setSelectedRoomForPay(null);
                                        setPaymentMethod('Cash');
                                    }}
                                    className="flex-1 bg-gray-200 py-4 rounded-xl font-bold cursor-pointer hover:bg-gray-300 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Global Print Styles */}
            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                    * {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #all-orders-print,
                    #all-orders-print *,
                    #order-bill-content,
                    #order-bill-content * {
                        visibility: visible;
                    }
                    #all-orders-print,
                    #order-bill-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </motion.div>
    );
};

export default FoodStock;
