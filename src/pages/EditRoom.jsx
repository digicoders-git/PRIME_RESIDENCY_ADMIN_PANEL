import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FaTimes, FaPlus, FaTrash, FaHotel, FaDollarSign, FaImage, FaBed,
    FaUsers, FaClock, FaCog, FaWifi, FaTv, FaSnowflake, FaFire,
    FaBalanceScale, FaUtensils, FaShieldAlt, FaDesktop, FaCube,
    FaBatteryFull, FaSmoking, FaPaw, FaEye, FaStar, FaChartBar, FaUpload, FaArrowLeft,
    FaRupeeSign, FaGlassCheers, FaMusic, FaCamera, FaParking, FaMicrophone, FaChair, FaLeaf
} from 'react-icons/fa';
import { toast } from 'react-toastify';

import api from '../api/api';

const EditRoom = () => {
    const { id } = useParams(); // Start with URL param (could be ID or RoomNumber)
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mongoId, setMongoId] = useState(null); // Store actual DB ID
    const [roomTypes, setRoomTypes] = useState([]);
    const [bedTypes, setBedTypes] = useState([]);
    const [amenitiesList, setAmenitiesList] = useState([]);

    const [formData, setFormData] = useState({
        // ... (same initial state structure)
        roomName: '',
        roomNumber: '',
        category: 'Room',
        roomType: '',
        bedType: '',
        maxAdults: '',
        maxChildren: '',
        roomSize: '',
        floorNumber: '',
        pricePerNight: '',
        discount: '',
        offerPrice: '',
        extraBedPrice: '',
        taxGST: '',
        enableExtraCharges: false,
        roomStatus: 'Available',
        mainImage: null,
        mainImagePreview: '',
        galleryImages: [],
        galleryPreviews: [],
        video360: '',
        imageAltText: '',
        amenities: {
            ac: false, wifi: false, tv: false, geyser: false, balcony: false,
            roomService: false, powerBackup: false, miniFridge: false,
            safeLocker: false, workDesk: false
        },
        shortDescription: '',
        fullDescription: '',
        specialNotes: '',
        checkInTime: '14:00',
        checkOutTime: '11:00',
        smokingAllowed: false,
        petsAllowed: false,
        cancellationPolicy: '',
        refundPolicy: '',
        minNightsStay: '',
        maxNightsStay: '',
        advanceBookingDays: '',
        instantBooking: false,
        roomVisibility: true,
        featuredRoom: false,
        sortOrder: '',
        createdBy: '',
        totalBookings: 0,
        totalRevenue: 0,
        occupancyRate: 0
    });

    const roomStatuses = ['Available', 'Booked', 'Under Maintenance', 'Disabled'];

    useEffect(() => {
        const loadData = async () => {
            await fetchConfigs();
            await fetchRoomData();
        };
        loadData();
    }, [id]);

    const fetchConfigs = async () => {
        try {
            const { data } = await api.get('/room-config');
            const configs = data.data;

            setRoomTypes(configs.filter(c => c.type === 'roomType').map(c => c.name));
            setBedTypes(configs.filter(c => c.type === 'bedType').map(c => c.name));

            const amenities = configs.filter(c => c.type === 'amenity');
            setAmenitiesList(amenities);
        } catch (error) {
            console.error('Failed to fetch configs');
        }
    };

    const fetchRoomData = async () => {
        setLoading(true);
        try {
            // Fetch all rooms to find the correct one by roomNumber (since URL param is now roomNumber)
            const { data } = await api.get('/rooms');
            if (data.success) {
                let room = data.data.find(r => r.roomNumber === id);

                // Fallback: If not found by roomNumber, maybe 'id' provided IS actually a MongoID?
                if (!room) {
                    room = data.data.find(r => r._id === id);
                }

                if (room) {
                    setMongoId(room._id); // Save the actual ID for updates
                    const backendAmenities = room.amenities || [];

                    // Initialize amenities state from configs
                    const amenitiesObj = {};
                    amenitiesList.forEach(a => {
                        const key = a.name.toLowerCase().replace(/\s+/g, '');
                        amenitiesObj[key] = backendAmenities.some(ba =>
                            ba.toLowerCase().replace(/\s+/g, '') === key
                        );
                    });

                    setFormData(prev => ({
                        ...prev,
                        roomName: room.name || '',
                        roomNumber: room.roomNumber || '',
                        category: room.category || 'Room',
                        roomType: room.type || '',
                        pricePerNight: room.price || '',
                        roomStatus: room.status === 'Maintenance' ? 'Under Maintenance' : room.status || 'Available',
                        mainImagePreview: room.image || '',
                        fullDescription: room.description || '',
                        shortDescription: room.shortDescription || (room.description ? room.description.substring(0, 100) : ''),

                        // Extended Fields
                        maxAdults: room.maxAdults || '',
                        maxChildren: room.maxChildren || '',
                        roomSize: room.roomSize || '',
                        floorNumber: room.floorNumber || '',
                        bedType: room.bedType || '',
                        discount: room.discount || '',
                        offerPrice: room.offerPrice || '',
                        extraBedPrice: room.extraBedPrice || '',
                        taxGST: room.taxGST || '',
                        enableExtraCharges: room.enableExtraCharges || false,
                        video360: room.video360 || '',
                        imageAltText: room.imageAltText || '',
                        specialNotes: room.specialNotes || '',
                        galleryPreviews: room.gallery || [],

                        amenities: amenitiesObj
                    }));
                } else {
                    toast.error('Room not found');
                    navigate('/rooms');
                }
            }
        } catch (error) {
            toast.error('Failed to fetch room details');
            navigate('/rooms');
        } finally {
            setLoading(false);
        }
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const form = new FormData();
            form.append('name', formData.roomName);
            form.append('roomNumber', formData.roomNumber);
            form.append('category', formData.category);
            form.append('type', formData.roomType);
            form.append('price', Number(formData.pricePerNight));

            const status = formData.roomStatus === 'Under Maintenance' ? 'Maintenance' :
                formData.roomStatus === 'Disabled' ? 'Maintenance' : formData.roomStatus;
            form.append('status', status);

            form.append('description', formData.fullDescription || formData.shortDescription);

            // Append Extended Details
            if (formData.roomSize) form.append('roomSize', formData.roomSize);
            if (formData.bedType) form.append('bedType', formData.bedType);
            if (formData.floorNumber) form.append('floorNumber', formData.floorNumber);
            if (formData.maxAdults) form.append('maxAdults', formData.maxAdults);
            if (formData.maxChildren) form.append('maxChildren', formData.maxChildren);

            // Append Pricing Extended
            if (formData.discount) form.append('discount', formData.discount);
            if (formData.offerPrice) form.append('offerPrice', formData.offerPrice);
            if (formData.extraBedPrice) form.append('extraBedPrice', formData.extraBedPrice);
            if (formData.taxGST) form.append('taxGST', formData.taxGST);
            if (formData.offerPrice) form.append('totalPrice', formData.offerPrice);
            form.append('enableExtraCharges', formData.enableExtraCharges);



            // Append Other Details
            if (formData.video360) form.append('video360', formData.video360);
            if (formData.imageAltText) form.append('imageAltText', formData.imageAltText);
            if (formData.specialNotes) form.append('specialNotes', formData.specialNotes);

            Object.keys(formData.amenities).filter(key => formData.amenities[key]).forEach(key => {
                form.append('amenities', key);
            });

            // Image
            if (formData.mainImage) {
                form.append('image', formData.mainImage);
            }

            // Gallery
            if (formData.galleryImages && formData.galleryImages.length > 0) {
                formData.galleryImages.forEach(file => {
                    form.append('gallery', file);
                });
            }

            const { data } = await api.put(`/rooms/${mongoId}`, form, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (data.success) {
                toast.success('Room updated successfully!', { autoClose: 2000 });
                navigate('/rooms');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update room');
            console.error(error);
        } finally {
            setSaving(false);
        }
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
            <div className={`p-6 rounded-xl text-white shadow-lg transition-all duration-500 mb-6 ${formData.category === 'Room' ? 'bg-gradient-to-r from-blue-600 to-indigo-700' :
                formData.category === 'Banquet' ? 'bg-gradient-to-r from-purple-600 to-fuchsia-700' :
                    'bg-gradient-to-r from-emerald-600 to-teal-700'
                }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate(formData.category === 'Room' ? '/rooms' : '/banquets')}
                            className="p-2 hover:bg-white/20 rounded-lg cursor-pointer transition-colors mr-4"
                        >
                            <FaArrowLeft className="text-white" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                {formData.category === 'Room' ? <FaHotel /> : formData.category === 'Banquet' ? <FaGlassCheers /> : <FaLeaf />}
                                Edit {formData.category}
                            </h1>
                            <p className="text-white/80 text-sm mt-1">Update {formData.category.toLowerCase()} information for Unit #{formData.roomNumber}</p>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Basic Room Information */}
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        {formData.category === 'Room' ? <FaHotel className="text-blue-600 mr-3" /> : formData.category === 'Banquet' ? <FaGlassCheers className="text-purple-600 mr-3" /> : <FaLeaf className="text-emerald-600 mr-3" />}
                        <span className={`w-8 h-8 ${formData.category === 'Room' ? 'bg-blue-600' : formData.category === 'Banquet' ? 'bg-purple-600' : 'bg-emerald-600'} text-white rounded-full flex items-center justify-center text-sm mr-3`}>1</span>
                        Basic {formData.category === 'Room' ? 'Room' : 'Venue'} Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{formData.category === 'Room' ? 'Room' : 'Venue'} Name *</label>
                            <input
                                type="text"
                                name="roomName"
                                value={formData.roomName}
                                onChange={handleInputChange}
                                placeholder={formData.category === 'Room' ? "Deluxe Ocean View Suite" : "Grand Imperial Ballroom"}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{formData.category === 'Room' ? 'Room' : 'Venue'} Number/ID *</label>
                            <input
                                type="text"
                                name="roomNumber"
                                value={formData.roomNumber}
                                onChange={handleInputChange}
                                placeholder={formData.category === 'Room' ? "101, A1" : "V1, LN-01"}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                required
                            >
                                <option value="Room">Room</option>
                                <option value="Banquet">Banquet</option>
                                <option value="Lawn">Lawn</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{formData.category === 'Room' ? 'Room' : 'Venue'} Type *</label>
                            <select
                                name="roomType"
                                value={formData.roomType}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                required
                            >
                                <option value="">Select Type</option>
                                {formData.category === 'Room' ? (
                                    roomTypes.map(type => <option key={type} value={type}>{type}</option>)
                                ) : (
                                    <>
                                        <option value="Indoor">Indoor</option>
                                        <option value="Outdoor">Outdoor</option>
                                        <option value="Rooftop">Rooftop</option>
                                        <option value="Poolside">Poolside</option>
                                    </>
                                )}
                            </select>
                        </div>
                        {formData.category === 'Room' && (
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
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{formData.category === 'Room' ? 'Max Adults' : 'Guest Capacity'}</label>
                            <input
                                type="number"
                                name="maxAdults"
                                value={formData.maxAdults}
                                onChange={handleInputChange}
                                placeholder={formData.category === 'Room' ? "2" : "500"}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        {formData.category === 'Room' && (
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
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{formData.category === 'Room' ? 'Room' : 'Area'} Size (sq ft)</label>
                            <input
                                type="text"
                                name="roomSize"
                                value={formData.roomSize}
                                onChange={handleInputChange}
                                placeholder={formData.category === 'Room' ? "450" : "5000"}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Floor/Zone Number</label>
                            <input
                                type="text"
                                name="floorNumber"
                                value={formData.floorNumber}
                                onChange={handleInputChange}
                                placeholder={formData.category === 'Room' ? "3rd Floor" : "Ground Zone"}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Pricing & Availability */}
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FaRupeeSign className={formData.category === 'Room' ? 'text-blue-600 mr-3' : formData.category === 'Banquet' ? 'text-purple-600 mr-3' : 'text-emerald-600 mr-3'} />
                        <span className={`w-8 h-8 ${formData.category === 'Room' ? 'bg-blue-600' : formData.category === 'Banquet' ? 'bg-purple-600' : 'bg-emerald-600'} text-white rounded-full flex items-center justify-center text-sm mr-3`}>2</span>
                        Pricing & Booking Details
                    </h3>

                    {/* Enable Extra Charges Toggle */}
                    <div className="mb-6 p-4 bg-white rounded-lg border border-green-300">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.enableExtraCharges}
                                onChange={(e) => {
                                    const enabled = e.target.checked;
                                    setFormData(prev => {
                                        const price = parseFloat(prev.pricePerNight) || 0;
                                        const discount = parseFloat(prev.discount) || 0;
                                        const tax = parseFloat(prev.taxGST) || 0;
                                        const extraBed = parseFloat(prev.extraBedPrice) || 0;

                                        let final = price;
                                        if (enabled && price > 0) {
                                            const discounted = price - (price * discount / 100);
                                            const withTax = discounted + (discounted * tax / 100);
                                            final = Math.round(withTax + extraBed);
                                        }

                                        return {
                                            ...prev,
                                            enableExtraCharges: enabled,
                                            offerPrice: final > 0 ? final.toString() : ''
                                        };
                                    });
                                }}
                                className="rounded border-gray-300 text-green-500 focus:ring-green-500 mr-3 w-5 h-5"
                            />
                            <div>
                                <span className="text-sm font-bold text-gray-700">Enable Extra Charges (Discount, Extra Bed, Tax)</span>
                                <p className="text-xs text-gray-500 mt-1">When enabled, total price will include discount, extra bed charges, and taxes</p>
                            </div>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {formData.category === 'Room' ? 'Price Per Night (₹) *' : 'Base Booking Price (₹) *'}
                            </label>
                            <input
                                type="number"
                                name="pricePerNight"
                                value={formData.pricePerNight}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData(prev => {
                                        if (!prev.enableExtraCharges) {
                                            return { ...prev, pricePerNight: val, offerPrice: val };
                                        }

                                        const price = parseFloat(val) || 0;
                                        const discount = parseFloat(prev.discount) || 0;
                                        const tax = parseFloat(prev.taxGST) || 0;
                                        const extraBed = parseFloat(prev.extraBedPrice) || 0;

                                        const discounted = price - (price * discount / 100);
                                        const withTax = discounted + (discounted * tax / 100);
                                        const final = Math.round(withTax + extraBed);

                                        return { ...prev, pricePerNight: val, offerPrice: final > 0 ? final.toString() : '' };
                                    });
                                }}
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
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData(prev => {
                                        if (!prev.enableExtraCharges) {
                                            return { ...prev, discount: val };
                                        }

                                        const price = parseFloat(prev.pricePerNight) || 0;
                                        const discount = parseFloat(val) || 0;
                                        const tax = parseFloat(prev.taxGST) || 0;
                                        const extraBed = parseFloat(prev.extraBedPrice) || 0;

                                        const discounted = price - (price * discount / 100);
                                        const withTax = discounted + (discounted * tax / 100);
                                        const final = Math.round(withTax + extraBed);

                                        return { ...prev, discount: val, offerPrice: final > 0 ? final.toString() : '' };
                                    });
                                }}
                                placeholder="10"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {formData.enableExtraCharges ? 'Final Price (with charges)' : 'Final Price (Calculated)'}
                            </label>
                            <input
                                type="number"
                                name="offerPrice"
                                value={formData.offerPrice}
                                readOnly
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed font-bold text-green-700"
                            />
                            {formData.enableExtraCharges && formData.offerPrice && (
                                <p className="text-xs text-gray-500 mt-1">This price will be used for bookings</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {formData.category === 'Room' ? 'Extra Bed Price (₹)' : 'Additional Gear/Services (₹)'}
                            </label>
                            <input
                                type="number"
                                name="extraBedPrice"
                                value={formData.extraBedPrice}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData(prev => {
                                        const price = parseFloat(prev.pricePerNight) || 0;
                                        const discount = parseFloat(prev.discount) || 0;
                                        const tax = parseFloat(prev.taxGST) || 0;
                                        const extraBed = parseFloat(val) || 0;

                                        const discounted = price - (price * discount / 100);
                                        const withTax = discounted + (discounted * tax / 100);
                                        const final = Math.round(withTax + extraBed);

                                        return { ...prev, extraBedPrice: val, offerPrice: final > 0 ? final.toString() : '' };
                                    });
                                }}
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
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData(prev => {
                                        const price = parseFloat(prev.pricePerNight) || 0;
                                        const discount = parseFloat(prev.discount) || 0;
                                        const tax = parseFloat(val) || 0;
                                        const extraBed = parseFloat(prev.extraBedPrice) || 0;

                                        const discounted = price - (price * discount / 100);
                                        const withTax = discounted + (discounted * tax / 100);
                                        const final = Math.round(withTax + extraBed);

                                        return { ...prev, taxGST: val, offerPrice: final > 0 ? final.toString() : '' };
                                    });
                                }}
                                placeholder="18"
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
                        {formData.category === 'Room' ? <FaBed className="text-blue-600 mr-3" /> : formData.category === 'Banquet' ? <FaMusic className="text-purple-600 mr-3" /> : <FaParking className="text-emerald-600 mr-3" />}
                        <span className={`w-8 h-8 ${formData.category === 'Room' ? 'bg-blue-600' : formData.category === 'Banquet' ? 'bg-purple-600' : 'bg-emerald-600'} text-white rounded-full flex items-center justify-center text-sm mr-3`}>4</span>
                        {formData.category === 'Room' ? 'Room Amenities' : 'Venue Facilities'}
                    </h3>
                    {amenitiesList.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No amenities available. Please add amenities from Services Management.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {amenitiesList.map((amenity) => {
                                const key = amenity.name.toLowerCase().replace(/\s+/g, '');
                                const iconMap = {
                                    'FaWifi': FaWifi, 'FaSnowflake': FaSnowflake, 'FaTv': FaTv, 'FaFire': FaFire,
                                    'FaBalanceScale': FaBalanceScale, 'FaUtensils': FaUtensils, 'FaBatteryFull': FaBatteryFull,
                                    'FaCube': FaCube, 'FaShieldAlt': FaShieldAlt, 'FaDesktop': FaDesktop,
                                    'FaGlassCheers': FaGlassCheers, 'FaMusic': FaMusic, 'FaCamera': FaCamera,
                                    'FaParking': FaParking, 'FaMicrophone': FaMicrophone, 'FaChair': FaChair, 'FaLeaf': FaLeaf
                                };
                                const Icon = amenity.icon ? iconMap[amenity.icon] || FaBed : FaBed;

                                return (
                                    <label key={amenity._id} className="flex items-center cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-yellow-100">
                                        <input
                                            type="checkbox"
                                            checked={formData.amenities[key] || false}
                                            onChange={() => handleAmenityChange(key)}
                                            className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 mr-3"
                                        />
                                        <Icon className="text-yellow-600 mr-2" />
                                        <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 5. Room Description */}
                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FaUsers className="text-indigo-600 mr-3" />
                        <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm mr-3">5</span>
                        {formData.category} Description
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
                        disabled={saving}
                        className={`px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:from-[#B8860B] hover:to-[#D4AF37] cursor-pointer transition-all font-medium shadow-lg hover:shadow-xl ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {saving ? 'Updating Room...' : 'Update Room'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default EditRoom;
