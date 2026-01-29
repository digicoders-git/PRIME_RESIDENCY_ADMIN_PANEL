import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaArrowLeft, FaBed, FaUsers, FaExpand, FaBuilding,
    FaWifi, FaTv, FaSnowflake, FaMugHot, FaBath, FaParking,
    FaEdit, FaHistory, FaCheckCircle, FaExclamationTriangle, FaTools
} from 'react-icons/fa';

const RoomDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);

    // Mock data - same as Rooms.jsx
    const initialRooms = [
        {
            id: 1,
            name: 'Classic Room',
            category: 'Standard',
            price: '3,500',
            status: 'Available',
            image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=60&w=800',
            desc: 'Comfortable and elegant room perfect for business travelers. This room offers a perfect blend of comfort and functionality, featuring high-quality linens, a dedicated workspace, and modern decor.',
            size: '350 sqft',
            guests: '2 Adults',
            bed: 'Queen Size',
            location: { building: 'Main Building', floor: '2nd Floor', wing: 'North Wing', roomNumber: '201' }
        },
        {
            id: 2,
            name: 'Deluxe Suite',
            category: 'Luxury',
            price: '6,500',
            status: 'Occupied',
            image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=60&w=800',
            desc: 'Spacious suite with premium amenities and stunning city views. The Deluxe Suite provides an elevated experience with its separate living area, marble bathroom, and floor-to-ceiling windows.',
            size: '500 sqft',
            guests: '2 Adults, 1 Child',
            bed: 'King Size',
            location: { building: 'Tower A', floor: '5th Floor', wing: 'East Wing', roomNumber: 'A-501' }
        },
        {
            id: 3,
            name: 'Presidential Suite',
            category: 'Luxury',
            price: '15,000',
            status: 'Available',
            image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=60&w=800',
            desc: 'The pinnacle of luxury. Our Presidential Suite offers panoramic views of the entire city skyline, a private dining room, a library, and 24/7 butler service for an unforgettable stay.',
            size: '1200 sqft',
            guests: '4 Adults',
            bed: 'King Size + Guest Room',
            location: { building: 'Tower B', floor: 'Penthouse', wing: 'Central Block', roomNumber: 'PH-01' }
        },
        {
            id: 4,
            name: 'Family Suite',
            category: 'Family',
            price: '10,500',
            status: 'Maintenance',
            image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=60&w=800',
            desc: 'Ideal for families traveling together, this suite features interconnected rooms and child-friendly amenities, ensuring everyone has their own space while staying together.',
            size: '700 sqft',
            guests: '4 Adults, 2 Children',
            bed: '2 Queen Size Beds',
            location: { building: 'Garden Wing', floor: '3rd Floor', wing: 'South Wing', roomNumber: 'G-301' }
        },
        {
            id: 5,
            name: 'Executive Room',
            category: 'Executive',
            price: '8,000',
            status: 'Available',
            image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=60&w=800',
            desc: 'Designed for the modern executive, this room includes priority check-in, access to the executive lounge, and a high-end conferencing setup within the room.',
            size: '450 sqft',
            guests: '2 Adults',
            bed: 'King Size',
            location: { building: 'Executive Block', floor: '4th Floor', wing: 'West Wing', roomNumber: 'E-401' }
        },
        {
            id: 6,
            name: 'Garden Room',
            category: 'Standard',
            price: '4,200',
            status: 'Available',
            image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=60&w=800',
            desc: 'Beautifully appointed ground floor room featuring a private patio with direct access to our award-winning botanical gardens.',
            size: '380 sqft',
            guests: '2 Adults',
            bed: 'Twin/King',
            location: { building: 'Garden Wing', floor: 'Ground Floor', wing: 'Central Block', roomNumber: 'G-101' }
        },
    ];

    useEffect(() => {
        // Find room by ID
        const foundRoom = initialRooms.find(r => r.id === parseInt(id));

        // Also check localStorage if not found (for newly added rooms)
        if (!foundRoom) {
            const savedRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
            const savedRoom = savedRooms.find(r => r.id === parseInt(id));
            if (savedRoom) setRoom(savedRoom);
        } else {
            setRoom(foundRoom);
        }
    }, [id]);

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
            className="max-w-7xl mx-auto space-y-8 pb-12"
        >
            {/* Top Navigation */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => navigate('/rooms')}
                    className="flex items-center text-gray-600 hover:text-[#D4AF37] transition-colors font-medium cursor-pointer group"
                >
                    <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Rooms List
                </button>
                <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all text-gray-700 font-medium cursor-pointer">
                    <FaEdit className="mr-2 text-amber-500" />
                    Edit Details
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* Left Column - Image & Overview */}
                <div className="lg:col-span-2 space-y-10">

                    <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
                        <div className="relative h-[400px]">
                            <img
                                src={room.image}
                                alt={room.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            <div className="absolute bottom-8 left-8 right-8 text-white">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 backdrop-blur-md bg-white/10`}>
                                        {room.category}
                                    </span>
                                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${room.status === 'Available' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                                        room.status === 'Occupied' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                                            'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                        }`}>
                                        {room.status}
                                    </span>
                                </div>
                                <h1 className="text-4xl font-bold mb-1 tracking-tight">{room.name}</h1>
                                <p className="text-white/80 font-medium">Room #00{room.id} • {room.location?.building}</p>
                            </div>
                        </div>

                        <div className="p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                {room.desc}
                            </p>

                            <div className="mt-10">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 font-primary">Premium Amenities</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">

                                    {amenities.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-[#D4AF37]/30 transition-all group">
                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform">
                                                {item.icon}
                                            </div>
                                            <span className="text-sm font-bold text-gray-700 tracking-tight">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* History / Recent Bookings */}
                    <div className="bg-white mt-4 rounded-[2rem] shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FaHistory className="text-[#D4AF37]" />
                                Recent Activity
                            </h2>
                            <button className="text-sm font-bold text-[#D4AF37] hover:underline cursor-pointer">View All</button>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 transition-colors hover:bg-gray-100/80">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                            JD
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">John Doe</p>
                                            <p className="text-[10px] text-gray-500 font-medium">Jan {20 + i}, 2026 - Jan {23 + i}, 2026</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        Completed
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Specs & Location */}
                <div className="space-y-10">

                    {/* Price Card */}
                    <div className="bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-white/80 font-black uppercase tracking-[0.2em] text-[10px] mb-2">Price Per Night</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold italic">₹{room.price}</span>
                                <span className="text-white/70 font-medium">/ night</span>
                            </div>
                            <button
                                onClick={() => navigate(`/create-booking/${room.id}`)}
                                className="w-full mt-6 py-4 bg-white text-[#B8860B] rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer"
                            >
                                Book This Room Now
                            </button>

                        </div>
                        {/* Abstract Shapes */}
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white mt-4 rounded-[2rem] shadow-sm border border-gray-100 p-8 space-y-8">

                        <h3 className="font-black uppercase tracking-[0.2em] text-[11px] text-gray-400">Room Specification</h3>

                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <FaExpand size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total Space</p>
                                <p className="font-bold text-gray-900 tracking-tight">{room.size}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                                <FaUsers size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Max Occupancy</p>
                                <p className="font-bold text-gray-900 tracking-tight">{room.guests}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                                <FaBed size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Bed Configuration</p>
                                <p className="font-bold text-gray-900 tracking-tight">{room.bed}</p>
                            </div>
                        </div>
                    </div>

                    {/* Precise Location */}
                    <div className="bg-white mt-4 rounded-[2rem] shadow-sm border border-gray-100 p-8 space-y-8">

                        <h3 className="font-black uppercase tracking-[0.2em] text-[11px] text-gray-400">Positioning</h3>

                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                            <FaBuilding className="text-gray-400" />
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Building</p>
                                <p className="text-sm font-bold text-gray-800">{room.location?.building}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Floor</p>
                                <p className="text-sm font-bold text-gray-800">{room.location?.floor}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Room #</p>
                                <p className="text-sm font-bold text-gray-800">{room.location?.roomNumber}</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#D4AF37]/5 border border-[#D4AF37]/10 text-center">
                            <p className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest mb-1">Wing Sector</p>
                            <p className="text-sm font-bold text-gray-800">{room.location?.wing}</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default RoomDetail;
