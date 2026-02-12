import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { FaBath, FaMugHot, FaParking, FaSnowflake, FaTv, FaWifi, FaArrowLeft, FaEdit, FaCheckCircle, FaExclamationTriangle, FaTools, FaHistory, FaExpand, FaUsers, FaBed, FaBuilding } from 'react-icons/fa';
import { motion } from 'framer-motion';

const RoomDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [recentBookings, setRecentBookings] = useState([]);

    useEffect(() => {
        fetchRoomDetails();
    }, [id]);

    const fetchRoomDetails = async () => {
        try {
            const { data } = await api.get(`/rooms/by-number/${id}`);
            if (data.success) {
                const r = data.data;
                console.log('Room data from API:', r); // Debug log

                // Set recent bookings
                if (r.recentBookings && r.recentBookings.length > 0) {
                    setRecentBookings(r.recentBookings);
                }

                // Map backend data to UI structure
                setRoom({
                    id: r._id,
                    name: r.name || 'Unit Details',
                    category: r.category || 'Room',
                    type: r.type || 'Standard',
                    price: r.price ? r.price.toLocaleString() : '5000',
                    totalPrice: (r.enableExtraCharges && r.totalPrice) ? r.totalPrice.toLocaleString() : null,
                    enableExtraCharges: r.enableExtraCharges || false,
                    discount: r.discount || 0,
                    extraBedPrice: r.extraBedPrice || 0,
                    taxGST: r.taxGST || 0,
                    status: r.status || 'Available',
                    image: r.image || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=60&w=800',
                    desc: r.description || 'No description available',
                    size: r.roomSize || 'N/A',
                    guests: (r.maxAdults || r.maxChildren) ? `${r.maxAdults} Adults, ${r.maxChildren} Children` : 'N/A',
                    bed: r.bedType || 'N/A',
                    location: r.floorNumber || 'N/A',
                    roomNumber: r.roomNumber || id,
                    amenities: r.amenities || []
                });
            }
        } catch (error) {
            toast.error('Failed to load room details');
            navigate('/rooms');
        }
    };

    if (!room) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
                <p className="mt-4 text-gray-600">Loading room details...</p>
            </div>
        );
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Available': return <FaCheckCircle className="text-emerald-500" />;
            case 'Occupied': return <FaExclamationTriangle className="text-rose-500" />;
            case 'Maintenance': return <FaTools className="text-amber-500" />;
            default: return null;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Available': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Occupied': return 'bg-rose-50 text-rose-700 border-rose-100';
            case 'Maintenance': return 'bg-amber-50 text-amber-700 border-amber-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    const amenities = [
        { icon: <FaWifi />, label: 'Free Wi-Fi' },
        { icon: <FaTv />, label: 'Smart TV' },
        { icon: <FaSnowflake />, label: 'Air Conditioning' },
        { icon: <FaMugHot />, label: 'Coffee Maker' },
        { icon: <FaBath />, label: 'Premium Bath' },
        { icon: <FaParking />, label: 'Free Parking' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen w-full overflow-x-hidden"
        >
            <div className="max-w-full px-4 sm:px-6 lg:px-8 space-y-8 pb-12">
                {/* Top Navigation */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                    <button
                        onClick={() => navigate('/rooms')}
                        className="flex items-center text-gray-600 hover:text-[#D4AF37] transition-colors font-medium cursor-pointer group text-sm sm:text-base"
                    >
                        <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        <span className="truncate">Back to Rooms List</span>
                    </button>
                    <button className="flex items-center px-3 py-2 sm:px-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all text-gray-700 font-medium cursor-pointer text-sm sm:text-base">
                        <FaEdit className="mr-2 text-amber-500" />
                        <span className="truncate">Edit Details</span>
                    </button>
                </div>

                <div className="w-full">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-10 w-full">

                        {/* Left Column - Image & Overview */}
                        <div className="xl:col-span-2 space-y-6 lg:space-y-10 min-w-0">

                            <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 w-full">
                                <div className="relative h-[300px] sm:h-[400px] w-full">
                                    <img
                                        src={room.image}
                                        alt={room.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 text-white">
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                            <span className="px-2 py-1 sm:px-3 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-white/20 backdrop-blur-md bg-white/10">
                                                {room.category}
                                            </span>
                                            <span className={`flex items-center gap-1.5 px-2 py-1 sm:px-3 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${room.status === 'Available' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                                                room.status === 'Occupied' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                                                    'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                                }`}>
                                                {room.status}
                                            </span>
                                        </div>
                                        <h1 className="text-2xl sm:text-4xl font-bold mb-1 tracking-tight truncate">{room.name}</h1>
                                        <p className="text-white/80 font-medium text-sm sm:text-base">{room.category} #{room.roomNumber}</p>
                                    </div>
                                </div>

                                <div className="p-4 sm:p-8 w-full">
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Description</h2>
                                    <p className="text-gray-600 leading-relaxed text-base sm:text-lg break-words">
                                        {room.desc}
                                    </p>

                                    <div className="mt-8 sm:mt-10">
                                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 font-primary">Premium Amenities</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-8 w-full">

                                            {amenities.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-[#D4AF37]/30 transition-all group min-w-0">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform flex-shrink-0">
                                                        {item.icon}
                                                    </div>
                                                    <span className="text-xs sm:text-sm font-bold text-gray-700 tracking-tight truncate">{item.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* History / Recent Bookings */}
                            <div className="bg-white mt-4 rounded-[2rem] shadow-sm border border-gray-100 p-4 sm:p-8 w-full">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <FaHistory className="text-[#D4AF37]" />
                                        Recent Activity
                                    </h2>
                                </div>
                                <div className="space-y-3 sm:space-y-4">
                                    {recentBookings.length > 0 ? (
                                        recentBookings.map((booking) => (
                                            <div key={booking._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-2xl bg-gray-50 transition-colors hover:bg-gray-100/80 gap-3 sm:gap-0">
                                                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                                                        {booking.guest?.name ? booking.guest.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'NA'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-gray-800 text-xs sm:text-sm truncate">{booking.guest?.name || 'Guest'}</p>
                                                        <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium">
                                                            {new Date(booking.checkIn).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(booking.checkOut).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 sm:px-3 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest self-start sm:self-auto ${booking.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                                                    booking.status === 'Checked-in' ? 'bg-green-100 text-green-700' :
                                                        booking.status === 'Checked-out' ? 'bg-emerald-100 text-emerald-700' :
                                                            booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-400">
                                            <FaHistory className="mx-auto text-4xl mb-3 opacity-30" />
                                            <p className="text-sm">No recent bookings for this room</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Specs & Location */}
                        <div className="space-y-6 lg:space-y-10 min-w-0">

                            {/* Price Card */}
                            <div className="bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-[2rem] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden w-full">
                                <div className="relative z-10">
                                    <p className="text-white/80 font-black uppercase tracking-[0.2em] text-[9px] sm:text-[10px] mb-2">Price Per Night</p>
                                    <div className="flex items-baseline gap-1 flex-wrap">
                                        <span className="text-2xl sm:text-4xl font-bold italic">₹{room.price}</span>
                                        <span className="text-white/70 font-medium text-sm sm:text-base">/ night</span>
                                    </div>

                                    {room.enableExtraCharges && room.totalPrice && (
                                        <div className="mt-4 pt-4 border-t border-white/20">
                                            <p className="text-white/80 font-black uppercase tracking-[0.2em] text-[9px] sm:text-[10px] mb-2">Total Price (with all charges)</p>
                                            <div className="flex items-baseline gap-1 flex-wrap">
                                                <span className="text-xl sm:text-3xl font-bold italic">₹{room.totalPrice}</span>
                                                <span className="text-white/70 font-medium text-xs sm:text-sm">/ night</span>
                                            </div>
                                            {(room.discount > 0 || room.extraBedPrice > 0 || room.taxGST > 0) && (
                                                <div className="mt-3 space-y-1 text-xs text-white/70">
                                                    {room.discount > 0 && <p>• Discount: {room.discount}%</p>}
                                                    {room.extraBedPrice > 0 && <p>• Extra Bed: ₹{room.extraBedPrice}</p>}
                                                    {room.taxGST > 0 && <p>• Tax/GST: {room.taxGST}%</p>}
                                                </div>
                                            )}
                                            <p className="text-xs text-white/60 mt-2 italic">* This price will be used for bookings</p>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => navigate(`/create-booking/${room.id}`)}
                                        className="w-full mt-4 sm:mt-6 py-3 sm:py-4 bg-white text-[#B8860B] rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-[11px] shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer"
                                    >
                                        Book This {room.category} Now
                                    </button>
                                </div>
                                {/* Abstract Shapes */}
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
                            </div>

                            {/* Quick Stats */}
                            <div className="bg-white mt-4 rounded-[2rem] shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6 sm:space-y-8 w-full">
                                <h3 className="font-black uppercase tracking-[0.2em] text-[10px] sm:text-[11px] text-gray-400">{room.category} Specification</h3>

                                <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                        <FaExpand size={16} className="sm:w-5 sm:h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total Space</p>
                                        <p className="font-bold text-gray-900 tracking-tight text-sm sm:text-base truncate">{room.size}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                                        <FaUsers size={16} className="sm:w-5 sm:h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Max Occupancy</p>
                                        <p className="font-bold text-gray-900 tracking-tight text-sm sm:text-base truncate">{room.guests}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                                        <FaBed size={16} className="sm:w-5 sm:h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Bed Configuration</p>
                                        <p className="font-bold text-gray-900 tracking-tight text-sm sm:text-base truncate">{room.bed}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                                        <FaBuilding size={16} className="sm:w-5 sm:h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Location</p>
                                        <p className="font-bold text-gray-900 tracking-tight text-sm sm:text-base truncate">{room.location}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default RoomDetail;
