import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaEye, FaUpload } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Gallery = () => {
  const [images] = useState([
    { id: 1, url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=60&w=400', category: 'Rooms', title: 'Classic Room' },
    { id: 2, url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=60&w=400', category: 'Rooms', title: 'Deluxe Suite' },
    { id: 3, url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=60&w=400', category: 'Amenities', title: 'Swimming Pool' },
    { id: 4, url: 'https://images.unsplash.com/photo-1544124499-58912cbddaad?q=60&w=400', category: 'Restaurant', title: 'Fine Dining' },
    { id: 5, url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=60&w=400', category: 'Rooms', title: 'Presidential Suite' },
    { id: 6, url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=60&w=400', category: 'Lobby', title: 'Hotel Lobby' },
  ]);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Rooms', 'Amenities', 'Restaurant', 'Lobby'];

  const filteredImages = selectedCategory === 'All' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
        <button className="flex items-center px-4 py-2 bg-[#C6A87C] text-white rounded-lg hover:bg-[#B8996F] transition-colors cursor-pointer">
          <FaUpload className="mr-2" />
          Upload Images
        </button>
      </div>

      <div className="flex space-x-4 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              selectedCategory === category
                ? 'bg-[#C6A87C] text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImages.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow"
          >
            <div className="relative overflow-hidden">
              <img 
                src={image.url} 
                alt={image.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  <button className="p-2 bg-white/90 rounded-full text-gray-700 hover:bg-white transition-colors cursor-pointer">
                    <FaEye />
                  </button>
                  <button className="p-2 bg-white/90 rounded-full text-red-600 hover:bg-white transition-colors cursor-pointer">
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{image.title}</h3>
              <span className="inline-block px-2 py-1 text-xs bg-[#C6A87C]/10 text-[#C6A87C] rounded-full">
                {image.category}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No images found in this category.</p>
        </div>
      )}
    </motion.div>
  );
};

export default Gallery;