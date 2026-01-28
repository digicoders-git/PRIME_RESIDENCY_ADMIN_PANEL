import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaUser, FaCalendarAlt, FaReply, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Reviews = () => {
  const [reviews] = useState([
    { 
      id: 1, 
      guest: 'John Doe', 
      rating: 5, 
      comment: 'Excellent service and beautiful rooms. The staff was very helpful and friendly.',
      date: '2024-01-15',
      room: 'Presidential Suite',
      status: 'Published'
    },
    { 
      id: 2, 
      guest: 'Jane Smith', 
      rating: 4, 
      comment: 'Great experience overall. The amenities were top-notch and the location is perfect.',
      date: '2024-01-12',
      room: 'Deluxe Suite',
      status: 'Pending'
    },
    { 
      id: 3, 
      guest: 'Mike Johnson', 
      rating: 5, 
      comment: 'Outstanding hospitality! Will definitely come back. Highly recommended.',
      date: '2024-01-10',
      room: 'Executive Room',
      status: 'Published'
    },
  ]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} className={`${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  const getStatusColor = (status) => {
    return status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Reviews Management</h1>
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6A87C] cursor-pointer">
          <option>All Reviews</option>
          <option>Published</option>
          <option>Pending</option>
        </select>
      </div>

      <div className="grid gap-6">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#C6A87C] rounded-full flex items-center justify-center">
                  <FaUser className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{review.guest}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex space-x-1">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-gray-500">({review.rating}/5)</span>
                  </div>
                </div>
              </div>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(review.status)}`}>
                {review.status}
              </span>
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <FaCalendarAlt className="mr-1" /> {review.date}
                </span>
                <span>Room: {review.room}</span>
              </div>
              <div className="flex space-x-2">
                <button className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors cursor-pointer">
                  <FaReply className="mr-1" /> Reply
                </button>
                {review.status === 'Pending' && (
                  <button 
                    onClick={() => toast.success('Review published!')}
                    className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors cursor-pointer"
                  >
                    Publish
                  </button>
                )}
                <button className="flex items-center px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors cursor-pointer">
                  <FaTrash className="mr-1" /> Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Reviews;