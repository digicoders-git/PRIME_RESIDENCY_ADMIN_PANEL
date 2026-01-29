import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaTimes, FaPlus, FaTrash, FaHotel, FaDollarSign, FaImage, FaBed,
  FaUsers, FaClock, FaCog, FaWifi, FaTv, FaSnowflake, FaFire,
  FaBalanceScale, FaUtensils, FaShieldAlt, FaDesktop, FaCube,
  FaBatteryFull, FaSmoking, FaPaw, FaEye, FaStar, FaChartBar, FaUpload, FaArrowLeft,
  FaRupeeSign
} from 'react-icons/fa';
import { toast } from 'react-toastify';

import api from '../api/api';

const AddRoom = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  const roomTypes = ['Classic', 'Deluxe', 'Executive', 'Presidential', 'Family', 'Garden'];
  const bedTypes = ['Single', 'Double', 'King', 'Twin', 'Queen Size', 'Sofa Bed'];
  const roomStatuses = ['Available', 'Booked', 'Under Maintenance', 'Disabled'];

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
              <h1 className="text-3xl font-bold">Add New Room</h1>
              <p className="text-yellow-100 text-sm mt-1">Create a new room listing for your hotel</p>
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