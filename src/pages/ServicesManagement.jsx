import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FaIcons from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../api/api';

const ServicesManagement = () => {
  const [activeTab, setActiveTab] = useState('amenity');
  const [configs, setConfigs] = useState([]);
  const [savedIcons, setSavedIcons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', iconId: '' });

  useEffect(() => {
    fetchConfigs();
    fetchSavedIcons();
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

  const fetchSavedIcons = async () => {
    try {
      const { data } = await api.get('/icons');
      setSavedIcons(data.data || []);
    } catch (error) {
      console.error('Failed to fetch icons:', error);
      setSavedIcons([]);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    if (activeTab === 'amenity' && !newItem.iconId) {
      toast.error('Please select an icon');
      return;
    }

    setLoading(true);
    try {
      const selectedIcon = activeTab === 'amenity' 
        ? savedIcons.find(icon => icon._id === newItem.iconId)
        : null;

      await api.post('/room-config', {
        type: activeTab,
        name: newItem.name.trim(),
        icon: selectedIcon ? selectedIcon.iconName : ''
      });
      toast.success('Added successfully!');
      setNewItem({ name: '', iconId: '' });
      fetchConfigs();
    } catch (error) {
      toast.error('Failed to add');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    toast(
      ({ closeToast }) => (
        <div>
          <p className="mb-2 font-medium">Are you sure you want to delete this item?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                closeToast();
                try {
                  await api.delete(`/room-config/${id}`);
                  toast.success('Deleted successfully!');
                  fetchConfigs();
                } catch {
                  toast.error('Failed to delete');
                }
              }}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm"
            >
              Delete
            </button>
            <button onClick={closeToast} className="px-3 py-1 bg-gray-200 rounded text-sm">
              Cancel
            </button>
          </div>
        </div>
      ),
      { autoClose: false, closeOnClick: false }
    );
  };

  const getIconComponent = (iconName) => {
    return FaIcons[iconName] || FaIcons.FaHome;
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
          <FaIcons.FaWifi className="inline mr-2" />
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
          <FaIcons.FaHome className="inline mr-2" />
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
          <FaIcons.FaBed className="inline mr-2" />
          Bed Types
        </button>
      </div>

      {/* Add New Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          Add New {activeTab === 'amenity' ? 'Amenity' : activeTab === 'roomType' ? 'Room Type' : 'Bed Type'}
        </h2>
        <form onSubmit={handleAdd} className="flex gap-4 flex-wrap">
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            placeholder={`Enter ${activeTab === 'amenity' ? 'amenity' : activeTab === 'roomType' ? 'room type' : 'bed type'} name`}
            className="flex-1 min-w-[200px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
          />
          {activeTab === 'amenity' && (
            <select
              value={newItem.iconId}
              onChange={(e) => setNewItem({ ...newItem, iconId: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] cursor-pointer min-w-[250px]"
            >
              <option value="">Select Icon</option>
              {savedIcons.map(icon => (
                <option key={icon._id} value={icon._id}>
                  {icon.name}
                </option>
              ))}
            </select>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:from-[#B8860B] hover:to-[#D4AF37] transition-all font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <FaIcons.FaPlus />
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
              const IconComponent = item.icon ? getIconComponent(item.icon) : FaIcons.FaHome;
              return (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    {activeTab === 'amenity' && item.icon && (
                      React.createElement(IconComponent, {
                        className: 'text-2xl text-[#D4AF37]'
                      })
                    )}
                    <span className="font-medium text-gray-800">{item.name}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(item._id)}
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

export default ServicesManagement;
