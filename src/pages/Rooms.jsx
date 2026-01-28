import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaEye, FaTh, FaList, FaFilter, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import AddRoomModal from '../components/AddRoomModal';

const Rooms = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState('cards');
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [rooms] = useState([
    { id: 1, name: 'Classic Room', category: 'Standard', price: '3,500', status: 'Available', image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=60&w=300', desc: 'Comfortable and elegant room perfect for business travelers', size: '350 sqft', guests: '2 Adults', bed: 'Queen Size' },
    { id: 2, name: 'Deluxe Suite', category: 'Luxury', price: '6,500', status: 'Occupied', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=60&w=300', desc: 'Spacious suite with premium amenities and city views', size: '500 sqft', guests: '2 Adults, 1 Child', bed: 'King Size' },
    { id: 3, name: 'Presidential Suite', category: 'Luxury', price: '15,000', status: 'Available', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=60&w=300', desc: 'Ultimate luxury with panoramic views and butler service', size: '1200 sqft', guests: '4 Adults', bed: 'King Size + Guest Room' },
    { id: 4, name: 'Family Suite', category: 'Family', price: '10,500', status: 'Maintenance', image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=60&w=300', desc: 'Perfect for families with interconnected rooms', size: '700 sqft', guests: '4 Adults, 2 Children', bed: '2 Queen Size Beds' },
    { id: 5, name: 'Executive Room', category: 'Executive', price: '8,000', status: 'Available', image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=60&w=300', desc: 'Business-focused room with workspace and lounge access', size: '450 sqft', guests: '2 Adults', bed: 'King Size' },
    { id: 6, name: 'Garden Room', category: 'Standard', price: '4,200', status: 'Available', image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=60&w=300', desc: 'Ground floor room with direct garden access', size: '380 sqft', guests: '2 Adults', bed: 'Twin/King' },
  ]);

  const categories = ['All', 'Standard', 'Executive', 'Family', 'Luxury'];

  const filteredRooms = rooms.filter(room => {
    const matchesCategory = filterCategory === 'All' || room.category === filterCategory;
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         room.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDelete = (id, name) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete room "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#D4AF37',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        toast.success('Room deleted successfully!');
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-emerald-100 text-emerald-800';
      case 'Occupied': return 'bg-red-100 text-red-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Standard': return 'bg-blue-100 text-blue-800';
      case 'Executive': return 'bg-purple-100 text-purple-800';
      case 'Family': return 'bg-green-100 text-green-800';
      case 'Luxury': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rooms Management</h1>
          <p className="text-gray-600 mt-1">Manage your hotel rooms and suites</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:from-[#B8860B] hover:to-[#D4AF37] transition-all cursor-pointer shadow-lg hover:shadow-xl"
        >
          <FaPlus className="mr-2" />
          Add New Room
        </button>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] w-full sm:w-64"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer appearance-none bg-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat} Rooms</option>
                ))}
              </select>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center px-4 py-2 rounded-md transition-all cursor-pointer ${
                viewMode === 'cards' 
                  ? 'bg-white text-[#D4AF37] shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaTh className="mr-2" />
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center px-4 py-2 rounded-md transition-all cursor-pointer ${
                viewMode === 'table' 
                  ? 'bg-white text-[#D4AF37] shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaList className="mr-2" />
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredRooms.length} of {rooms.length} rooms
      </div>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
            >
              <div className="relative">
                <img 
                  src={room.image} 
                  alt={room.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(room.status)}`}>
                    {room.status}
                  </span>
                </div>
                <div className="absolute top-3 left-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(room.category)}`}>
                    {room.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                  <span className="text-xl font-bold text-[#D4AF37]">₹{room.price}</span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{room.desc}</p>

                <div className="grid grid-cols-2 gap-3 mb-4 text-xs text-gray-500">
                  <div>Size: <span className="font-medium text-gray-700">{room.size}</span></div>
                  <div>Guests: <span className="font-medium text-gray-700">{room.guests}</span></div>
                  <div className="col-span-2">Bed: <span className="font-medium text-gray-700">{room.bed}</span></div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                      <FaEye />
                    </button>
                    <button className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors cursor-pointer">
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(room.id, room.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">Room #{room.id}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRooms.map((room, index) => (
                  <motion.tr
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img className="h-12 w-12 rounded-lg object-cover" src={room.image} alt={room.name} />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{room.name}</div>
                          <div className="text-sm text-gray-500">Room #{room.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(room.category)}`}>
                        {room.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{room.size} • {room.guests}</div>
                      <div className="text-sm text-gray-500">{room.bed}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-[#D4AF37]">₹{room.price}</div>
                      <div className="text-xs text-gray-500">per night</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(room.status)}`}>
                        {room.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded cursor-pointer">
                          <FaEye />
                        </button>
                        <button className="text-yellow-600 hover:text-yellow-900 p-1 hover:bg-yellow-50 rounded cursor-pointer">
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleDelete(room.id, room.name)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded cursor-pointer"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏨</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
      
      <AddRoomModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
    </motion.div>
  );
};

export default Rooms;