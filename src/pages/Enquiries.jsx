import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaTrash, FaCheck, FaTimes, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import Swal from 'sweetalert2';
import api from '../api/api';

const Enquiries = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        try {
            const res = await api.get('/enquiries');
            setEnquiries(res.data.data);
        } catch (error) {
            console.error('Failed to fetch enquiries', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: 'Delete Enquiry?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/enquiries/${id}`);
                    setEnquiries(enquiries.filter(enq => enq._id !== id));
                    Swal.fire('Deleted!', 'Enquiry has been deleted.', 'success');
                } catch (error) {
                    Swal.fire('Error!', 'Failed to delete enquiry.', 'error');
                }
            }
        });
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`/enquiries/${id}`, { status: newStatus });
            setEnquiries(enquiries.map(enq => enq._id === id ? { ...enq, status: newStatus } : enq));
            // Show subtle toast or notification if needed
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Booked': return 'bg-green-100 text-green-800 border-green-200';
            case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const handleWhatsApp = (enq) => {
        const message = `Halo ${enq.name}, we received your enquiry at Prime Residency for ${enq.roomType || 'a room'} on ${new Date(enq.checkIn).toLocaleDateString()}. How can we assist you further?`;
        window.open(`https://wa.me/${enq.phone}?text=${encodeURIComponent(message)}`, '_blank');
        handleStatusUpdate(enq._id, 'Contacted');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-[1600px] mx-auto"
        >
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Guest Enquiries</h1>
                    <p className="text-sm font-medium text-gray-500 mt-1">Manage all incoming booking requests and queries.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm font-bold text-gray-600">
                        Total: <span className="text-[#D4AF37]">{enquiries.length}</span>
                    </span>
                    <span className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm font-bold text-gray-600">
                        New: <span className="text-blue-600">{enquiries.filter(e => e.status === 'New').length}</span>
                    </span>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    <th className="px-6 py-5">Guest</th>
                                    <th className="px-6 py-5">Stay Details</th>
                                    <th className="px-6 py-5">Contact</th>
                                    <th className="px-6 py-5">Status</th>
                                    <th className="px-6 py-5">Message</th>
                                    <th className="px-6 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {enquiries.map((enq) => (
                                    <tr key={enq._id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-bold text-xs uppercase">
                                                    {enq.name.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{enq.name}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{new Date(enq.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold text-gray-700">{enq.roomType || 'General'}</p>
                                            <p className="text-[10px] text-gray-400">
                                                {enq.guests ? `${enq.guests} Guests` : ''}
                                                {enq.checkIn ? ` • ${new Date(enq.checkIn).toLocaleDateString()}` : ''}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <a href={`tel:${enq.phone}`} className="text-xs font-bold text-gray-700 hover:text-[#D4AF37] transition-colors">{enq.phone}</a>
                                                <a href={`mailto:${enq.email}`} className="text-[10px] text-gray-500 hover:text-[#D4AF37] transition-colors">{enq.email}</a>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={enq.status}
                                                onChange={(e) => handleStatusUpdate(enq._id, e.target.value)}
                                                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border outline-none cursor-pointer appearance-none ${getStatusColor(enq.status)}`}
                                            >
                                                <option value="New">New</option>
                                                <option value="Contacted">Contacted</option>
                                                <option value="Booked">Booked</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <p className="text-xs text-gray-600 truncate" title={enq.message}>{enq.message || '-'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleWhatsApp(enq)}
                                                    className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Chat on WhatsApp"
                                                >
                                                    <FaWhatsapp size={16} />
                                                </button>
                                                <a
                                                    href={`mailto:${enq.email}`}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Send Email"
                                                >
                                                    <FaEnvelope size={14} />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(enq._id)}
                                                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {enquiries.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400 font-medium">
                                            No enquiries found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Enquiries;
