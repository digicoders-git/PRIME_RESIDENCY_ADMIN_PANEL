import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaArrowLeft, FaCalendarAlt, FaUser, FaEnvelope, FaPhone,
    FaUsers, FaBed, FaCreditCard, FaCheckCircle, FaRupeeSign,
    FaClock, FaInfoCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const CreateBooking = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);

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
        source: 'Dashboard'
    });

    const [calc, setCalc] = useState({
        nights: 0,
        totalAmount: 0,
        balance: 0
    });

    // Mock data - same as Rooms.jsx
    const initialRooms = [
        { id: 1, name: 'Classic Room', price: 3500, roomNumber: '201' },
        { id: 2, name: 'Deluxe Suite', price: 6500, roomNumber: 'A-501' },
        { id: 3, name: 'Presidential Suite', price: 15000, roomNumber: 'PH-01' },
        { id: 4, name: 'Family Suite', price: 10500, roomNumber: 'G-301' },
        { id: 5, name: 'Executive Room', price: 8000, roomNumber: 'E-401' },
        { id: 6, name: 'Garden Room', price: 4200, roomNumber: 'G-101' },
    ];

    useEffect(() => {
        if (roomId) {
            // Find room by ID
            let foundRoom = initialRooms.find(r => r.id === parseInt(roomId));

            if (!foundRoom) {
                const savedRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
                foundRoom = savedRooms.find(r => r.id === parseInt(roomId));
            }

            if (foundRoom) {
                // Ensure price is numeric
                const numericPrice = typeof foundRoom.price === 'string'
                    ? parseInt(foundRoom.price.replace(/,/g, ''))
                    : foundRoom.price;
                setRoom({ ...foundRoom, numericPrice });
            }
        }
    }, [roomId]);

    const handleRoomChange = (e) => {
        const selectedId = parseInt(e.target.value);
        const allRooms = [...initialRooms, ...JSON.parse(localStorage.getItem('rooms') || '[]')];
        const found = allRooms.find(r => r.id === selectedId);
        if (found) {
            const numericPrice = typeof found.price === 'string'
                ? parseInt(found.price.replace(/,/g, ''))
                : found.price;
            setRoom({ ...found, numericPrice });
        }
    };

    useEffect(() => {
        if (formData.checkIn && formData.checkOut && room) {
            const start = new Date(formData.checkIn);
            const end = new Date(formData.checkOut);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const total = diffDays * room.numericPrice;
            const advanceVal = parseInt(formData.advance) || 0;

            setCalc({
                nights: diffDays > 0 ? diffDays : 0,
                totalAmount: total > 0 ? total : 0,
                balance: (total - advanceVal) > 0 ? (total - advanceVal) : 0
            });
        }
    }, [formData.checkIn, formData.checkOut, formData.advance, room]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!room) {
            toast.error('Please select a room first');
            return;
        }

        if (calc.nights <= 0) {
            toast.error('Please select valid check-in and check-out dates.');
            return;
        }

        const newBooking = {
            id: `BK${Date.now().toString().slice(-4)}`,
            ...formData,
            room: room.name,
            roomNumber: room.roomNumber || 'N/A',
            amount: calc.totalAmount,
            balance: calc.balance,
            nights: calc.nights,
            bookingDate: new Date().toISOString().split('T')[0],
            status: 'Confirmed'
        };

        // Store in localStorage (for demo/persistence)
        const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        localStorage.setItem('bookings', JSON.stringify([...existingBookings, newBooking]));

        toast.success('Room booked successfully!');
        navigate('/bookings');
    };

    if (roomId && !room) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
                <p className="mt-4 text-gray-600">Preparing booking form...</p>
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
                        <p className="text-gray-500 text-sm font-medium italic">#{room.name} — Unit {room.roomNumber}</p>
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
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                        <FaBed size={14} />
                                    </div>
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Select Room</h3>
                                </div>
                                <select
                                    onChange={handleRoomChange}
                                    defaultValue=""
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:bg-white outline-none transition-all font-bold text-gray-800"
                                >
                                    <option value="" disabled>Choose a room for booking...</option>
                                    {[...initialRooms, ...JSON.parse(localStorage.getItem('rooms') || '[]')].map(r => (
                                        <option key={r.id} value={r.id}>{r.name} - ₹{r.price} (Unit {r.roomNumber})</option>
                                    ))}
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
                                className="w-full py-5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.01] transition-all cursor-pointer mt-4"
                            >
                                Confirm and Create Booking
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

                            <div className="bg-gray-50/50 p-6 rounded-3xl space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Total Amount</p>
                                    <p className="text-xl font-black text-gray-900 italic">₹{calc.totalAmount.toLocaleString()}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">Advance Payment (₹)</label>
                                    <input
                                        type="number"
                                        name="advance"
                                        value={formData.advance}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl outline-none font-bold text-sm"
                                    />
                                </div>
                                <div className="flex justify-between items-center text-rose-600 pt-2 border-t border-gray-200/50">
                                    <p className="text-[11px] font-black uppercase tracking-widest">Balance Due</p>
                                    <p className="text-xl font-black italic underline ring-offset-2">₹{calc.balance.toLocaleString()}</p>
                                </div>
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
        </motion.div>
    );
};

export default CreateBooking;
