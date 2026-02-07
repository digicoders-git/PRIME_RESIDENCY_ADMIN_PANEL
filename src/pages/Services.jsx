import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaFilter, FaSort, FaImage, FaStar, FaCog, FaList, FaTh, FaEye, FaHistory, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ServiceCard from '../components/ServiceCard';
import ServiceModal from '../components/ServiceModal';
import ServiceDetailModal from '../components/ServiceDetailModal';

const Services = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [viewingService, setViewingService] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortBy, setSortBy] = useState('order');
    const [viewMode, setViewMode] = useState('grid');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [currentTab, setCurrentTab] = useState('active'); // 'active' or 'history'

    useEffect(() => {
        fetchServices();
    }, []);

    useEffect(() => {
        filterAndSortServices();
    }, [services, searchTerm, filterCategory, sortBy, currentTab]); // Added currentTab dependency

    const filterAndSortServices = () => {
        let filtered = services.filter(service => {
            const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'all' || service.category === filterCategory;

            // Tab filtering
            const matchesTab = currentTab === 'active' ? service.isActive : !service.isActive;

            return matchesSearch && matchesCategory && matchesTab;
        });

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'title': return a.title.localeCompare(b.title);
                case 'category': return a.category.localeCompare(b.category);
                case 'order': return a.order - b.order;
                case 'created': return new Date(b.createdAt) - new Date(a.createdAt);
                default: return 0;
            }
        });

        setFilteredServices(filtered);
    };

    const fetchServices = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/services`);
            if (!response.ok) {
                throw new Error('Backend server not running');
            }
            const data = await response.json();
            if (data.success) {
                setServices(data.data);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
            toast.error('Backend server not running. Please start the backend server.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (submitData) => {
        setSubmitLoading(true);
        const formDataToSend = new FormData();

        Object.keys(submitData).forEach(key => {
            if (key === 'features') {
                formDataToSend.append(key, JSON.stringify(submitData[key]));
            } else if (key === 'imageFile') {
                if (submitData[key]) {
                    formDataToSend.append('image', submitData[key]);
                }
            } else {
                formDataToSend.append(key, submitData[key]);
            }
        });

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login first');
                return;
            }

            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const url = editingService ? `${baseUrl}/services/${editingService._id}` : `${baseUrl}/services`;
            const method = editingService ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                body: formDataToSend,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Request failed');
            }

            const result = await response.json();
            if (result.success) {
                toast.success(editingService ? 'Service updated successfully!' : 'Service created successfully!');
                await fetchServices();
                setShowModal(false);
                setEditingService(null);
            }
        } catch (error) {
            console.error('Error saving service:', error);
            toast.error(error.message || 'Failed to save service');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('Please login first');
                    return;
                }

                const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
                const response = await fetch(`${baseUrl}/services/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Request failed');
                }

                const result = await response.json();
                if (result.success) {
                    toast.success('Service deleted successfully!');
                    fetchServices();
                }
            } catch (error) {
                console.error('Error deleting service:', error);
                toast.error(error.message || 'Failed to delete service');
            }
        }
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setShowModal(true);
    };

    const handleAddNew = () => {
        navigate('/add-service');
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingService(null);
    };

    const handleViewService = (service) => {
        setViewingService(service);
        setShowDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setViewingService(null);
    };

    const toggleServiceStatus = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login first');
                return;
            }

            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const response = await fetch(`${baseUrl}/services/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Request failed');
            }

            const result = await response.json();
            if (result.success) {
                toast.success(`Service ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
                fetchServices();
            }
        } catch (error) {
            console.error('Error toggling service status:', error);
            toast.error(error.message || 'Failed to update service status');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
                        <p className="text-gray-600 mt-1">Manage hotel services and facilities</p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="bg-[#C6A87C] hover:bg-[#B0956A] text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <FaPlus /> Add New Service
                    </button>
                </div>
            </div>

            {/* Filters and Controls */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6A87C] focus:border-transparent"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center gap-2">
                        <FaFilter className="text-gray-400" />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6A87C] focus:border-transparent"
                        >
                            <option value="all">All Categories</option>
                            <option value="main">Main Services</option>
                            <option value="facility">Facilities</option>
                        </select>
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2">
                        <FaSort className="text-gray-400" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6A87C] focus:border-transparent"
                        >
                            <option value="order">Order</option>
                            <option value="title">Title</option>
                            <option value="category">Category</option>
                            <option value="created">Date Created</option>
                        </select>
                    </div>

                    {/* View Mode */}
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-[#C6A87C] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                            <FaTh />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-2 ${viewMode === 'list' ? 'bg-[#C6A87C] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                            <FaList />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Services</p>
                            <p className="text-2xl font-bold text-gray-900">{services.length}</p>
                        </div>
                        <div className="p-3 bg-[#C6A87C]/10 rounded-full">
                            <FaCog className="text-[#C6A87C]" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Main Services</p>
                            <p className="text-2xl font-bold text-gray-900">{services.filter(s => s.category === 'main').length}</p>
                        </div>
                        <div className="p-3 bg-[#B0956A]/10 rounded-full">
                            <FaStar className="text-[#B0956A]" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Facilities</p>
                            <p className="text-2xl font-bold text-gray-900">{services.filter(s => s.category === 'facility').length}</p>
                        </div>
                        <div className="p-3 bg-[#A08660]/10 rounded-full">
                            <FaImage className="text-[#A08660]" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Services</p>
                            <p className="text-2xl font-bold text-gray-900">{services.filter(s => s.isActive).length}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <FaCheckCircle className="text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Inactive History</p>
                            <p className="text-2xl font-bold text-gray-900">{services.filter(s => !s.isActive).length}</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-full">
                            <FaHistory className="text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setCurrentTab('active')}
                    className={`pb-3 px-4 font-medium transition-colors relative ${currentTab === 'active'
                        ? 'text-[#C6A87C] border-b-2 border-[#C6A87C]'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Active Services
                    <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                        {services.filter(s => s.isActive).length}
                    </span>
                </button>
                <button
                    onClick={() => setCurrentTab('history')}
                    className={`pb-3 px-4 font-medium transition-colors relative ${currentTab === 'history'
                        ? 'text-[#C6A87C] border-b-2 border-[#C6A87C]'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Deactivated History
                    <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                        {services.filter(s => !s.isActive).length}
                    </span>
                </button>
            </div>

            {/* Services Grid/List */}
            <div className="bg-white rounded-lg shadow-sm">
                {filteredServices.length === 0 ? (
                    <div className="text-center py-12">
                        <FaImage className="mx-auto text-gray-400 text-4xl mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                        <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6' : 'divide-y divide-gray-200'}>
                        {filteredServices.map((service) => (
                            <ServiceCard
                                key={service._id}
                                service={service}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onToggleStatus={toggleServiceStatus}
                                onView={handleViewService}
                                viewMode={viewMode}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Service Modal */}
            <ServiceModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                editingService={editingService}
                loading={submitLoading}
            />

            {/* Service Detail Modal */}
            <ServiceDetailModal
                isOpen={showDetailModal}
                onClose={handleCloseDetailModal}
                service={viewingService}
            />
        </div >
    );
};

export default Services;