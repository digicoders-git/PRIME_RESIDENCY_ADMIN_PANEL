import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaStar, FaArrowLeft, FaCheck, FaTrash, FaCalendarAlt, 
  FaEnvelope, FaUser, FaHotel, FaRegStar, FaStarHalfAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import api from '../api/api';

const ReviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReview();
  }, [id]);

  const fetchReview = async () => {
    try {
      const { data } = await api.get(`/reviews/${id}`);
      if (data.success) {
        setReview(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch review details');
      navigate('/reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      const { data } = await api.put(`/reviews/${id}/approve`);
      if (data.success) {
        toast.success('Review approved and published!');
        setReview({ ...review, isApproved: true, isPublished: true });
      }
    } catch (error) {
      toast.error('Failed to approve review');
    }
  };

  const handleDelete = () => {
    Swal.fire({
      title: 'Delete Review?',
      text: `Remove review from ${review.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#111827',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { data } = await api.delete(`/reviews/${id}`);
          if (data.success) {
            toast.success('Review deleted');
            navigate('/reviews');
          }
        } catch (error) {
          toast.error('Failed to delete review');
        }
      }
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-[#D4AF37]" />);
      } else if (i - 0.5 === rating) {
        stars.push(<FaStarHalfAlt key={i} className="text-[#D4AF37]" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-300" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-black text-gray-900 mb-2">Review Not Found</h3>
        <button
          onClick={() => navigate('/reviews')}
          className="px-6 py-3 bg-[#D4AF37] text-white rounded-xl font-bold"
        >
          Back to Reviews
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/reviews')}
          className="p-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-gray-900">Review Details</h1>
          <p className="text-gray-500 font-medium">Complete review information</p>
        </div>
      </div>

      {/* Review Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] p-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/20">
                {review.customerImage ? (
                  <img 
                    src={review.customerImage} 
                    alt={review.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white/20 flex items-center justify-center">
                    <FaUser className="text-3xl text-white" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-black mb-2">{review.name}</h2>
                <div className="flex items-center gap-2 text-white/80 mb-3">
                  <FaEnvelope className="text-sm" />
                  <span>{review.email}</span>
                </div>
                <div className="flex gap-1">
                  {renderStars(review.rating)}
                </div>
              </div>
            </div>
            <div className="text-right">
              {review.isApproved ? (
                <span className="px-4 py-2 bg-green-500 text-white text-sm font-black rounded-full">
                  APPROVED
                </span>
              ) : (
                <span className="px-4 py-2 bg-yellow-500 text-white text-sm font-black rounded-full">
                  PENDING
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="md:col-span-2">
              <h3 className="text-lg font-black text-gray-900 mb-4">Customer Review</h3>
              <div className="bg-gray-50 rounded-2xl p-6">
                <p className="text-gray-700 leading-relaxed text-lg italic">
                  "{review.review}"
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-3">
                  Review Information
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FaCalendarAlt className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Submitted Date</p>
                      <p className="font-bold text-gray-900">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {review.roomType && (
                    <div className="flex items-center gap-3">
                      <FaHotel className="text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Room Type</p>
                        <p className="font-bold text-gray-900">{review.roomType}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <FaStar className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Rating</p>
                      <p className="font-bold text-gray-900">{review.rating}/5 Stars</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-100">
            {!review.isApproved && (
              <button
                onClick={handleApprove}
                className="px-8 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all flex items-center gap-3 font-bold"
              >
                <FaCheck /> Approve Review
              </button>
            )}
            <button
              onClick={handleDelete}
              className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all flex items-center gap-3 font-bold"
            >
              <FaTrash /> Delete Review
            </button>
            <button
              onClick={() => navigate('/reviews')}
              className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-bold ml-auto"
            >
              Back to Reviews
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReviewDetail;