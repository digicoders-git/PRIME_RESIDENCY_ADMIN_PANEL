import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const AddRoomModal = ({ isOpen, onClose, onAddRoom }) => {
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

  const roomTypes = ['Single', 'Double', 'Family', 'Suite', 'Deluxe', 'Executive'];
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentTime = new Date().toISOString();
    const roomData = {
      id: Date.now(), // Simple ID generation
      name: formData.roomName,
      category: formData.roomType,
      price: formData.pricePerNight,
      status: formData.roomStatus,
      image: formData.mainImagePreview || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=60&w=300',
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
      createdAt: currentTime,
      lastUpdatedAt: currentTime
    };

    onAddRoom(roomData);
    toast.success('Room added successfully!', { autoClose: 2000 });
    onClose();

    // Reset form
    setFormData({
      roomName: '', roomNumber: '', roomType: '', bedType: '', maxAdults: '', maxChildren: '',
      roomSize: '', floorNumber: '', pricePerNight: '', discount: '', offerPrice: '', extraBedPrice: '',
      taxGST: '', roomStatus: 'Available',
      mainImage: null, mainImagePreview: '', galleryImages: [], galleryPreviews: [], video360: '', imageAltText: '',
      amenities: { ac: false, wifi: false, tv: false, geyser: false, balcony: false, roomService: false, powerBackup: false, miniFridge: false, safeLocker: false, workDesk: false },
      shortDescription: '', fullDescription: '', specialNotes: '', checkInTime: '14:00', checkOutTime: '11:00',
      smokingAllowed: false, petsAllowed: false, cancellationPolicy: '', refundPolicy: '',
      minNightsStay: '', maxNightsStay: '', advanceBookingDays: '', instantBooking: false,
      roomVisibility: true, featuredRoom: false, sortOrder: '', createdBy: '',
      totalBookings: 0, totalRevenue: 0, occupancyRate: 0
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Add New Room</h2>
                  <p className="text-yellow-100 text-sm mt-1">Create a new room listing for your hotel</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg cursor-pointer transition-colors">
                  <span className="text-white text-xl">✕</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* 1. Basic Room Information */}
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-blue-600 mr-3 text-xl">🏨</span>
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
                  <span className="text-green-600 mr-3 text-xl">💰</span>
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
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => {
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Final Price (Calculated)</label>
                    <input
                      type="number"
                      name="offerPrice"
                      value={formData.offerPrice}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed font-bold text-green-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Extra Bed Price (₹)</label>
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
                  <span className="text-purple-600 mr-3 text-xl">📷</span>
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
                            <span className="text-sm">✕</span>
                          </button>
                        </div>
                      ) : (
                        <div>
                          <span className="mx-auto text-4xl text-purple-400 mb-4 block text-center">📁</span>
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
                            <span className="text-xs">✕</span>
                          </button>
                        </div>
                      ))}
                      <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 flex flex-col items-center justify-center hover:border-purple-400 transition-colors cursor-pointer relative">
                        <span className="text-2xl text-purple-400 mb-2 block text-center">➕</span>
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
                  <span className="text-yellow-600 mr-3 text-xl">🛏️</span>
                  <span className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm mr-3">4</span>
                  Amenities
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { key: 'ac', label: 'AC', icon: '❄️' },
                    { key: 'wifi', label: 'Wi-Fi', icon: '📶' },
                    { key: 'tv', label: 'TV', icon: '📺' },
                    { key: 'geyser', label: 'Geyser', icon: '🔥' },
                    { key: 'balcony', label: 'Balcony', icon: '🏠' },
                    { key: 'roomService', label: 'Room Service', icon: '🍽️' },
                    { key: 'powerBackup', label: 'Power Backup', icon: '🔋' },
                    { key: 'miniFridge', label: 'Mini Fridge', icon: '🧊' },
                    { key: 'safeLocker', label: 'Safe Locker', icon: '🔒' },
                    { key: 'workDesk', label: 'Work Desk', icon: '💻' }
                  ].map(({ key, label, icon }) => (
                    <label key={key} className="flex items-center cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-yellow-100">
                      <input
                        type="checkbox"
                        checked={formData.amenities[key]}
                        onChange={() => handleAmenityChange(key)}
                        className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 mr-3"
                      />
                      <span className="text-yellow-600 mr-2">{icon}</span>
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 5. Room Description */}
              <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-indigo-600 mr-3 text-xl">👥</span>
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

              {/* 6. Policies & Rules */}
              <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-red-600 mr-3 text-xl">⏰</span>
                  <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm mr-3">6</span>
                  Policies & Rules
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Time</label>
                    <input
                      type="time"
                      name="checkInTime"
                      value={formData.checkInTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Time</label>
                    <input
                      type="time"
                      name="checkOutTime"
                      value={formData.checkOutTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center space-x-6 col-span-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="smokingAllowed"
                        checked={formData.smokingAllowed}
                        onChange={(e) => setFormData(prev => ({ ...prev, smokingAllowed: e.target.checked }))}
                        className="rounded border-gray-300 text-red-500 focus:ring-red-500 mr-3"
                      />
                      <span className="text-red-600 mr-2">🚬</span>
                      <span className="text-sm font-medium text-gray-700">Smoking Allowed</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="petsAllowed"
                        checked={formData.petsAllowed}
                        onChange={(e) => setFormData(prev => ({ ...prev, petsAllowed: e.target.checked }))}
                        className="rounded border-gray-300 text-red-500 focus:ring-red-500 mr-3"
                      />
                      <span className="text-red-600 mr-2">🐶</span>
                      <span className="text-sm font-medium text-gray-700">Pets Allowed</span>
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Policy</label>
                    <textarea
                      name="cancellationPolicy"
                      value={formData.cancellationPolicy}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Free cancellation up to 24 hours before check-in"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Refund Policy</label>
                    <textarea
                      name="refundPolicy"
                      value={formData.refundPolicy}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Full refund for cancellations made 48 hours in advance"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* 7. Booking Rules */}
              <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-orange-600 mr-3 text-xl">⚙️</span>
                  <span className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm mr-3">7</span>
                  Booking Rules
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Nights Stay</label>
                    <input
                      type="number"
                      name="minNightsStay"
                      value={formData.minNightsStay}
                      onChange={handleInputChange}
                      placeholder="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Nights Stay</label>
                    <input
                      type="number"
                      name="maxNightsStay"
                      value={formData.maxNightsStay}
                      onChange={handleInputChange}
                      placeholder="30"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Advance Booking (Days)</label>
                    <input
                      type="number"
                      name="advanceBookingDays"
                      value={formData.advanceBookingDays}
                      onChange={handleInputChange}
                      placeholder="365"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="instantBooking"
                        checked={formData.instantBooking}
                        onChange={(e) => setFormData(prev => ({ ...prev, instantBooking: e.target.checked }))}
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 mr-3"
                      />
                      <span className="text-sm font-medium text-gray-700">Instant Booking</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 8. Admin Control */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-gray-600 mr-3 text-xl">⚙️</span>
                  <span className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm mr-3">8</span>
                  Admin Control
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                    <input
                      type="number"
                      name="sortOrder"
                      value={formData.sortOrder}
                      onChange={handleInputChange}
                      placeholder="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Created By</label>
                    <input
                      type="text"
                      name="createdBy"
                      value={formData.createdBy}
                      onChange={handleInputChange}
                      placeholder="Admin Name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="roomVisibility"
                        checked={formData.roomVisibility}
                        onChange={(e) => setFormData(prev => ({ ...prev, roomVisibility: e.target.checked }))}
                        className="rounded border-gray-300 text-gray-500 focus:ring-gray-500 mr-3"
                      />
                      <span className="text-gray-600 mr-2">👁️</span>
                      <span className="text-sm font-medium text-gray-700">Room Visible</span>
                    </label>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="featuredRoom"
                        checked={formData.featuredRoom}
                        onChange={(e) => setFormData(prev => ({ ...prev, featuredRoom: e.target.checked }))}
                        className="rounded border-gray-300 text-gray-500 focus:ring-gray-500 mr-3"
                      />
                      <span className="text-yellow-500 mr-2">⭐</span>
                      <span className="text-sm font-medium text-gray-700">Featured Room</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 9. Analytics */}
              <div className="bg-teal-50 p-6 rounded-xl border border-teal-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-teal-600 mr-3 text-xl">📊</span>
                  <span className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm mr-3">9</span>
                  Analytics (Auto-calculated)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-teal-200">
                    <div className="text-2xl font-bold text-teal-600">{formData.totalBookings}</div>
                    <div className="text-sm text-gray-600">Total Bookings</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-teal-200">
                    <div className="text-2xl font-bold text-teal-600">₹{formData.totalRevenue}</div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-teal-200">
                    <div className="text-2xl font-bold text-teal-600">{formData.occupancyRate}%</div>
                    <div className="text-sm text-gray-600">Occupancy Rate</div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 bg-gray-50 -mx-6 px-6 py-4 rounded-b-2xl">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:from-[#B8860B] hover:to-[#D4AF37] cursor-pointer transition-all font-medium shadow-lg hover:shadow-xl"
                >
                  Add Room
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddRoomModal;