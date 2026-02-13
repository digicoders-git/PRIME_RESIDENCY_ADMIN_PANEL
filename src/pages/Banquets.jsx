import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaTh, FaList, FaFilter, FaSearch, FaChevronLeft, FaChevronRight, FaBuilding, FaUsers, FaBed, FaGlassCheers } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

import api from '../api/api';

const Banquets = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [viewMode, setViewMode] = useState('table');
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
                // Filter for Banquets and Lawns only
                const filtered = data.data.filter(r => r.category === 'Banquet' || r.category === 'Lawn');

                const mappedRooms = filtered.map(room => ({
                    ...room,
                    id: room._id,
                    category: room.category,
                    type: room.type || 'Standard',
                    desc: room.description || 'No description available',
                    size: room.roomSize ? `${room.roomSize} sq ft` : 'N/A',
                    guests: room.maxAdults ? `${room.maxAdults} Guests` : 'N/A',
                    image: room.image || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=300',
                    floor: room.floorNumber || 'N/A'
                }));
                setRooms(mappedRooms);
            }
        } catch (error) {
            toast.error('Failed to fetch venues');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    const categories = ['All', 'Banquet', 'Lawn'];

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
            text: `Delete venue "${name}"? This action cannot be undone.`,
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
                        toast.success('Venue deleted successfully!');
                    }
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Failed to delete venue');
                }
            }
        });
    };


    const getStatusColor = (status) => {
        switch (status) {
            case 'Available': return 'bg-emerald-100 text-emerald-800';
            case 'Booked': return 'bg-red-100 text-red-800';
            case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'Banquet': return 'bg-purple-100 text-purple-800';
            case 'Lawn': return 'bg-emerald-100 text-emerald-800';
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
                    <p className="mt-4 text-gray-600 font-medium">Fetching venues...</p>
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Banquets & Lawns</h1>
                            <p className="text-gray-600 mt-1">Manage your event spaces and outdoor venues</p>
                        </div>
                        <button
                            onClick={() => navigate('/add-room?category=Banquet')}
                            className="flex items-center px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:from-[#B8860B] hover:to-[#D4AF37] transition-all cursor-pointer shadow-lg hover:shadow-xl"
                        >
                            <FaPlus className="mr-2" />
                            Add New Venue
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
                                        placeholder="Search venues..."
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
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* View Toggle */}
                            <div className="flex bg-gray-100 rounded-lg p-1">
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
                            </div>
                        </div>
                    </div>

                    {/* Table View */}
                    {viewMode === 'table' && (
                        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Venue Identity</th>
                                        <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Category</th>
                                        <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Base Price</th>
                                        <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-8 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {currentRooms.map((room) => (
                                        <motion.tr
                                            key={room.id}
                                            className="group hover:bg-gray-50/50 transition-colors duration-300"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4 text-left">
                                                    <div className="w-14 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
                                                        <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-sm tracking-tight">{room.name}</div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">ID: {room.roomNumber}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getCategoryColor(room.category)}`}>
                                                    {room.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="font-black text-[#D4AF37] text-lg italic">₹{room.price}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${room.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                                    }`}>
                                                    {room.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => navigate(`/room-detail/${room.roomNumber || room.id}`)} className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-blue-600 transition-all cursor-pointer"><FaEye size={12} /></button>
                                                    <button onClick={() => navigate(`/edit-room/${room.roomNumber || room.id}`)} className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-amber-500 transition-all cursor-pointer"><FaEdit size={12} /></button>
                                                    <button onClick={() => handleDelete(room.id, room.name)} className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-rose-500 transition-all cursor-pointer"><FaTrash size={12} /></button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Cards View */}
                    {viewMode === 'cards' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {currentRooms.map((room) => (
                                <div key={room.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col">
                                    <div className="relative h-64 overflow-hidden">
                                        <img src={room.image} alt={room.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${getCategoryColor(room.category)}`}>{room.category}</span>
                                        </div>
                                        <div className="absolute bottom-4 right-4 bg-white/95 px-4 py-2 rounded-xl shadow-lg">
                                            <p className="text-xl font-black text-[#D4AF37]">₹{room.price}</p>
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">{room.name}</h3>
                                        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                            <div className="flex items-center text-gray-600">
                                                <FaUsers className="mr-2 text-[#C68A37]" /> {room.guests}
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <FaBuilding className="mr-2 text-[#C68A37]" /> {room.floor}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-5 border-t border-gray-100 mt-auto gap-3">
                                            <button onClick={() => navigate(`/room-detail/${room.roomNumber || room.id}`)} className="flex-1 py-2.5 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs uppercase tracking-wider hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"><FaEye /> View</button>
                                            <button onClick={() => navigate(`/edit-room/${room.roomNumber || room.id}`)} className="flex-1 py-2.5 rounded-xl bg-amber-50 text-amber-600 font-bold text-xs uppercase tracking-wider hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"><FaEdit /> Edit</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {currentRooms.length === 0 && (
                        <div className="text-center py-20">
                            <FaGlassCheers className="text-6xl text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-400 font-serif text-xl italic">No venues found.</p>
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
};

export default Banquets;
