import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaBed, FaHome, FaWifi, FaSnowflake, FaTv, FaFire, FaBalanceScale, FaUtensils, FaBatteryFull, FaCube, FaShieldAlt, FaDesktop } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../api/api';

const ServicesManagement = () => {
  const [activeTab, setActiveTab] = useState('amenity');
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', icon: '' });

  const iconOptions = [
    { value: 'FaWifi', label: 'Wi-Fi', icon: FaWifi },
    { value: 'FaSnowflake', label: 'AC', icon: FaSnowflake },
    { value: 'FaTv', label: 'TV', icon: FaTv },
    { value: 'FaFire', label: 'Geyser', icon: FaFire },
    { value: 'FaBalanceScale', label: 'Balcony', icon: FaBalanceScale },
    { value: 'FaUtensils', label: 'Room Service', icon: FaUtensils },
    { value: 'FaBatteryFull', label: 'Power Backup', icon: FaBatteryFull },
    { value: 'FaCube', label: 'Mini Fridge', icon: FaCube },
    { value: 'FaShieldAlt', label: 'Safe Locker', icon: FaShieldAlt },
    { value: 'FaDesktop', label: 'Work Desk', icon: FaDesktop },
    { value: 'FaBed', label: 'Bed', icon: FaBed },
    { value: 'FaHome', label: 'Room', icon: FaHome }
  ];

  useEffect(() => {
    fetchConfigs();
  }, [activeTab]);

  const fetchConfigs = async () => {
    try {
      const { data } = await api.get('/room-config');
      const filtered = data.data.filter(item => item.type === activeTab);
      setConfigs(filtered);
    } catch (error) {
      toast.error('Failed to fetch data');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    setLoading(true);
    try {
      await api.post('/room-config', {
        type: activeTab,
        name: newItem.name.trim(),
        icon: newItem.icon
      });
      toast.success('Added successfully!');
      setNewItem({ name: '', icon: '' });
      fetchConfigs();
    } catch (error) {
      toast.error('Failed to add');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await api.delete(`/room-config/${id}`);
      toast.success('Deleted successfully!');
      fetchConfigs();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const getIcon = (iconName) => {
    const iconObj = iconOptions.find(opt => opt.value === iconName);
    return iconObj ? iconObj.icon : FaHome;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white p-6 rounded-xl">
        <h1 className="text-3xl font-bold">Services Management</h1>
        <p className="text-yellow-100 text-sm mt-1">Manage amenities, room types, and bed types</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md p-2 flex gap-2">
        <button
          onClick={() => setActiveTab('amenity')}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
            activeTab === 'amenity'
              ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FaWifi className="inline mr-2" />
          Amenities
        </button>
        <button
          onClick={() => setActiveTab('roomType')}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
            activeTab === 'roomType'
              ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FaHome className="inline mr-2" />
          Room Types
        </button>
        <button
          onClick={() => setActiveTab('bedType')}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
            activeTab === 'bedType'
              ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FaBed className="inline mr-2" />
          Bed Types
        </button>
      </div>

      {/* Add New Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          Add New {activeTab === 'amenity' ? 'Amenity' : activeTab === 'roomType' ? 'Room Type' : 'Bed Type'}
        </h2>
        <form onSubmit={handleAdd} className="flex gap-4">
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            placeholder={`Enter ${activeTab === 'amenity' ? 'amenity' : activeTab === 'roomType' ? 'room type' : 'bed type'} name`}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
          />
          {activeTab === 'amenity' && (
            <select
              value={newItem.icon}
              onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
            >
              <option value="">Select Icon (Optional)</option>
              {iconOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:from-[#B8860B] hover:to-[#D4AF37] transition-all font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <FaPlus />
            {loading ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          {activeTab === 'amenity' ? 'Amenities' : activeTab === 'roomType' ? 'Room Types' : 'Bed Types'} List
        </h2>
        {configs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No items added yet. Add your first item above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {configs.map((item) => {
              const IconComponent = item.icon ? getIcon(item.icon) : FaHome;
              return (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    {activeTab === 'amenity' && item.icon && (
                      <IconComponent className="text-2xl text-[#D4AF37]" />
                    )}
                    <span className="font-medium text-gray-800">{item.name}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ServicesManagement;
