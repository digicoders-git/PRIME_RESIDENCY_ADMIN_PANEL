import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUpload, FaPlus, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../api/api';

const AddService = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description: '',
        category: 'main',
        icon: '',
        order: 0,
        isActive: true,
        features: ['']
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
                return;
            }
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            if (errors.image) {
                setErrors(prev => ({ ...prev, image: '' }));
            }
        }
    };

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData(prev => ({ ...prev, features: newFeatures }));
    };

    const addFeature = () => {
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, '']
        }));
    };

    const removeFeature = (index) => {
        if (formData.features.length > 1) {
            const newFeatures = formData.features.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, features: newFeatures }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.subtitle.trim()) newErrors.subtitle = 'Subtitle is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!imageFile) newErrors.image = 'Image is required';

        const validFeatures = formData.features.filter(f => f.trim());
        if (validFeatures.length === 0) newErrors.features = 'At least one feature is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Session expired. Please login again.");
            navigate('/login');
            return;
        }

        setLoading(true);
        const formDataToSend = new FormData();

        const validFeatures = formData.features.filter(f => f.trim());

        Object.keys(formData).forEach(key => {
            if (key === 'features') {
                formDataToSend.append(key, JSON.stringify(validFeatures));
            } else {
                formDataToSend.append(key, formData[key]);
            }
        });

        if (imageFile) {
            formDataToSend.append('image', imageFile);
        }


        console.log("Submitting service with token:", token ? "Token present" : "No token");

        try {
            // Explicitly set headers. Content-Type must be undefined for FormData to work correctly (browser sets boundary)
            const { data } = await api.post('/services', formDataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': undefined
                }
            });

            if (data.success) {
                toast.success('Service created successfully!');
                navigate('/services');
            }
        } catch (error) {
            console.error('Error saving service:', error);
            console.log('Error config headers:', error.config?.headers);

            // Handle 401 specifically
            if (error.response && error.response.status === 401) {
                toast.error("Session expired. Please login again.");
                navigate('/login');
            } else {
                const message = error.response?.data?.message || error.message || 'Failed to save service';
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/services')}
                        className="flex items-center text-gray-600 hover:text-[#C6A87C] transition-colors"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Services
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Add New Service</h1>
                        <p className="text-gray-600">Create a new service for your hotel</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C6A87C] focus:border-transparent ${errors.title ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Service title"
                                disabled={loading}
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6A87C] focus:border-transparent"
                                disabled={loading}
                            >
                                <option value="main">Main Service</option>
                                <option value="facility">Facility</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subtitle *
                        </label>
                        <input
                            type="text"
                            name="subtitle"
                            value={formData.subtitle}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C6A87C] focus:border-transparent ${errors.subtitle ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Service subtitle"
                            disabled={loading}
                        />
                        {errors.subtitle && <p className="text-red-500 text-sm mt-1">{errors.subtitle}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C6A87C] focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Service description"
                            disabled={loading}
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Service Image *
                        </label>
                        <div className="space-y-4">
                            {imagePreview && (
                                <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-300">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <FaUpload className="w-10 h-10 mb-4 text-gray-400" />
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        disabled={loading}
                                    />
                                </label>
                            </div>
                        </div>
                        {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                    </div>

                    {/* Additional Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Icon (for facilities)
                            </label>
                            <input
                                type="text"
                                name="icon"
                                value={formData.icon}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6A87C] focus:border-transparent"
                                placeholder="Icon class or URL"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Display Order
                            </label>
                            <input
                                type="number"
                                name="order"
                                value={formData.order}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6A87C] focus:border-transparent"
                                min="0"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Features *
                        </label>
                        <div className="space-y-3">
                            {formData.features.map((feature, index) => (
                                <div key={index} className="flex gap-3">
                                    <input
                                        type="text"
                                        value={feature}
                                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6A87C] focus:border-transparent"
                                        placeholder={`Feature ${index + 1}`}
                                        disabled={loading}
                                    />
                                    {formData.features.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            disabled={loading}
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addFeature}
                                className="flex items-center gap-2 px-4 py-3 text-[#C6A87C] hover:bg-[#C6A87C]/10 rounded-lg transition-colors"
                                disabled={loading}
                            >
                                <FaPlus /> Add Feature
                            </button>
                        </div>
                        {errors.features && <p className="text-red-500 text-sm mt-1">{errors.features}</p>}
                    </div>

                    {/* Status */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="isActive"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-[#C6A87C] focus:ring-[#C6A87C] border-gray-300 rounded"
                            disabled={loading}
                        />
                        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                            Active (visible to users)
                        </label>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => navigate('/services')}
                            className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-[#C6A87C] hover:bg-[#B0956A] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Service'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddService;