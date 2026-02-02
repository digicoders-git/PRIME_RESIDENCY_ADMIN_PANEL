import React, { useEffect, useState } from 'react';
import { FaTimes, FaCircle, FaArrowRight, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';

const NotificationModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await api.get('/enquiries');
            // Filter for 'New' status
            const newEnquiries = res.data.data.filter(enq => enq.status === 'New').slice(0, 5);
            setNotifications(newEnquiries);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewAll = () => {
        onClose();
        navigate('/enquiries');
    };

    const handleItemClick = () => {
        // Removed navigation - stay in modal
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-transparent" // Transparent backdrop to close on click outside
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-16 right-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                    >
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                New Enquiries
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                            >
                                <FaTimes size={14} />
                            </button>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mx-auto mb-2"></div>
                                    Loading...
                                </div>
                            ) : notifications.length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification._id}
                                            onClick={handleItemClick}
                                            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-sm text-gray-800 group-hover:text-[#D4AF37] transition-colors">{notification.name}</span>
                                                <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                                                    {new Date(notification.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                                                {notification.roomType} • {notification.guests} Guests
                                            </p>
                                            <p className="text-xs text-gray-400 line-clamp-2 italic bg-gray-50/50 p-2 rounded border border-gray-50">
                                                "{notification.message || 'No message'}"
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                                        <FaEnvelope size={20} />
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium">No new notifications</p>
                                </div>
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                                <button
                                    onClick={handleViewAll}
                                    className="text-xs font-bold text-[#D4AF37] hover:text-[#B8860B] flex items-center justify-center gap-2 uppercase tracking-wider"
                                >
                                    View All Enquiries <FaArrowRight />
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationModal;