import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaTimes, FaPlus, FaTrash, FaHotel, FaDollarSign, FaImage, FaBed,
  FaUsers, FaClock, FaCog, FaWifi, FaTv, FaSnowflake, FaFire,
  FaBalanceScale, FaUtensils, FaShieldAlt, FaDesktop, FaCube,
  FaBatteryFull, FaSmoking, FaPaw, FaEye, FaStar, FaChartBar, FaUpload, FaArrowLeft,
  FaRupeeSign, FaGlassCheers, FaMusic, FaCamera, FaParking, FaMicrophone, FaChair, FaLeaf
} from 'react-icons/fa';
import { toast } from 'react-toastify';

import api from '../api/api';
import { useEffect } from 'react';

const AddRoom = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [roomTypes, setRoomTypes] = useState([]);
  const [bedTypes, setBedTypes] = useState([]);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [formData, setFormData] = useState({
    // 1. Basic Room Information
    roomName: '',
    roomNumber: '',
    category: 'Room',
    roomType: '',
    bedType: '',
    maxAdults: '',
    maxChildren: '',
    roomSize: '',
    floorNumber: '',

    // 2. Pricing & Availability
    pricePerNight: '',
    discount: '',
    extraBedPrice: '',
    taxGST: '',
    totalPrice: '',
    enableExtraCharges: false,
    roomStatus: 'Available',

    // 3. Images & Media
    mainImage: null,
    mainImagePreview: '',
    galleryImages: [],
    galleryPreviews: [],

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

  const roomStatuses = ['Available', 'Booked', 'Under Maintenance', 'Disabled'];

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data } = await api.get('/room-config');
      const configs = data.data;

      setRoomTypes(configs.filter(c => c.type === 'roomType').map(c => c.name));
      setBedTypes(configs.filter(c => c.type === 'bedType').map(c => c.name));

      const amenities = configs.filter(c => c.type === 'amenity');
      setAmenitiesList(amenities);

      // Initialize amenities state
      const amenitiesObj = {};
      amenities.forEach(a => {
        const key = a.name.toLowerCase().replace(/\s+/g, '');
        amenitiesObj[key] = false;
      });
      setFormData(prev => ({ ...prev, amenities: amenitiesObj }));
    } catch (error) {
      console.error('Failed to fetch configs');
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
      if (type === 'gallery' && formData.galleryImages.length >= 3) {
        toast.error('Maximum 3 gallery images allowed');
        return;
      }

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
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.roomName || !formData.roomNumber || !formData.roomType || !formData.pricePerNight) {
        toast.error('Please fill all required fields');
        setLoading(false);
        return;
      }

      const form = new FormData();

      // Only required fields first
      form.append('name', formData.roomName.trim());
      form.append('roomNumber', formData.roomNumber.trim());
      form.append('category', formData.category);
      form.append('type', formData.roomType);
      form.append('price', formData.pricePerNight);

      // Status (default to Available if empty)
      form.append('status', formData.roomStatus || 'Available');

      // Description (use short description if full is empty)
      const description = formData.fullDescription || formData.shortDescription || 'No description provided';
      form.append('description', description);

      // Amenities array
      const selectedAmenities = Object.keys(formData.amenities).filter(key => formData.amenities[key]);
      selectedAmenities.forEach(amenity => {
        form.append('amenities', amenity);
      });

      // Append Extended Details
      if (formData.roomSize) form.append('roomSize', formData.roomSize);
      if (formData.bedType) form.append('bedType', formData.bedType);
      if (formData.floorNumber) form.append('floorNumber', formData.floorNumber);
      if (formData.maxAdults) form.append('maxAdults', formData.maxAdults);
      if (formData.maxChildren) form.append('maxChildren', formData.maxChildren);

      // Append Pricing Extended
      if (formData.discount) form.append('discount', formData.discount);
      if (formData.extraBedPrice) form.append('extraBedPrice', formData.extraBedPrice);
      if (formData.taxGST) form.append('taxGST', formData.taxGST);
      if (formData.totalPrice) {
        form.append('totalPrice', formData.totalPrice);
        form.append('enableExtraCharges', true);
      }
      form.append('enableExtraCharges', formData.enableExtraCharges);



      // Images
      if (formData.mainImage) {
        form.append('image', formData.mainImage);
      }

      if (formData.galleryImages && formData.galleryImages.length > 0) {
        formData.galleryImages.forEach(file => {
          form.append('gallery', file);
        });
      }

      const { data } = await api.post('/rooms', form, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (data.success) {
        toast.success('Room added successfully!', { autoClose: 2000 });
        navigate('/rooms');
      }
    } catch (error) {
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to add room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/rooms')}
              className="p-2 hover:bg-white/20 rounded-lg cursor-pointer transition-colors mr-4"
            >
              <FaArrowLeft className="text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Add New {formData.category}</h1>
              <p className="text-yellow-100 text-sm mt-1">Create a new {formData.category.toLowerCase()} listing for your property</p>
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

          {/* Enable Extra Charges Toggle */}
          <div className="mb-6 p-4 bg-white rounded-lg border border-green-300">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableExtraCharges}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  setFormData(prev => {
                    const priceVal = parseFloat(prev.pricePerNight) || 0;
                    const discountVal = parseFloat(prev.discount) || 0;
                    const extraBedVal = parseFloat(prev.extraBedPrice) || 0;
                    const taxVal = parseFloat(prev.taxGST) || 0;

                    let newTotalPrice = priceVal;
                    if (enabled && priceVal > 0) {
                      const discountAmount = (priceVal * discountVal) / 100;
                      const priceAfterDiscount = priceVal - discountAmount;
                      const taxAmount = (priceAfterDiscount * taxVal) / 100;
                      newTotalPrice = Math.round(priceAfterDiscount + extraBedVal + taxAmount);
                    }

                    return {
                      ...prev,
                      enableExtraCharges: enabled,
                      totalPrice: newTotalPrice > 0 ? newTotalPrice.toString() : ''
                    };
                  });
                }}
                className="rounded border-gray-300 text-green-500 focus:ring-green-500 mr-3 w-5 h-5"
              />
              <div>
                <span className="text-sm font-bold text-gray-700">Enable Extra Charges (Discount, Taxes, etc.)</span>
                <p className="text-xs text-gray-500 mt-1">When enabled, total price will include discount, {formData.category === 'Room' ? 'extra bed charges' : 'additional gear'}, and taxes</p>
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
                  const newPrice = e.target.value;
                  const priceVal = parseFloat(newPrice) || 0;

                  setFormData(prev => {
                    if (!prev.enableExtraCharges) {
                      return { ...prev, pricePerNight: newPrice, totalPrice: newPrice };
                    }

                    const discountVal = parseFloat(prev.discount) || 0;
                    const extraBedVal = parseFloat(prev.extraBedPrice) || 0;
                    const taxVal = parseFloat(prev.taxGST) || 0;

                    const discountAmount = (priceVal * discountVal) / 100;
                    const priceAfterDiscount = priceVal - discountAmount;
                    const taxAmount = (priceAfterDiscount * taxVal) / 100;
                    const newTotalPrice = Math.round(priceAfterDiscount + extraBedVal + taxAmount);

                    return {
                      ...prev,
                      pricePerNight: newPrice,
                      totalPrice: newTotalPrice > 0 ? newTotalPrice.toString() : ''
                    };
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
                  const newDiscount = e.target.value;

                  setFormData(prev => {
                    if (!prev.enableExtraCharges) {
                      return { ...prev, discount: newDiscount };
                    }

                    const discountVal = parseFloat(newDiscount) || 0;
                    const priceVal = parseFloat(prev.pricePerNight) || 0;
                    const extraBedVal = parseFloat(prev.extraBedPrice) || 0;
                    const taxVal = parseFloat(prev.taxGST) || 0;

                    const discountAmount = (priceVal * discountVal) / 100;
                    const priceAfterDiscount = priceVal - discountAmount;
                    const taxAmount = (priceAfterDiscount * taxVal) / 100;
                    const newTotalPrice = Math.round(priceAfterDiscount + extraBedVal + taxAmount);

                    return {
                      ...prev,
                      discount: newDiscount,
                      totalPrice: newTotalPrice > 0 ? newTotalPrice.toString() : ''
                    };
                  });
                }}
                placeholder="10"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Extra Bed Price (₹)</label>
              <input
                type="number"
                name="extraBedPrice"
                value={formData.extraBedPrice}
                onChange={(e) => {
                  const newExtraBed = e.target.value;

                  setFormData(prev => {
                    if (!prev.enableExtraCharges) {
                      return { ...prev, extraBedPrice: newExtraBed };
                    }

                    const extraBedVal = parseFloat(newExtraBed) || 0;
                    const priceVal = parseFloat(prev.pricePerNight) || 0;
                    const discountVal = parseFloat(prev.discount) || 0;
                    const taxVal = parseFloat(prev.taxGST) || 0;

                    const discountAmount = (priceVal * discountVal) / 100;
                    const priceAfterDiscount = priceVal - discountAmount;
                    const taxAmount = (priceAfterDiscount * taxVal) / 100;
                    const newTotalPrice = Math.round(priceAfterDiscount + extraBedVal + taxAmount);

                    return {
                      ...prev,
                      extraBedPrice: newExtraBed,
                      totalPrice: newTotalPrice > 0 ? newTotalPrice.toString() : ''
                    };
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
                  const newTax = e.target.value;

                  setFormData(prev => {
                    if (!prev.enableExtraCharges) {
                      return { ...prev, taxGST: newTax };
                    }

                    const taxVal = parseFloat(newTax) || 0;
                    const priceVal = parseFloat(prev.pricePerNight) || 0;
                    const discountVal = parseFloat(prev.discount) || 0;
                    const extraBedVal = parseFloat(prev.extraBedPrice) || 0;

                    const discountAmount = (priceVal * discountVal) / 100;
                    const priceAfterDiscount = priceVal - discountAmount;
                    const taxAmount = (priceAfterDiscount * taxVal) / 100;
                    const newTotalPrice = Math.round(priceAfterDiscount + extraBedVal + taxAmount);

                    return {
                      ...prev,
                      taxGST: newTax,
                      totalPrice: newTotalPrice > 0 ? newTotalPrice.toString() : ''
                    };
                  });
                }}
                placeholder="18"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.enableExtraCharges ? 'Total Price (with charges) (₹)' : 'Total Price (₹)'}
              </label>
              <input
                type="number"
                name="totalPrice"
                value={formData.totalPrice}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-green-100 cursor-not-allowed font-semibold text-green-700"
              />
              {formData.enableExtraCharges && formData.totalPrice && (
                <p className="text-xs text-gray-500 mt-1">This price will be used for bookings</p>
              )}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images (Max 3)</label>
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
                {formData.galleryImages.length < 3 && (
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
                )}
              </div>
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
            disabled={loading}
            className={`px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:from-[#B8860B] hover:to-[#D4AF37] cursor-pointer transition-all font-medium shadow-lg hover:shadow-xl ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Adding Room...' : 'Add Room'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddRoom;