import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FaIcons from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../api/api';

const IconManagement = () => {
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newIcon, setNewIcon] = useState({ name: '', iconName: '', category: 'basic' });
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All Icons' },
    { value: 'basic', label: 'Basic Amenities' },
    { value: 'bathroom', label: 'Bathroom' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'services', label: 'Services' },
    { value: 'facilities', label: 'Facilities' },
    { value: 'security', label: 'Security' },
    { value: 'safety', label: 'Safety' },
    { value: 'accessibility', label: 'Accessibility' },
    { value: 'policies', label: 'Policies' },
    { value: 'room-type', label: 'Room Types' }
  ];

  const availableIcons = [
    { value: 'FaWifi', label: 'Wi-Fi' },
    { value: 'FaSnowflake', label: 'AC' },
    { value: 'FaTv', label: 'TV' },
    { value: 'FaFire', label: 'Geyser' },
    { value: 'FaBatteryFull', label: 'Power Backup' },
    { value: 'FaCube', label: 'Mini Fridge' },
    { value: 'FaShieldAlt', label: 'Safe Locker' },
    { value: 'FaDesktop', label: 'Work Desk' },
    { value: 'FaBed', label: 'Bed' },
    { value: 'FaHome', label: 'Room' },
    { value: 'FaBath', label: 'Bathtub' },
    { value: 'FaShower', label: 'Shower' },
    { value: 'FaChair', label: 'Chair' },
    { value: 'FaCouch', label: 'Sofa' },
    { value: 'FaTable', label: 'Table' },
    { value: 'FaDoorOpen', label: 'Door' },
    { value: 'FaWindowMaximize', label: 'Window' },
    { value: 'FaUtensils', label: 'Utensils' },
    { value: 'FaCoffee', label: 'Coffee Maker' },
    { value: 'FaConciergeBell', label: 'Concierge' },
    { value: 'FaBalanceScale', label: 'Balcony' },
    { value: 'FaCar', label: 'Car Rental' },
    { value: 'FaParking', label: 'Parking' },
    { value: 'FaSwimmingPool', label: 'Swimming Pool' },
    { value: 'FaHotTub', label: 'Hot Tub' },
    { value: 'FaDumbbell', label: 'Gym' },
    { value: 'FaUmbrellaBeach', label: 'Beach Access' },
    { value: 'FaTree', label: 'Garden' },
    { value: 'FaLock', label: 'Lock' },
    { value: 'FaKey', label: 'Key' },
    { value: 'FaFirstAid', label: 'First Aid' },
    { value: 'FaSmokingBan', label: 'No Smoking' },
    { value: 'FaFan', label: 'Fan' },
    { value: 'FaLightbulb', label: 'Lighting' },
    { value: 'FaBroom', label: 'Cleaning' },
    { value: 'FaTrashAlt', label: 'Trash Bin' },
    { value: 'FaPaw', label: 'Pet Friendly' },
    { value: 'FaWheelchair', label: 'Wheelchair Access' },
    { value: 'FaBaby', label: 'Baby Friendly' },
    { value: 'FaUserFriends', label: 'Family Room' },
    { value: 'FaUser', label: 'Single Room' }
  ];

  useEffect(() => {
    fetchIcons();
  }, []);

  const fetchIcons = async () => {
    try {
      const { data } = await api.get('/icons');
      setIcons(data.data || []);
    } catch (error) {
      toast.error('Failed to fetch icons');
    }
  };

  const handleAddIcon = async (e) => {
    e.preventDefault();
    if (!newIcon.name.trim() || !newIcon.iconName) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/icons', newIcon);
      toast.success('Icon added successfully!');
      setNewIcon({ name: '', iconName: '', category: 'basic' });
      fetchIcons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add icon');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIcon = async (id) => {
    if (!window.confirm('Delete this icon?')) return;

    try {
      await api.delete(`/icons/${id}`);
      toast.success('Icon deleted successfully!');
      fetchIcons();
    } catch (error) {
      toast.error('Failed to delete icon');
    }
  };

  const getIconComponent = (iconName) => {
    return FaIcons[iconName] || FaIcons.FaHome;
  };

  const filteredIcons = selectedCategory === 'all' 
    ? icons 
    : icons.filter(icon => icon.category === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white p-6 rounded-xl">
        <h1 className="text-3xl font-bold">Icon Management</h1>
        <p className="text-yellow-100 text-sm mt-1">Add and manage icons for amenities</p>
      </div>

      {/* Add Icon Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Icon</h2>
        <form onSubmit={handleAddIcon} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={newIcon.name}
              onChange={(e) => setNewIcon({ ...newIcon, name: e.target.value })}
              placeholder="Icon display name (e.g., Swimming Pool)"
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
            />
            <select
              value={newIcon.iconName}
              onChange={(e) => setNewIcon({ ...newIcon, iconName: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
            >
              <option value="">Select Icon</option>
              {availableIcons.map(icon => (
                <option key={icon.value} value={icon.value}>
                  {icon.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={newIcon.category}
              onChange={(e) => setNewIcon({ ...newIcon, category: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
            >
              {categories.slice(1).map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            {newIcon.iconName && (
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-600 text-sm">Preview:</span>
                {React.createElement(getIconComponent(newIcon.iconName), {
                  className: 'text-2xl text-[#D4AF37]'
                })}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:from-[#B8860B] hover:to-[#D4AF37] transition-all font-medium disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Icon'}
          </button>
        </form>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === cat.value
                  ? 'bg-[#D4AF37] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Icons List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Icons List ({filteredIcons.length})</h2>
        {filteredIcons.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No icons added yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIcons.map((icon) => {
              const IconComponent = getIconComponent(icon.iconName);
              return (
                <div
                  key={icon._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    {React.createElement(IconComponent, {
                      className: 'text-2xl text-[#D4AF37]'
                    })}
                    <div>
                      <p className="font-medium text-gray-800">{icon.name}</p>
                      <p className="text-xs text-gray-500">{icon.category}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteIcon(icon._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaIcons.FaTrash />
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

export default IconManagement;
