import React from 'react';
import { FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';

const ServiceCard = ({ service, onEdit, onDelete, onToggleStatus, viewMode = 'grid' }) => {
    if (viewMode === 'list') {
        return (
            <div className="p-6 hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-b-0">
                <div className="flex items-center gap-4">
                    <img 
                        src={service.image} 
                        alt={service.title} 
                        className="w-16 h-16 object-cover rounded-lg shadow-sm" 
                    />
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-lg text-gray-900">{service.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                service.category === 'main' 
                                    ? 'bg-[#C6A87C]/20 text-[#C6A87C]' 
                                    : 'bg-[#B0956A]/20 text-[#B0956A]'
                            }`}>
                                {service.category}
                            </span>
                            <button
                                onClick={() => onToggleStatus(service._id, service.isActive)}
                                className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                                    service.isActive 
                                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                            >
                                {service.isActive ? 'Active' : 'Inactive'}
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{service.subtitle}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{service.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-500">Order: {service.order}</span>
                            <span className="text-xs text-gray-500">
                                Features: {Array.isArray(service.features) ? service.features.length : 0}
                            </span>
                            <span className="text-xs text-gray-500">
                                Created: {new Date(service.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(service)}
                            className="p-2 text-[#C6A87C] hover:bg-[#C6A87C]/10 rounded-lg transition-colors"
                            title="Edit Service"
                        >
                            <FaEdit />
                        </button>
                        <button
                            onClick={() => onToggleStatus(service._id, service.isActive)}
                            className={`p-2 rounded-lg transition-colors ${
                                service.isActive 
                                    ? 'text-green-600 hover:bg-green-50' 
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                            title={service.isActive ? 'Deactivate' : 'Activate'}
                        >
                            {service.isActive ? <FaEye /> : <FaEyeSlash />}
                        </button>
                        <button
                            onClick={() => onDelete(service._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Service"
                        >
                            <FaTrash />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200">
            <div className="relative h-48 overflow-hidden">
                <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute top-3 right-3 flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                        service.category === 'main' 
                            ? 'bg-[#C6A87C]/20 text-[#C6A87C]' 
                            : 'bg-[#B0956A]/20 text-[#B0956A]'
                    }`}>
                        {service.category}
                    </span>
                    <button
                        onClick={() => onToggleStatus(service._id, service.isActive)}
                        className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm transition-colors ${
                            service.isActive 
                                ? 'bg-green-100/90 text-green-800 hover:bg-green-200/90' 
                                : 'bg-red-100/90 text-red-800 hover:bg-red-200/90'
                        }`}
                    >
                        {service.isActive ? 'Active' : 'Inactive'}
                    </button>
                </div>
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">{service.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-1">{service.subtitle}</p>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">{service.description}</p>
                
                {/* Features Preview */}
                {service.features && service.features.length > 0 && (
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                            {service.features.slice(0, 3).map((feature, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                    {feature}
                                </span>
                            ))}
                            {service.features.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                                    +{service.features.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>Order: {service.order}</span>
                        <span>•</span>
                        <span>{new Date(service.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => onEdit(service)}
                            className="p-2 text-[#C6A87C] hover:bg-[#C6A87C]/10 rounded-lg transition-colors"
                            title="Edit Service"
                        >
                            <FaEdit className="text-sm" />
                        </button>
                        <button
                            onClick={() => onToggleStatus(service._id, service.isActive)}
                            className={`p-2 rounded-lg transition-colors ${
                                service.isActive 
                                    ? 'text-green-600 hover:bg-green-50' 
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                            title={service.isActive ? 'Deactivate' : 'Activate'}
                        >
                            {service.isActive ? <FaEye className="text-sm" /> : <FaEyeSlash className="text-sm" />}
                        </button>
                        <button
                            onClick={() => onDelete(service._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Service"
                        >
                            <FaTrash className="text-sm" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceCard;