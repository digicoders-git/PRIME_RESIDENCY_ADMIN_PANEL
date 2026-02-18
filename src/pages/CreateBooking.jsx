import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaArrowLeft, FaCalendarAlt, FaUser, FaEnvelope, FaPhone,
    FaUsers, FaBed, FaCreditCard, FaCheckCircle, FaRupeeSign,
    FaClock, FaInfoCircle, FaIdCard, FaImage
} from 'react-icons/fa';
import { toast } from 'react-toastify';

import api from '../api/api';
import { createRazorpayOrder, initiatePayment } from '../utils/payment';

const ID_LIMITS = {
    'Aadhar Card': 12,
    'PAN Card': 10,
    'Driving License': 16,
    'Voter ID': 10,
    'Passport': 9
};

const CreateBooking = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [rooms, setRooms] = useState([]); // State for all rooms for dropdown
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [bookingId, setBookingId] = useState(null);
    const [filterCategory, setFilterCategory] = useState('All');

    const [formData, setFormData] = useState({
        guest: '',
        email: '',
        phone: '',
        checkIn: '',
        checkOut: '',
        adults: '1',
        children: '0',
        advance: '0',
        specialRequests: '',
        paymentStatus: 'Pending',
        source: 'Dashboard',
        idType: 'Aadhar Card',
        idNumber: '',
        paymentType: 'cash',
        discount: '0',
        extraBedPrice: '0',
        taxGST: '0'
    });

    const [calc, setCalc] = useState({
        nights: 0,
        baseAmount: 0,
        totalAmount: 0,
        balance: 0
    });

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async (propName = null) => {
        try {
            // If Admin, they can filter by property. If Manager, backend handle it.
            const queryProp = propName || (user.role === 'Manager' ? user.property : null);
            const params = queryProp ? { property: queryProp } : {};

            const { data } = await api.get('/rooms', { params });
            if (data.success) {
                const fetchedRooms = data.data.map(r => {
                    // Auto-enable charges if discount, tax, or extraBed exists
                    const shouldEnableCharges = r.enableExtraCharges || !!(r.discount || r.extraBedPrice || r.taxGST);

                    return {
                        ...r,
                        id: r._id,
                        numericPrice: Number(r.price),
                        enableExtraCharges: shouldEnableCharges,
                        discount: r.discount || 0,
                        extraBedPrice: r.extraBedPrice || 0,
                        taxGST: r.taxGST || 0
                    };
                });
                setRooms(fetchedRooms);

                if (roomId) {
                    const found = fetchedRooms.find(r => r.id === roomId);
                    if (found) {
                        setRoom(found);
                        // Populate form data with room defaults
                        setFormData(prev => ({
                            ...prev,
                            discount: found.discount?.toString() || '0',
                            extraBedPrice: found.extraBedPrice?.toString() || '0',
                            taxGST: found.taxGST?.toString() || '0'
                        }));
                    }
                }
            }
        } catch (error) {
            toast.error('Failed to fetch rooms');
        } finally {
            setLoading(false);
        }
    };

    const [user, setUser] = useState({ role: 'Admin', property: '' });
    const [selectedProperty, setSelectedProperty] = useState('');

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);
        if (userData.property) {
            setSelectedProperty(userData.property);
        }
    }, []);

    useEffect(() => {
        if (user.role) {
            fetchRooms(selectedProperty);
        }
    }, [selectedProperty, user.role]);

    const handleRoomChange = (e) => {
        const selectedId = e.target.value;
        const found = rooms.find(r => r.id === selectedId);
        if (found) {
            setRoom(found);
            if (found.enableExtraCharges) {
                setFormData(prev => ({
                    ...prev,
                    discount: found.discount?.toString() || '0',
                    extraBedPrice: found.extraBedPrice?.toString() || '0',
                    taxGST: found.taxGST?.toString() || '0'
                }));
            }
        }
    };

    useEffect(() => {
        if (formData.checkIn && formData.checkOut && room) {
            const start = new Date(formData.checkIn);
            const end = new Date(formData.checkOut);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const baseTotal = diffDays * room.numericPrice;

            // Calculate with charges if enabled
            let finalTotal = baseTotal;
            if (room.enableExtraCharges) {
                const discount = parseFloat(formData.discount) || 0;
                const extraBed = parseFloat(formData.extraBedPrice) || 0;
                const tax = parseFloat(formData.taxGST) || 0;

                // Per night calculation: (price + extraBed) - discount + tax
                const pricePerNight = room.numericPrice;
                const subtotal = pricePerNight + extraBed;
                const afterDiscount = subtotal - (subtotal * discount / 100);
                const taxAmount = afterDiscount * tax / 100;
                const finalPricePerNight = Math.round(afterDiscount + taxAmount);

                finalTotal = finalPricePerNight * diffDays;
            }

            const advanceVal = parseInt(formData.advance) || 0;

            setCalc({
                nights: diffDays > 0 ? diffDays : 0,
                baseAmount: baseTotal > 0 ? baseTotal : 0,
                totalAmount: finalTotal > 0 ? finalTotal : 0,
                balance: (finalTotal - advanceVal) > 0 ? (finalTotal - advanceVal) : 0
            });
        }
    }, [formData.checkIn, formData.checkOut, formData.advance, formData.discount, formData.extraBedPrice, formData.taxGST, room]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'idType') {
            const newLimit = ID_LIMITS[value] || 20;
            // Truncate current number if it exceeds new limit
            const currentNumber = formData.idNumber;
            const newNumber = currentNumber.length > newLimit ? currentNumber.slice(0, newLimit) : currentNumber;

            setFormData(prev => ({
                ...prev,
                [name]: value,
                idNumber: newNumber
            }));
            return;
        }

        if (name === 'idNumber') {
            const limit = ID_LIMITS[formData.idType] || 20;
            if (value.length > limit) return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!room) {
            toast.error('Please select a room first');
            return;
        }

        if (!formData.idNumber) {
            toast.error('Please enter ID number');
            return;
        }

        if (calc.nights <= 0) {
            toast.error('Please select valid check-in and check-out dates.');
            return;
        }

        setSubmitting(true);

        try {
            if (formData.paymentType === 'cash') {
                const dataToSend = new FormData();
                dataToSend.append('guest', formData.guest);
                dataToSend.append('email', formData.email);
                dataToSend.append('phone', formData.phone);
                dataToSend.append('room', room.name);
                dataToSend.append('roomNumber', room?.roomNumber?.toString() || 'N/A');
                dataToSend.append('checkIn', formData.checkIn);
                dataToSend.append('checkOut', formData.checkOut);
                dataToSend.append('adults', formData.adults);
                dataToSend.append('children', formData.children);
                dataToSend.append('amount', calc.totalAmount);
                dataToSend.append('advance', formData.advance);
                dataToSend.append('balance', Math.max(0, calc.totalAmount - Number(formData.advance)));
                dataToSend.append('nights', calc.nights);
                dataToSend.append('status', 'Confirmed');
                dataToSend.append('paymentStatus', Number(formData.advance) >= calc.totalAmount ? 'Paid' :
                    Number(formData.advance) > 0 ? 'Partial' : 'Pending');
                dataToSend.append('source', 'Dashboard');
                dataToSend.append('specialRequests', formData.specialRequests);
                dataToSend.append('idType', formData.idType);
                dataToSend.append('idNumber', formData.idNumber);
                dataToSend.append('extraBed', Number(formData.extraBedPrice) > 0);
                dataToSend.append('property', room.property);

                if (formData.idFrontImage) dataToSend.append('idFrontImage', formData.idFrontImage);
                if (formData.idBackImage) dataToSend.append('idBackImage', formData.idBackImage);

                console.log('Creating Cash booking...');
                const { data } = await api.post('/bookings', dataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (data.success) {
                    toast.success('Booking created successfully!');
                    navigate('/bookings');
                }
            } else {
                // For Online payments, show modal first
                setShowPaymentModal(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create booking');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePayment = async () => {
        try {
            const orderData = await createRazorpayOrder(
                calc.totalAmount,
                `desk_temp_${Date.now()}`
            );

            if (orderData.success) {
                const bookingData = {
                    guest: formData.guest,
                    email: formData.email,
                    phone: formData.phone
                };

                await initiatePayment(
                    orderData.data,
                    bookingData,
                    async (result) => {
                        console.log('Payment successful. Creating booking now...');
                        try {
                            const dataToSend = new FormData();
                            dataToSend.append('guest', formData.guest);
                            dataToSend.append('email', formData.email);
                            dataToSend.append('phone', formData.phone);
                            dataToSend.append('room', room.name);
                            dataToSend.append('roomNumber', room?.roomNumber?.toString() || 'N/A');
                            dataToSend.append('checkIn', formData.checkIn);
                            dataToSend.append('checkOut', formData.checkOut);
                            dataToSend.append('adults', formData.adults);
                            dataToSend.append('children', formData.children);
                            dataToSend.append('amount', calc.totalAmount);
                            dataToSend.append('advance', calc.totalAmount);
                            dataToSend.append('balance', 0);
                            dataToSend.append('nights', calc.nights);
                            dataToSend.append('status', 'Confirmed');
                            dataToSend.append('paymentStatus', 'Paid');
                            dataToSend.append('source', 'Dashboard');
                            dataToSend.append('specialRequests', formData.specialRequests);
                            dataToSend.append('idType', formData.idType);
                            dataToSend.append('idNumber', formData.idNumber);
                            dataToSend.append('extraBed', Number(formData.extraBedPrice) > 0);
                            dataToSend.append('property', room.property);
                            dataToSend.append('razorpayOrderId', result.razorpay_order_id);
                            dataToSend.append('razorpayPaymentId', result.razorpay_payment_id);

                            if (formData.idFrontImage) dataToSend.append('idFrontImage', formData.idFrontImage);
                            if (formData.idBackImage) dataToSend.append('idBackImage', formData.idBackImage);

                            const { data } = await api.post('/bookings', dataToSend, {
                                headers: { 'Content-Type': 'multipart/form-data' }
                            });

                            if (data.success) {
                                toast.success('Payment successful! Booking confirmed.');
                                setShowPaymentModal(false);
                                navigate('/bookings');
                            }
                        } catch (createError) {
                            console.error('Booking creation error after payment:', createError);
                            toast.error('Payment success but booking failed. Please contact support with Payment ID: ' + result.razorpay_payment_id);
                        }
                    },
                    (error) => {
                        toast.error(error);
                    }
                );
            }
        } catch (error) {
            toast.error('Failed to initiate payment');
        }
    };

    const handleBookingOnly = async () => {
        setSubmitting(true);
        try {
            const dataToSend = new FormData();
            dataToSend.append('guest', formData.guest);
            dataToSend.append('email', formData.email);
            dataToSend.append('phone', formData.phone);
            dataToSend.append('room', room.name);
            dataToSend.append('roomNumber', room?.roomNumber?.toString() || 'N/A');
            dataToSend.append('checkIn', formData.checkIn);
            dataToSend.append('checkOut', formData.checkOut);
            dataToSend.append('adults', formData.adults);
            dataToSend.append('children', formData.children);
            dataToSend.append('amount', calc.totalAmount);
            dataToSend.append('advance', 0);
            dataToSend.append('balance', calc.totalAmount);
            dataToSend.append('nights', calc.nights);
            dataToSend.append('status', 'Confirmed');
            dataToSend.append('paymentStatus', 'Pending');
            dataToSend.append('source', 'Dashboard');
            dataToSend.append('specialRequests', formData.specialRequests);
            dataToSend.append('idType', formData.idType);
            dataToSend.append('idNumber', formData.idNumber);
            dataToSend.append('extraBed', Number(formData.extraBedPrice) > 0);
            dataToSend.append('property', room.property);

            if (formData.idFrontImage) dataToSend.append('idFrontImage', formData.idFrontImage);
            if (formData.idBackImage) dataToSend.append('idBackImage', formData.idBackImage);

            const { data } = await api.post('/bookings', dataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.success) {
                toast.success('Room booked successfully (Payment Pending)!');
                setShowPaymentModal(false);
                navigate('/bookings');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create booking');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
                <p className="mt-4 text-gray-600">Loading booking form...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto space-y-10 pb-12"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-[#D4AF37] transition-colors font-medium cursor-pointer group"
                >
                    <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>
                <div className="text-right">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">New Reservation</h1>
                    {room ? (
                        <p className="text-gray-500 text-sm font-medium italic">#{room.name} — Unit {String(room.roomNumber || 'N/A')} ({room.property})</p>
                    ) : (
                        <p className="text-gray-500 text-sm font-medium italic">Please select a room to continue</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Form Column */}
                <div className="lg:col-span-2">
                    <div className="space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
                        {/* Room Selection (Standalone for no-param flow) */}
                        {!roomId && (
                            <div className="space-y-6 pb-8 border-b border-gray-50">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                                <FaBed size={14} />
                                            </div>
                                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Select Unit</h3>
                                        </div>

                                        {/* Property Selector for Admins */}
                                        {user.role === 'Admin' && (
                                            <div className="relative">
                                                <select
                                                    value={selectedProperty}
                                                    onChange={(e) => setSelectedProperty(e.target.value)}
                                                    className="pl-3 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-[#D4AF37] appearance-none cursor-pointer"
                                                >
                                                    <option value="">All Properties</option>
                                                    <option value="Prime Residency">Prime Residency</option>
                                                    <option value="Prem Kunj">Prem Kunj</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {['All', 'Room', 'Banquet', 'Lawn'].map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setFilterCategory(cat)}
                                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${filterCategory === cat
                                                    ? 'bg-[#D4AF37] text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <select
                                    onChange={handleRoomChange}
                                    defaultValue=""
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:bg-white outline-none transition-all font-bold text-gray-800"
                                >
                                    <option value="" disabled>Choose a unit for booking...</option>
                                    {rooms
                                        .filter(r => filterCategory === 'All' || r.category === filterCategory)
                                        .map(r => (
                                            <option key={r.id} value={r.id}>
                                                [{r.category}] {r.name} - ₹{r.price} (Unit {String(r.roomNumber || 'N/A')}) - {r.property}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Guest Info Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                        <FaUser size={14} />
                                    </div>
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Guest Information</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            name="guest"
                                            value={formData.guest}
                                            onChange={handleInputChange}
                                            placeholder="Enter guest name"
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:bg-white outline-none transition-all font-bold text-gray-800"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Contact Number</label>
                                        <input
                                            required
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+91 00000 00000"
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:bg-white outline-none transition-all font-bold text-gray-800"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="guest@example.com"
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:bg-white outline-none transition-all font-bold text-gray-800"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ID Details Section */}
                            <div className="space-y-6 pt-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                        <FaIdCard size={14} />
                                    </div>
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">ID Details</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">ID Type</label>
                                        <select
                                            name="idType"
                                            value={formData.idType}
                                            onChange={handleInputChange}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:bg-white outline-none transition-all font-bold text-gray-800"
                                        >
                                            <option value="Aadhar Card">Aadhar Card</option>
                                            <option value="PAN Card">PAN Card</option>
                                            <option value="Passport">Passport</option>
                                            <option value="Driving License">Driving License</option>
                                            <option value="Voter ID">Voter ID</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">
                                            ID Number {formData.idType && ID_LIMITS[formData.idType] ? `(Max ${ID_LIMITS[formData.idType]} chars)` : ''}
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            name="idNumber"
                                            value={formData.idNumber}
                                            onChange={handleInputChange}
                                            maxLength={ID_LIMITS[formData.idType] || 20}
                                            placeholder={`Enter ${formData.idType} Number`}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:bg-white outline-none transition-all font-bold text-gray-800"
                                        />
                                    </div>

                                    {/* Image Uploads */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">ID Card (Front)</label>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setFormData(prev => ({ ...prev, idFrontImage: e.target.files[0] }))}
                                                className="hidden"
                                                id="idFront"
                                            />
                                            <label
                                                htmlFor="idFront"
                                                className="flex items-center justify-between w-full px-5 py-4 bg-gray-50 border border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-[#D4AF37] hover:bg-amber-50/30 transition-all font-bold text-gray-800"
                                            >
                                                <span className="text-xs truncate max-w-[150px]">
                                                    {formData.idFrontImage ? formData.idFrontImage.name : 'Choose Front Photo'}
                                                </span>
                                                <FaImage className="text-gray-400 group-hover:text-[#D4AF37]" />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">ID Card (Back)</label>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setFormData(prev => ({ ...prev, idBackImage: e.target.files[0] }))}
                                                className="hidden"
                                                id="idBack"
                                            />
                                            <label
                                                htmlFor="idBack"
                                                className="flex items-center justify-between w-full px-5 py-4 bg-gray-50 border border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-[#D4AF37] hover:bg-amber-50/30 transition-all font-bold text-gray-800"
                                            >
                                                <span className="text-xs truncate max-w-[150px]">
                                                    {formData.idBackImage ? formData.idBackImage.name : 'Choose Back Photo'}
                                                </span>
                                                <FaImage className="text-gray-400 group-hover:text-[#D4AF37]" />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stay Details Section */}
                            <div className="space-y-6 pt-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <FaCalendarAlt size={14} />
                                    </div>
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Stay Period</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Check-In Date</label>
                                        <input
                                            required
                                            type="date"
                                            name="checkIn"
                                            value={formData.checkIn}
                                            onChange={handleInputChange}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:bg-white outline-none transition-all font-bold text-gray-800"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Check-Out Date</label>
                                        <input
                                            required
                                            type="date"
                                            name="checkOut"
                                            value={formData.checkOut}
                                            onChange={handleInputChange}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:bg-white outline-none transition-all font-bold text-gray-800"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Adults</label>
                                        <select
                                            name="adults"
                                            value={formData.adults}
                                            onChange={handleInputChange}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:bg-white outline-none transition-all font-bold text-gray-800"
                                        >
                                            {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} Member{n > 1 ? 's' : ''}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Children</label>
                                        <select
                                            name="children"
                                            value={formData.children}
                                            onChange={handleInputChange}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:bg-white outline-none transition-all font-bold text-gray-800"
                                        >
                                            {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n} Child{n !== 1 ? 'ren' : ''}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Section */}
                            <div className="space-y-6 pt-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                        <FaCreditCard size={14} />
                                    </div>
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Payment Details</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Payment Type</label>
                                        <select
                                            name="paymentType"
                                            value={formData.paymentType}
                                            onChange={handleInputChange}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:bg-white outline-none transition-all font-bold text-gray-800"
                                        >
                                            <option value="cash">Cash Payment</option>
                                            <option value="online">Online Payment</option>
                                        </select>
                                    </div>
                                    {formData.paymentType === 'cash' && (
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Cash Amount</label>
                                            <input
                                                type="number"
                                                name="advance"
                                                value={formData.advance}
                                                onChange={handleInputChange}
                                                max={calc.totalAmount}
                                                placeholder="Enter cash amount"
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:bg-white outline-none transition-all font-bold text-gray-800"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Special Requests */}
                            <div className="space-y-2 pt-4">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Special Requests (Optional)</label>
                                <textarea
                                    name="specialRequests"
                                    value={formData.specialRequests}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Any dietary preferences or special arrangements?"
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:bg-white outline-none transition-all font-bold text-gray-800 resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full py-5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.01] transition-all cursor-pointer mt-4 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {submitting ? 'Processing Booking...' : (formData.paymentType === 'online' ? 'Book & Pay Online' : 'Confirm Booking')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Totals / Summary Column */}
                <div className="space-y-10">
                    {/* Billing Overview */}
                    <div className={`bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden transition-opacity duration-300 ${!room ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <div className="bg-[#D4AF37] px-8 py-6 text-white">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em]">Billing Estimates</h3>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Rate / Night</p>
                                <p className="font-bold text-gray-900 italic">₹{room?.numericPrice?.toLocaleString() || '0'}</p>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Total Stay</p>
                                <p className="font-bold text-gray-900 italic">{calc.nights} Nights</p>
                            </div>

                            {room?.enableExtraCharges && (
                                <div className="space-y-4 pb-4 border-b border-gray-50">
                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Extra Charges (Editable)</p>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1">Discount (%)</label>
                                            <input
                                                type="number"
                                                name="discount"
                                                value={formData.discount}
                                                onChange={handleInputChange}
                                                min="0"
                                                max="100"
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1">Extra Bed (₹/night)</label>
                                            <input
                                                type="number"
                                                name="extraBedPrice"
                                                value={formData.extraBedPrice}
                                                onChange={handleInputChange}
                                                min="0"
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1">Tax/GST (%)</label>
                                            <input
                                                type="number"
                                                name="taxGST"
                                                value={formData.taxGST}
                                                onChange={handleInputChange}
                                                min="0"
                                                max="100"
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-gray-50/50 p-6 rounded-3xl space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{room?.enableExtraCharges ? 'Total (with charges)' : 'Total Amount'}</p>
                                    <p className="text-xl font-black text-gray-900 italic">₹{calc.totalAmount.toLocaleString()}</p>
                                </div>
                                {room?.enableExtraCharges && calc.baseAmount !== calc.totalAmount && (
                                    <div className="text-xs text-gray-500 italic">
                                        Base: ₹{calc.baseAmount.toLocaleString()}
                                    </div>
                                )}
                                {formData.paymentType === 'cash' && (
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">Advance Payment (₹)</label>
                                        <input
                                            type="number"
                                            name="advance"
                                            value={formData.advance}
                                            onChange={handleInputChange}
                                            min="0"
                                            max={calc.totalAmount}
                                            className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl outline-none font-bold text-sm"
                                        />
                                    </div>
                                )}
                                {formData.paymentType === 'cash' && (
                                    <div className="flex justify-between items-center text-rose-600 pt-2 border-t border-gray-200/50">
                                        <p className="text-[11px] font-black uppercase tracking-widest">Balance Due</p>
                                        <p className="text-xl font-black italic underline ring-offset-2">₹{calc.balance.toLocaleString()}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Info / Policies */}
                    <div className="bg-amber-50/50 rounded-[2.5rem] p-8 border border-amber-100 space-y-6">
                        <div className="flex items-center gap-3 text-amber-600">
                            <FaInfoCircle size={16} />
                            <h3 className="text-xs font-black uppercase tracking-widest">Policies</h3>
                        </div>
                        <ul className="space-y-4">
                            {[
                                'Standard check-in time is 12:00 PM.',
                                'Full refund for cancellations 24h prior.',
                                'Identity proof is required at check-in.',
                                'Taxes will be calculated at checkout.'
                            ].map((text, i) => (
                                <li key={i} className="flex gap-3 text-xs font-medium text-amber-800/80">
                                    <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></div>
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl"
                    >
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaCreditCard className="text-[#D4AF37] text-2xl" />
                            </div>
                            <h3 className="text-2xl font-bold text-black mb-2">Complete Booking</h3>
                            <p className="text-gray-600">Choose payment option</p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">Room:</span>
                                    <span className="font-semibold">{room?.name}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">Nights:</span>
                                    <span className="font-semibold">{calc.nights}</span>
                                </div>
                                <div className="flex justify-between items-center border-t pt-2">
                                    <span className="font-bold">Total Amount:</span>
                                    <span className="font-bold text-[#D4AF37] text-lg">₹{calc.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handlePayment}
                                className="w-full py-4 bg-[#D4AF37] text-white font-bold rounded-2xl hover:bg-[#B8860B] transition-all flex items-center justify-center gap-3"
                            >
                                <FaCreditCard />
                                Pay Now - ₹{calc.totalAmount.toLocaleString()}
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleBookingOnly}
                                className="w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                            >
                                Book Now, Pay Later
                            </motion.button>

                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="w-full py-3 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default CreateBooking;
