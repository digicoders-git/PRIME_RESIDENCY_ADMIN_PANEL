import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaEnvelope, FaPhone, FaTrash, FaEye, FaFilter, FaSearch,
    FaUser, FaClock, FaCheckCircle, FaExclamationCircle, FaEdit
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import api from '../api/api';

const Contacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContact, setSelectedContact] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/contacts');
            if (data.success) {
                setContacts(data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch contacts');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const { data } = await api.put(`/contacts/${id}/status`, { status: newStatus });
            if (data.success) {
                toast.success(`Status updated to ${newStatus}`);
                fetchContacts();
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = (id, name) => {
        Swal.fire({
            title: 'Delete Contact?',
            text: `Remove message from ${name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#111827',
            cancelButtonColor: '#f43f5e',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const { data } = await api.delete(`/contacts/${id}`);
                    if (data.success) {
                        toast.success('Contact deleted');
                        fetchContacts();
                    }
                } catch (error) {
                    toast.error('Failed to delete contact');
                }
            }
        });
    };

    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.message.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterStatus === 'all') return matchesSearch;
        return matchesSearch && contact.status === filterStatus;
    });

    const stats = {
        total: contacts.length,
        new: contacts.filter(c => c.status === 'New').length,
        inProgress: contacts.filter(c => c.status === 'In Progress').length,
        resolved: contacts.filter(c => c.status === 'Resolved').length
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return 'blue';
            case 'In Progress': return 'yellow';
            case 'Resolved': return 'green';
            case 'Closed': return 'gray';
            default: return 'gray';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Urgent': return 'red';
            case 'High': return 'orange';
            case 'Medium': return 'yellow';
            case 'Low': return 'green';
            default: return 'gray';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[1600px] mx-auto space-y-8 pb-12"
        >
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Contact Messages</h1>
                    <p className="text-gray-500 font-medium mt-1">Manage customer inquiries and support requests</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Messages', value: stats.total, icon: FaEnvelope, color: 'blue' },
                    { label: 'New', value: stats.new, icon: FaExclamationCircle, color: 'blue' },
                    { label: 'In Progress', value: stats.inProgress, icon: FaClock, color: 'yellow' },
                    { label: 'Resolved', value: stats.resolved, icon: FaCheckCircle, color: 'green' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-3xl font-black text-gray-900 mt-2">{stat.value}</p>
                            </div>
                            <div className={`w-14 h-14 bg-${stat.color}-50 rounded-2xl flex items-center justify-center`}>
                                <stat.icon className={`text-${stat.color}-500 text-xl`} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#D4AF37]/20 transition-all font-bold"
                        />
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        {['all', 'New', 'In Progress', 'Resolved', 'Closed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${filterStatus === status
                                        ? 'bg-[#D4AF37] text-white'
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contacts List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredContacts.map((contact, index) => (
                            <motion.div
                                key={contact._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="flex flex-col lg:flex-row gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                    <h3 className="text-lg font-black text-gray-900">{contact.name}</h3>
                                                    <span className={`px-3 py-1 bg-${getStatusColor(contact.status)}-50 text-${getStatusColor(contact.status)}-600 text-xs font-black rounded-full`}>
                                                        {contact.status}
                                                    </span>
                                                    <span className={`px-3 py-1 bg-${getPriorityColor(contact.priority)}-50 text-${getPriorityColor(contact.priority)}-600 text-xs font-black rounded-full`}>
                                                        {contact.priority}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-2 text-sm text-gray-500">
                                                    <div className="flex items-center gap-2">
                                                        <FaEnvelope className="text-xs" />
                                                        <span>{contact.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <FaPhone className="text-xs" />
                                                        <span>{contact.phone}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <h4 className="font-black text-gray-900 mb-2">Subject:</h4>
                                            <p className="text-gray-700">{contact.subject}</p>
                                        </div>

                                        <div className="mb-4">
                                            <h4 className="font-black text-gray-900 mb-2">Message:</h4>
                                            <p className="text-gray-700 leading-relaxed">{contact.message}</p>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <FaClock />
                                            <span>{new Date(contact.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex lg:flex-col gap-3">
                                        <select
                                            value={contact.status}
                                            onChange={(e) => handleStatusChange(contact._id, e.target.value)}
                                            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm cursor-pointer"
                                        >
                                            <option value="New">New</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                        <button
                                            onClick={() => handleDelete(contact._id, contact.name)}
                                            className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all flex items-center gap-2 font-bold text-sm"
                                        >
                                            <FaTrash /> Delete
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredContacts.length === 0 && (
                        <div className="text-center py-20">
                            <FaEnvelope className="text-6xl text-gray-200 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-gray-900 mb-2">No Messages Found</h3>
                            <p className="text-gray-500">No contact messages match your current filters.</p>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default Contacts;
