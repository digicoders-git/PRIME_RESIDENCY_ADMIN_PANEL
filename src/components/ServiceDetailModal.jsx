import React from 'react';
import { FaTimes, } from 'react-icons/fa';

const ServiceDetailModal = ({ isOpen, onClose, service }) => {
    if (!isOpen || !service) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn">
                <div className="relative">
                    {/* Image Header */}
                    <div className="h-64 h-full">
                        <img
                            src={service.image}
                            alt={service.title}
                            className="w-full h-full object-cover rounded-t-2xl"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors backdrop-blur-md"
                        >
                            <FaTimes size={20} />
                        </button>

                        <div className="absolute bottom-6 left-6 text-white">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${service.category === 'main'
                                        ? 'bg-[#C6A87C] text-black'
                                        : 'bg-white/20 text-white'
                                    }`}>
                                    {service.category}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${service.isActive
                                        ? 'bg-green-500/80 text-white'
                                        : 'bg-red-500/80 text-white'
                                    }`}>
                                    {service.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <h2 className="text-3xl font-serif font-bold">{service.title}</h2>
                            <p className="text-white/80 mt-1 font-light">{service.subtitle}</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Description */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Description</h3>
                        <p className="text-gray-600 leading-relaxed text-lg">{service.description}</p>
                    </div>

                    {/* Features Grid */}
                    {service.features && service.features.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Features & Amenities</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {service.features.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="w-2 h-2 rounded-full bg-[#C6A87C]"></div>
                                        <span className="text-gray-700 font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center gap-8 pt-8 border-t border-gray-100 text-sm text-gray-500">
                        <div>
                            <span className="block font-bold text-gray-900 mb-1">Display Order</span>
                            {service.order}
                        </div>
                        <div>
                            <span className="block font-bold text-gray-900 mb-1">Created On</span>
                            {new Date(service.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                        {service.icon && (
                            <div>
                                <span className="block font-bold text-gray-900 mb-1">Icon Class</span>
                                <code className="bg-gray-100 px-2 py-1 rounded text-xs">{service.icon}</code>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailModal;
