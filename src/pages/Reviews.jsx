import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaStar, FaTrash, FaCheck, FaTimes, FaEye, FaFilter, FaSearch,
  FaRegStar, FaStarHalfAlt, FaCalendarAlt, FaUser, FaEnvelope, FaHotel,
  FaTable, FaTh
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import api from '../api/api';

const Reviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reviews');
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const { data } = await api.put(`/reviews/${id}/approve`);
      if (data.success) {
        toast.success('Review approved and published!');
        fetchReviews();
      }
    } catch (error) {
      toast.error('Failed to approve review');
    }
  };

  const handleDelete = (id, name) => {
    Swal.fire({
      title: 'Delete Review?',
      text: `Remove review from ${name}?`,
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
            fetchReviews();
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

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.review.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'approved') return matchesSearch && review.isApproved;
    if (filterStatus === 'pending') return matchesSearch && !review.isApproved;
    return matchesSearch;
  });

  const stats = {
    total: reviews.length,
    approved: reviews.filter(r => r.isApproved).length,
    pending: reviews.filter(r => !r.isApproved).length,
    avgRating: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1600px] mx-auto space-y-8 pb-12"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Customer Reviews</h1>
          <p className="text-gray-500 font-medium mt-1">Manage and moderate customer feedback</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Reviews', value: stats.total, icon: FaStar, color: 'blue' },
          { label: 'Approved', value: stats.approved, icon: FaCheck, color: 'green' },
          { label: 'Pending', value: stats.pending, icon: FaEye, color: 'yellow' },
          { label: 'Avg Rating', value: stats.avgRating, icon: FaStar, color: 'amber' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-black text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`w-14 h-14 bg-${stat.color}-50 rounded-2xl flex items-center justify-center`}>
                <stat.icon className={`text-${stat.color}-500 text-xl`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#D4AF37]/20 transition-all font-bold"
            />
          </div>
          <div className="flex gap-3">
            {['all', 'approved', 'pending'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${filterStatus === status
                    ? 'bg-[#D4AF37] text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
          {/* View Mode Toggle */}
          <div className="flex bg-gray-50 rounded-xl p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                viewMode === 'table'
                  ? 'bg-[#D4AF37] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaTable /> Table
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                viewMode === 'card'
                  ? 'bg-[#D4AF37] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaTh /> Cards
            </button>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
        </div>
      ) : (
        <>
          {viewMode === 'table' ? (
            /* Table View */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Review</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Room Type</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReviews.map((review) => (
                      <tr key={review._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                              {review.customerImage ? (
                                <img 
                                  src={review.customerImage} 
                                  alt={review.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-[#D4AF37]/10 flex items-center justify-center">
                                  <span className="text-sm font-bold text-[#D4AF37]">{review.name.charAt(0)}</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-black text-gray-900">{review.name}</div>
                              <div className="text-sm text-gray-500">{review.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-1">
                            {renderStars(review.rating)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{review.review}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">{review.roomType || '-'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {review.isApproved ? (
                            <span className="px-2 py-1 text-xs font-black bg-green-100 text-green-800 rounded-full">APPROVED</span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-black bg-yellow-100 text-yellow-800 rounded-full">PENDING</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/reviews/${review._id}`)}
                              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-xs font-bold"
                            >
                              View
                            </button>
                            {!review.isApproved && (
                              <button
                                onClick={() => handleApprove(review._id)}
                                className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-xs font-bold"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(review._id, review.name)}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-xs font-bold"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Card View */
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredReviews.map((review, index) => (
                  <motion.div
                    key={review._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Customer Image */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                          {review.customerImage ? (
                            <img 
                              src={review.customerImage} 
                              alt={review.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#D4AF37]/10 flex items-center justify-center">
                              <span className="text-xl font-bold text-[#D4AF37]">{review.name.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-black text-gray-900">{review.name}</h3>
                              {review.isApproved && (
                                <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-black rounded-full">
                                  APPROVED
                                </span>
                              )}
                              {!review.isApproved && (
                                <span className="px-3 py-1 bg-yellow-50 text-yellow-600 text-xs font-black rounded-full">
                                  PENDING
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <FaEnvelope className="text-xs" />
                              <span>{review.email}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {renderStars(review.rating)}
                          </div>
                        </div>

                        <p className="text-gray-700 leading-relaxed mb-4">{review.review}</p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                          {review.roomType && (
                            <div className="flex items-center gap-2">
                              <FaHotel />
                              <span>{review.roomType}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt />
                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex md:flex-col gap-3">
                        <button
                          onClick={() => navigate(`/reviews/${review._id}`)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all flex items-center gap-2 font-bold text-sm"
                        >
                          <FaEye /> View
                        </button>
                        {!review.isApproved && (
                          <button
                            onClick={() => handleApprove(review._id)}
                            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all flex items-center gap-2 font-bold text-sm"
                          >
                            <FaCheck /> Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(review._id, review.name)}
                          className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all flex items-center gap-2 font-bold text-sm"
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {filteredReviews.length === 0 && (
            <div className="text-center py-20">
              <FaStar className="text-6xl text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-black text-gray-900 mb-2">No Reviews Found</h3>
              <p className="text-gray-500">No reviews match your current filters.</p>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default Reviews;