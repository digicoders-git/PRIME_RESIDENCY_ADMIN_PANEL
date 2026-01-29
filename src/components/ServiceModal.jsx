import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash, FaImage, FaUpload } from 'react-icons/fa';

const ServiceModal = ({ isOpen, onClose, onSubmit, editingService, loading }) => {
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

    useEffect(() => {
        if (editingService) {
            setFormData({
                title: editingService.title || '',
                subtitle: editingService.subtitle || '',
                description: editingService.description || '',
                category: editingService.category || 'main',
                icon: editingService.icon || '',
                order: editingService.order || 0,
                isActive: editingService.isActive !== undefined ? editingService.isActive : true,
                features: editingService.features && editingService.features.length > 0 ? editingService.features : ['']
            });
            setImagePreview(editingService.image || '');
        } else {
            setFormData({
                title: '',
                subtitle: '',
                description: '',
                category: 'main',
                icon: '',
                order: 0,
                isActive: true,
                features: ['']
            });
            setImagePreview('');
        }
        setImageFile(null);
        setErrors({});
    }, [editingService, isOpen]);

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
        if (!editingService && !imageFile) newErrors.image = 'Image is required';
        
        const validFeatures = formData.features.filter(f => f.trim());
        if (validFeatures.length === 0) newErrors.features = 'At least one feature is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const validFeatures = formData.features.filter(f => f.trim());
        const submitData = {
            ...formData,
            features: validFeatures,
            imageFile
        };

        onSubmit(submitData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {editingService ? 'Edit Service' : 'Add New Service'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        <FaTimes className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C6A87C] focus:border-transparent ${
                                    errors.title ? 'border-red-500' : 'border-gray-300'
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6A87C] focus:border-transparent"
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
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C6A87C] focus:border-transparent ${
                                errors.subtitle ? 'border-red-500' : 'border-gray-300'
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
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C6A87C] focus:border-transparent ${
                                errors.description ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Service description"
                            disabled={loading}
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Service Image {!editingService && '*'}
                        </label>
                        <div className="space-y-4">
                            {imagePreview && (
                                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                        <FaImage className="text-white text-2xl" />
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <FaUpload className="w-8 h-8 mb-4 text-gray-500" />
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Icon (for facilities)
                            </label>
                            <input
                                type="text"
                                name="icon"
                                value={formData.icon}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6A87C] focus:border-transparent"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6A87C] focus:border-transparent"
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
                        <div className="space-y-2">
                            {formData.features.map((feature, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={feature}
                                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6A87C] focus:border-transparent"
                                        placeholder={`Feature ${index + 1}`}
                                        disabled={loading}
                                    />
                                    {formData.features.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                                className="flex items-center gap-2 px-3 py-2 text-[#C6A87C] hover:bg-[#C6A87C]/10 rounded-lg transition-colors"
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
                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-[#C6A87C] hover:bg-[#B0956A] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ServiceModal;