import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaUserTie, FaPhone, FaEnvelope, FaBuilding, FaCheckCircle, FaTimesCircle, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import api from '../api/api';

const Managers = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentManager, setCurrentManager] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    property: 'Prime Residency',
    status: 'Active',
    permissions: {
      checkInOut: false,
      viewBookings: false,
      viewRooms: false,
      billing: false,
      viewHistory: false
    },
    address: '',
    emergencyContact: ''
  });

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/managers');
      if (data.success) {
        setManagers(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch managers');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData };

      // If editing and password is empty, remove it from payload
      if (editMode && !dataToSend.password) {
        delete dataToSend.password;
      }

      if (editMode) {
        const { data } = await api.put(`/managers/${currentManager._id}`, dataToSend);
        if (data.success) {
          toast.success('Manager updated successfully!');
          fetchManagers();
        }
      } else {
        const { data } = await api.post('/managers', dataToSend);
        if (data.success) {
          toast.success('Manager added successfully!');
          fetchManagers();
        }
      }
      closeModal();
    } catch (error) {
      console.error('Manager Operation Error:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (manager) => {
    setCurrentManager(manager);
    setFormData({
      name: manager.name,
      email: manager.email,
      password: '', // Don't populate password for security
      phone: manager.phone,
      property: manager.property,
      status: manager.status,
      permissions: manager.permissions || {
        checkInOut: false,
        viewBookings: false,
        viewRooms: false,
        billing: false,
        viewHistory: false
      },
      address: manager.address || '',
      emergencyContact: manager.emergencyContact || ''
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (id, name) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete manager "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/managers/${id}`);
          toast.success('Manager deleted successfully!');
          fetchManagers();
        } catch (error) {
          console.error('Delete error:', error);
          toast.error(error.response?.data?.message || 'Failed to delete manager');
        }
      }
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setShowPassword(false);
    setEditMode(false);
    setCurrentManager(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      property: 'Prime Residency',
      status: 'Active',
      permissions: {
        checkInOut: false,
        viewBookings: false,
        viewRooms: false,
        billing: false,
        viewHistory: false
      },
      address: '',
      emergencyContact: ''
    });
  };

  const getPropertyColor = (property) => {
    return property === 'Prime Residency'
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-orange-100 text-orange-800 border-orange-200';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Property Managers</h1>
          <p className="text-gray-600 mt-1">Manage property managers and their assignments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:from-[#B8860B] hover:to-[#D4AF37] transition-all cursor-pointer shadow-lg"
        >
          <FaPlus className="mr-2" />
          Add Manager
        </button>
      </div>

      {/* Managers Grid */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {managers.map((manager) => (
            <motion.div
              key={manager._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
            >
              <div className={`h-2 ${manager.property === 'Prime Residency' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-white font-bold text-lg">
                      {manager.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{manager.name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${manager.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {manager.status === 'Active' ? <FaCheckCircle className="mr-1" /> : <FaTimesCircle className="mr-1" />}
                        {manager.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FaBuilding className="mr-2 text-gray-400" />
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${getPropertyColor(manager.property)}`}>
                      {manager.property}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaEnvelope className="mr-2 text-gray-400" />
                    <span className="truncate">{manager.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaPhone className="mr-2 text-gray-400" />
                    <span>{manager.phone}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(manager)}
                    className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(manager._id, manager.name)}
                    className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {managers.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-xl">
          <FaUserTie className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No managers found</h3>
          <p className="text-gray-500">Add your first property manager to get started</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-6">{editMode ? 'Edit Manager' : 'Add New Manager'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password {editMode ? '(Leave empty to keep current)' : '*'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!editMode}
                      minLength="6"
                      placeholder={editMode ? 'Enter new password to change' : 'Minimum 6 characters'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property *</label>
                  <select
                    name="property"
                    value={formData.property}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                  >
                    <option value="Prime Residency">Prime Residency</option>
                    <option value="Prem Kunj">Prem Kunj</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                  <input
                    type="tel"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>

                {/* Permissions Section */}
                <div className="md:col-span-2 border-t pt-4 mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <FaLock className="text-[#D4AF37]" />
                    Access Permissions
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.checkInOut}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, checkInOut: e.target.checked }
                        }))}
                        className="w-4 h-4 text-[#D4AF37] rounded focus:ring-[#D4AF37]"
                      />
                      <span className="text-sm font-medium text-gray-700">Check-in/Check-out</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.viewBookings}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, viewBookings: e.target.checked }
                        }))}
                        className="w-4 h-4 text-[#D4AF37] rounded focus:ring-[#D4AF37]"
                      />
                      <span className="text-sm font-medium text-gray-700">View Bookings</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.viewRooms}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, viewRooms: e.target.checked }
                        }))}
                        className="w-4 h-4 text-[#D4AF37] rounded focus:ring-[#D4AF37]"
                      />
                      <span className="text-sm font-medium text-gray-700">View Rooms</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.billing}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, billing: e.target.checked }
                        }))}
                        className="w-4 h-4 text-[#D4AF37] rounded focus:ring-[#D4AF37]"
                      />
                      <span className="text-sm font-medium text-gray-700">Billing Access</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.viewHistory}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, viewHistory: e.target.checked }
                        }))}
                        className="w-4 h-4 text-[#D4AF37] rounded focus:ring-[#D4AF37]"
                      />
                      <span className="text-sm font-medium text-gray-700">View History</span>
                    </label>
                  </div>
                </div>


              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:from-[#B8860B] hover:to-[#D4AF37] transition-all font-medium"
                >
                  {editMode ? 'Update Manager' : 'Add Manager'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Managers;
