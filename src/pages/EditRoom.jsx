import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FaTimes, FaPlus, FaTrash, FaHotel, FaDollarSign, FaImage, FaBed,
    FaUsers, FaClock, FaCog, FaWifi, FaTv, FaSnowflake, FaFire,
    FaBalanceScale, FaUtensils, FaShieldAlt, FaDesktop, FaCube,
    FaBatteryFull, FaSmoking, FaPaw, FaEye, FaStar, FaChartBar, FaUpload, FaArrowLeft,
    FaRupeeSign
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const EditRoom = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        // 1. Basic Room Information
        roomName: '',
        roomNumber: '',
        roomType: '',
        bedType: '',
        maxAdults: '',
        maxChildren: '',
        roomSize: '',
        floorNumber: '',

        // 2. Pricing & Availability
        pricePerNight: '',
        discount: '',
        offerPrice: '',
        extraBedPrice: '',
        taxGST: '',
        totalRoomsCount: '',
        availableRooms: '',
        roomStatus: 'Available',

        // 3. Images & Media
        mainImage: null,
        mainImagePreview: '',
        galleryImages: [],
        galleryPreviews: [],
        video360: '',
        imageAltText: '',

        // 4. Amenities
        amenities: {
            ac: false,
            wifi: false,
            tv: false,
            geyser: false,
            balcony: false,
            roomService: false,
            powerBackup: false,
            miniFridge: false,
            safeLocker: false,
            workDesk: false
        },

        // 5. Room Description
        shortDescription: '',
        fullDescription: '',
        specialNotes: '',

        // 6. Policies & Rules
        checkInTime: '14:00',
        checkOutTime: '11:00',
        smokingAllowed: false,
        petsAllowed: false,
        cancellationPolicy: '',
        refundPolicy: '',

        // 7. Booking Rules
        minNightsStay: '',
        maxNightsStay: '',
        advanceBookingDays: '',
        instantBooking: false,

        // 8. Admin Control
        roomVisibility: true,
        featuredRoom: false,
        sortOrder: '',
        createdBy: '',

        // 9. Analytics (Read-only)
        totalBookings: 0,
        totalRevenue: 0,
        occupancyRate: 0
    });

    const roomTypes = ['Standard', 'Luxury', 'Single', 'Double', 'Family', 'Suite', 'Deluxe', 'Executive'];

    const bedTypes = ['Single', 'Double', 'King', 'Twin', 'Queen Size', 'Sofa Bed'];
    const roomStatuses = ['Available', 'Booked', 'Under Maintenance', 'Disabled'];

    const initialRooms = [
        {
            id: 1,
            name: 'Classic Room',
            category: 'Standard',
            price: '3,500',
            status: 'Available',
            image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=60&w=300',
            desc: 'Comfortable and elegant room perfect for business travelers',
            size: '350 sqft',
            guests: '2 Adults',
            bed: 'Queen Size',
            location: { building: 'Main Building', floor: '2nd Floor', wing: 'North Wing', roomNumber: '201' },
            amenities: { ac: true, wifi: true, tv: true, geyser: true, balcony: false, roomService: true, powerBackup: true, miniFridge: false, safeLocker: true, workDesk: true },
            fullDescription: 'Our Classic Room offers a perfect blend of comfort and functionality. Each room is designed with elegant furniture, premium bedding, and modern amenities to ensure a pleasant stay.',
            specialNotes: 'Close to Elevator'
        },


        {
            id: 2,
            name: 'Deluxe Suite',
            category: 'Luxury',
            price: '6,500',
            status: 'Occupied',
            image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=60&w=300',
            desc: 'Spacious suite with premium amenities and city views',
            size: '500 sqft',
            guests: '2 Adults, 1 Child',
            bed: 'King Size',
            location: { building: 'Tower A', floor: '5th Floor', wing: 'East Wing', roomNumber: 'A-501' },
            amenities: { ac: true, wifi: true, tv: true, geyser: true, balcony: true, roomService: true, powerBackup: true, miniFridge: true, safeLocker: true, workDesk: true },
            fullDescription: 'The Deluxe Suite is a haven of luxury, featuring a separate living area, a marble bathroom, and floor-to-ceiling windows providing stunning city views.',
            specialNotes: 'City View, High Floor'
        },


        {
            id: 3,
            name: 'Presidential Suite',
            category: 'Luxury',
            price: '15,000',
            status: 'Available',
            image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=60&w=300',
            desc: 'Ultimate luxury with panoramic views and butler service',
            size: '1200 sqft',
            guests: '4 Adults',
            bed: 'King Size + Guest Room',
            location: { building: 'Tower B', floor: 'Penthouse', wing: 'Central Block', roomNumber: 'PH-01' },
            amenities: { ac: true, wifi: true, tv: true, geyser: true, balcony: true, roomService: true, powerBackup: true, miniFridge: true, safeLocker: true, workDesk: true }
        },

        {
            id: 4,
            name: 'Family Suite',
            category: 'Family',
            price: '10,500',
            status: 'Maintenance',
            image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=60&w=300',
            desc: 'Perfect for families with interconnected rooms',
            size: '700 sqft',
            guests: '4 Adults, 2 Children',
            bed: '2 Queen Size Beds',
            location: { building: 'Garden Wing', floor: '3rd Floor', wing: 'South Wing', roomNumber: 'G-301' },
            amenities: { ac: true, wifi: true, tv: true, geyser: true, balcony: true, roomService: true, powerBackup: true, miniFridge: false, safeLocker: true, workDesk: false }
        },

        {
            id: 5,
            name: 'Executive Room',
            category: 'Executive',
            price: '8,000',
            status: 'Available',
            image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=60&w=300',
            desc: 'Business-focused room with workspace and lounge access',
            size: '450 sqft',
            guests: '2 Adults',
            bed: 'King Size',
            location: { building: 'Executive Block', floor: '4th Floor', wing: 'West Wing', roomNumber: 'E-401' },
            amenities: { ac: true, wifi: true, tv: true, geyser: true, balcony: false, roomService: true, powerBackup: true, miniFridge: true, safeLocker: true, workDesk: true }
        },

        {
            id: 6,
            name: 'Garden Room',
            category: 'Standard',
            price: '4,200',
            status: 'Available',
            image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=60&w=300',
            desc: 'Ground floor room with direct garden access',
            size: '380 sqft',
            guests: '2 Adults',
            bed: 'Twin/King',
            location: { building: 'Garden Wing', floor: 'Ground Floor', wing: 'Central Block', roomNumber: 'G-101' },
            amenities: { ac: true, wifi: true, tv: true, geyser: true, balcony: true, roomService: true, powerBackup: true, miniFridge: false, safeLocker: false, workDesk: false }
        },

    ];

    useEffect(() => {
        const savedRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
        const allRooms = [...initialRooms, ...savedRooms];
        const room = allRooms.find(r => r.id.toString() === id);

        if (room) {
            // Map room data to form data
            setFormData({
                roomName: room.name || '',
                roomNumber: room.location?.roomNumber || room.roomNumber || '',
                roomType: room.category || room.roomType || '',
                bedType: room.bed || room.bedType || '',
                maxAdults: room.maxAdults || room.guests?.split(' ')[0] || '',
                maxChildren: room.maxChildren || room.guests?.split(', ')[1]?.split(' ')[0] || '',
                roomSize: room.roomSize || room.size?.replace(' sqft', '') || '',
                floorNumber: room.location?.floor || room.floorNumber || '',
                pricePerNight: room.pricePerNight || (typeof room.price === 'string' ? room.price.replace(/,/g, '') : room.price) || '',
                discount: room.discount || '',
                offerPrice: room.offerPrice || '',
                extraBedPrice: room.extraBedPrice || '',
                taxGST: room.taxGST || '',
                totalRoomsCount: room.totalRoomsCount || '',
                availableRooms: room.availableRooms || '',
                roomStatus: room.status || room.roomStatus || 'Available',
                mainImage: null,
                mainImagePreview: room.image || room.mainImagePreview || '',
                galleryImages: [],
                galleryPreviews: room.galleryPreviews || [],
                video360: room.video360 || '',
                imageAltText: room.imageAltText || '',
                amenities: {
                    ac: room.amenities?.ac || false,
                    wifi: room.amenities?.wifi || false,
                    tv: room.amenities?.tv || false,
                    geyser: room.amenities?.geyser || false,
                    balcony: room.amenities?.balcony || false,
                    roomService: room.amenities?.roomService || false,
                    powerBackup: room.amenities?.powerBackup || false,
                    miniFridge: room.amenities?.miniFridge || false,
                    safeLocker: room.amenities?.safeLocker || false,
                    workDesk: room.amenities?.workDesk || false,
                },

                shortDescription: room.desc || room.shortDescription || '',
                fullDescription: room.fullDescription || room.desc || '',
                specialNotes: room.specialNotes || '',

                checkInTime: room.checkInTime || '14:00',
                checkOutTime: room.checkOutTime || '11:00',
                smokingAllowed: room.smokingAllowed || false,
                petsAllowed: room.petsAllowed || false,
                cancellationPolicy: room.cancellationPolicy || '',
                refundPolicy: room.refundPolicy || '',
                minNightsStay: room.minNightsStay || '',
                maxNightsStay: room.maxNightsStay || '',
                advanceBookingDays: room.advanceBookingDays || '',
                instantBooking: room.instantBooking || false,
                roomVisibility: room.roomVisibility ?? true,
                featuredRoom: room.featuredRoom || false,
                sortOrder: room.sortOrder || '',
                createdBy: room.createdBy || '',
                totalBookings: room.totalBookings || 0,
                totalRevenue: room.totalRevenue || 0,
                occupancyRate: room.occupancyRate || 0
            });
            setLoading(false);
        } else {
            toast.error('Room not found');
            navigate('/rooms');
        }
    }, [id, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAmenityChange = (amenity) => {
        setFormData(prev => ({
            ...prev,
            amenities: {
                ...prev.amenities,
                [amenity]: !prev.amenities[amenity]
            }
        }));
    };

    const handleImageUpload = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (type === 'main') {
                    setFormData(prev => ({
                        ...prev,
                        mainImage: file,
                        mainImagePreview: event.target.result
                    }));
                } else if (type === 'gallery') {
                    setFormData(prev => ({
                        ...prev,
                        galleryImages: [...prev.galleryImages, file],
                        galleryPreviews: [...prev.galleryPreviews, event.target.result]
                    }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const removeGalleryImage = (index) => {
        setFormData(prev => ({
            ...prev,
            galleryImages: prev.galleryImages.filter((_, i) => i !== index),
            galleryPreviews: prev.galleryPreviews.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const currentTime = new Date().toISOString();

        // Fetch latest rooms from localStorage
        const savedRooms = JSON.parse(localStorage.getItem('rooms') || '[]');

        const updatedRoomData = {
            id: parseInt(id),
            name: formData.roomName,
            category: formData.roomType,
            price: formData.pricePerNight,
            status: formData.roomStatus,
            image: formData.mainImagePreview,
            desc: formData.shortDescription,
            size: formData.roomSize + ' sqft',
            guests: `${formData.maxAdults} Adults${formData.maxChildren ? `, ${formData.maxChildren} Children` : ''}`,
            bed: formData.bedType,
            location: {
                building: 'Main Building',
                floor: formData.floorNumber,
                wing: 'North Wing',
                roomNumber: formData.roomNumber
            },
            ...formData,
            lastUpdatedAt: currentTime
        };

        // Update logic: if it's a hardcoded room (id 1-6), we still store it in localStorage 
        // to override the hardcoded data during display.
        const roomIndex = savedRooms.findIndex(r => r.id.toString() === id);
        if (roomIndex > -1) {
            savedRooms[roomIndex] = updatedRoomData;
        } else {
            savedRooms.push(updatedRoomData);
        }

        localStorage.setItem('rooms', JSON.stringify(savedRooms));

        toast.success('Room updated successfully!', { autoClose: 2000 });
        navigate('/rooms');
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading room data...</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="bg-gradient-to-r mb-3 from-[#D4AF37] to-[#B8860B] text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate('/rooms')}
                            className="p-2 hover:bg-white/20 rounded-lg cursor-pointer transition-colors mr-4"
                        >
                            <FaArrowLeft className="text-white" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold">Edit Room</h1>
                            <p className="text-yellow-100 text-sm mt-1">Update room information for Unit #{formData.roomNumber}</p>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Basic Room Information */}
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FaHotel className="text-blue-600 mr-3" />
                        <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-3">1</span>
                        Basic Room Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Room Name *</label>
                            <input
                                type="text"
                                name="roomName"
                                value={formData.roomName}
                                onChange={handleInputChange}
                                placeholder="Deluxe Ocean View Suite"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Room Number *</label>
                            <input
                                type="text"
                                name="roomNumber"
                                value={formData.roomNumber}
                                onChange={handleInputChange}
                                placeholder="101, A1, B2"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Room Type *</label>
                            <select
                                name="roomType"
                                value={formData.roomType}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                required
                            >
                                <option value="">Select Type</option>
                                {roomTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bed Type</label>
                            <select
                                name="bedType"
                                value={formData.bedType}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                                <option value="">Select Bed</option>
                                {bedTypes.map(bed => <option key={bed} value={bed}>{bed}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Adults</label>
                            <input
                                type="number"
                                name="maxAdults"
                                value={formData.maxAdults}
                                onChange={handleInputChange}
                                placeholder="2"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Children</label>
                            <input
                                type="number"
                                name="maxChildren"
                                value={formData.maxChildren}
                                onChange={handleInputChange}
                                placeholder="1"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Room Size (sq ft)</label>
                            <input
                                type="text"
                                name="roomSize"
                                value={formData.roomSize}
                                onChange={handleInputChange}
                                placeholder="450"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Floor Number</label>
                            <input
                                type="text"
                                name="floorNumber"
                                value={formData.floorNumber}
                                onChange={handleInputChange}
                                placeholder="3rd Floor"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Pricing & Availability */}
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FaRupeeSign className="text-green-600 mr-3" />
                        <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm mr-3">2</span>
                        Pricing & Availability
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Price Per Night (₹) *</label>
                            <input
                                type="number"
                                name="pricePerNight"
                                value={formData.pricePerNight}
                                onChange={handleInputChange}
                                placeholder="5000"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                            <input
                                type="number"
                                name="discount"
                                value={formData.discount}
                                onChange={handleInputChange}
                                placeholder="10"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Offer Price (₹)</label>
                            <input
                                type="number"
                                name="offerPrice"
                                value={formData.offerPrice}
                                onChange={handleInputChange}
                                placeholder="4500"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Extra Bed Price (₹)</label>
                            <input
                                type="number"
                                name="extraBedPrice"
                                value={formData.extraBedPrice}
                                onChange={handleInputChange}
                                placeholder="1000"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tax/GST (%)</label>
                            <input
                                type="number"
                                name="taxGST"
                                value={formData.taxGST}
                                onChange={handleInputChange}
                                placeholder="18"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Total Rooms Count</label>
                            <input
                                type="number"
                                name="totalRoomsCount"
                                value={formData.totalRoomsCount}
                                onChange={handleInputChange}
                                placeholder="10"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Available Rooms</label>
                            <input
                                type="number"
                                name="availableRooms"
                                value={formData.availableRooms}
                                onChange={handleInputChange}
                                placeholder="8"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Room Status</label>
                            <select
                                name="roomStatus"
                                value={formData.roomStatus}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 cursor-pointer"
                            >
                                {roomStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* 3. Images & Media */}
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FaImage className="text-purple-600 mr-3" />
                        <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm mr-3">3</span>
                        Images & Media
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Main Room Image *</label>
                            <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors relative">
                                {formData.mainImagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={formData.mainImagePreview}
                                            alt="Main room preview"
                                            className="w-full h-48 object-cover rounded-lg mb-4"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, mainImage: null, mainImagePreview: '' }))}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                        >
                                            <FaTimes className="text-sm" />
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <FaUpload className="mx-auto text-4xl text-purple-400 mb-4" />
                                        <p className="text-gray-600 mb-2">Click to upload main room image</p>
                                        <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, 'main')}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                {formData.galleryPreviews.map((preview, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={preview}
                                            alt={`Gallery ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeGalleryImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                        >
                                            <FaTimes className="text-xs" />
                                        </button>
                                    </div>
                                ))}
                                <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 flex flex-col items-center justify-center hover:border-purple-400 transition-colors cursor-pointer relative">
                                    <FaPlus className="text-2xl text-purple-400 mb-2" />
                                    <span className="text-sm text-gray-600">Add Image</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'gallery')}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">360° Video URL (Optional)</label>
                            <input
                                type="url"
                                name="video360"
                                value={formData.video360}
                                onChange={handleInputChange}
                                placeholder="https://example.com/360-video"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Image Alt Text (SEO)</label>
                            <input
                                type="text"
                                name="imageAltText"
                                value={formData.imageAltText}
                                onChange={handleInputChange}
                                placeholder="Deluxe room with ocean view and modern amenities"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* 4. Amenities */}
                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FaBed className="text-yellow-600 mr-3" />
                        <span className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm mr-3">4</span>
                        Amenities
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {[
                            { key: 'ac', label: 'AC', icon: FaSnowflake },
                            { key: 'wifi', label: 'Wi-Fi', icon: FaWifi },
                            { key: 'tv', label: 'TV', icon: FaTv },
                            { key: 'geyser', label: 'Geyser', icon: FaFire },
                            { key: 'balcony', label: 'Balcony', icon: FaBalanceScale },
                            { key: 'roomService', label: 'Room Service', icon: FaUtensils },
                            { key: 'powerBackup', label: 'Power Backup', icon: FaBatteryFull },
                            { key: 'miniFridge', label: 'Mini Fridge', icon: FaCube },
                            { key: 'safeLocker', label: 'Safe Locker', icon: FaShieldAlt },
                            { key: 'workDesk', label: 'Work Desk', icon: FaDesktop }
                        ].map(({ key, label, icon: Icon }) => (
                            <label key={key} className="flex items-center cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-yellow-100">
                                <input
                                    type="checkbox"
                                    checked={formData.amenities[key]}
                                    onChange={() => handleAmenityChange(key)}
                                    className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 mr-3"
                                />
                                <Icon className="text-yellow-600 mr-2" />
                                <span className="text-sm font-medium text-gray-700">{label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* 5. Room Description */}
                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FaUsers className="text-indigo-600 mr-3" />
                        <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm mr-3">5</span>
                        Room Description
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
                            <textarea
                                name="shortDescription"
                                value={formData.shortDescription}
                                onChange={handleInputChange}
                                rows="2"
                                placeholder="Brief description of the room"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Description</label>
                            <textarea
                                name="fullDescription"
                                value={formData.fullDescription}
                                onChange={handleInputChange}
                                rows="4"
                                placeholder="Detailed description with amenities and features"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Special Notes</label>
                            <textarea
                                name="specialNotes"
                                value={formData.specialNotes}
                                onChange={handleInputChange}
                                rows="2"
                                placeholder="Sea view, Smoking allowed, etc."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-6 justify-end space-x-4 pt-6 border-t border-gray-200 bg-gray-50 -mx-6 px-6 py-4 rounded-b-xl">
                    <button
                        type="button"
                        onClick={() => navigate('/rooms')}
                        className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer transition-all font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:from-[#B8860B] hover:to-[#D4AF37] cursor-pointer transition-all font-medium shadow-lg hover:shadow-xl"
                    >
                        Update Room
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default EditRoom;
