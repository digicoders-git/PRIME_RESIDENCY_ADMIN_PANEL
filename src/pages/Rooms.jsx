import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaTh, FaList, FaFilter, FaSearch, FaChevronLeft, FaChevronRight, FaBuilding } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

import api from '../api/api';

const Rooms = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('cards');
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [rooms, setRooms] = useState([]);

  // Load rooms from API on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/rooms');
      if (data.success) {
        // Map _id to id for compatibility with existing code
        const mappedRooms = data.data.map(room => ({
          ...room,
          id: room._id,
          // Handle mock fields if not present in backend
          category: room.type || 'Standard',
          desc: room.description || 'No description available',
          size: room.size || 'N/A',
          guests: room.guests || 'N/A',
          bed: room.bedType || 'N/A',
          image: room.image || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=60&w=300',
          location: room.location || { building: 'N/A', floor: 'N/A', wing: 'N/A', roomNumber: room.roomNumber }
        }));
        setRooms(mappedRooms);
      }
    } catch (error) {
      toast.error('Failed to fetch rooms');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const categories = ['All', 'Standard', 'Executive', 'Family', 'Luxury'];

  const filteredRooms = rooms.filter(room => {
    const matchesCategory = filterCategory === 'All' || room.category === filterCategory;
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRooms = filteredRooms.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleDelete = (id, name) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete room "${name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { data } = await api.delete(`/rooms/${id}`);
          if (data.success) {
            setRooms(prev => prev.filter(r => r.id !== id));
            toast.success('Room deleted successfully!');
          }
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to delete room');
        }
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
      className="max-w-[1600px] mx-auto space-y-12 pb-12"

    >
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
          <p className="mt-4 text-gray-600 font-medium">Fetching rooms...</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rooms Management</h1>
              <p className="text-gray-600 mt-1">Manage your hotel rooms and suites</p>
            </div>
            <button
              onClick={() => navigate('/add-room')}
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
                  className={`flex items-center px-4 py-2 rounded-md transition-all cursor-pointer ${viewMode === 'cards'
                    ? 'bg-white text-[#D4AF37] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <FaTh className="mr-2" />
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center px-4 py-2 rounded-md transition-all cursor-pointer ${viewMode === 'table'
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

          {/* Results Count & Pagination Info */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Showing {startIndex + 1}-{Math.min(endIndex, filteredRooms.length)} of {filteredRooms.length} rooms</span>
            <div className="flex items-center gap-2">
              <span>Show:</span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Cards View */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentRooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all group h-[420px] flex flex-col"
                >
                  <div className="relative h-48 flex-shrink-0">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900 truncate pr-2">{room.name}</h3>
                      <span className="text-xl font-black text-[#D4AF37]">₹{room.price}</span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{room.desc}</p>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-xs text-gray-500">
                      <div>Size: <span className="font-medium text-gray-700">{room.size}</span></div>
                      <div>Guests: <span className="font-medium text-gray-700">{room.guests}</span></div>
                      <div>Room: <span className="font-medium text-gray-700">{room.location?.roomNumber}</span></div>
                      <div>Location: <span className="font-medium text-gray-700">{room.location?.building}</span></div>
                      <div className="col-span-2">Bed: <span className="font-medium text-gray-700">{room.bed}</span></div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/room-detail/${room.roomNumber}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => navigate(`/edit-room/${room.id}`)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors cursor-pointer">
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(room.id, room.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <span className="text-xs text-gray-500">#{room.roomNumber}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Enhanced Table View */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
              <div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Room Identity</th>
                      <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Category</th>
                      <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Location Details</th>
                      <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Price / Night</th>
                      <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Live Status</th>
                      <th className="px-8 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {currentRooms.map((room, index) => (
                      <motion.tr
                        key={room.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group hover:bg-gray-50/50 transition-colors duration-300"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4 text-left">
                            <div className="w-14 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm group-hover:scale-110 transition-transform duration-500">
                              <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-gray-900 truncate text-sm tracking-tight">{room.name}</div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Room #{room.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100/50 bg-blue-50/50 text-blue-600`}>
                            {room.category}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-left">
                            <p className="font-bold text-gray-800 tracking-tight text-xs">{room.location?.building}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{room.location?.floor} • Unit {room.location?.roomNumber}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-left">
                            <p className="font-black text-[#D4AF37] text-lg tabular-nums tracking-tighter italic">₹{room.price}</p>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Gross Rate</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${room.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            room.status === 'Occupied' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${room.status === 'Available' ? 'bg-emerald-500' :
                              room.status === 'Occupied' ? 'bg-rose-500' : 'bg-amber-500'
                              } animate-pulse`}></div>
                            {room.status}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => navigate(`/room-detail/${room.roomNumber}`)}
                              className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-blue-600 hover:border-blue-100 hover:shadow-lg transition-all cursor-pointer"
                            >
                              <FaEye size={12} />
                            </button>

                            <button className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-amber-500 hover:border-amber-100 hover:shadow-lg transition-all cursor-pointer">
                              <FaEdit size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(room.id, room.name)}
                              className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-rose-500 hover:border-rose-100 hover:shadow-lg transition-all cursor-pointer"
                            >
                              <FaTrash size={12} />
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex  justify-between items-center">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <FaChevronLeft className="text-xs" /> Previous
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = Math.max(1, currentPage - 2) + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm rounded-lg ${currentPage === pageNum
                          ? 'bg-[#D4AF37] text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Next <FaChevronRight className="text-xs" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* No Results */}
          {currentRooms.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4 flex justify-center"><FaBuilding /></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default Rooms;