import api from './api';

// Service API endpoints
export const serviceAPI = {
    // Get all services
    getAllServices: async (category = null) => {
        try {
            const url = category ? `/services?category=${category}` : '/services';
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get service by ID
    getServiceById: async (id) => {
        try {
            const response = await api.get(`/services/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create new service
    createService: async (formData) => {
        try {
            const response = await api.post('/services', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update service
    updateService: async (id, formData) => {
        try {
            const response = await api.put(`/services/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete service
    deleteService: async (id) => {
        try {
            const response = await api.delete(`/services/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Toggle service status
    toggleServiceStatus: async (id, isActive) => {
        try {
            const response = await api.put(`/services/${id}`, { isActive });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default serviceAPI;