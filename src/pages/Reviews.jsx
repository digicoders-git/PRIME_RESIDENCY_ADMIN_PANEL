import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaStar, FaUser, FaCalendarAlt, FaReply, FaTrash,
  FaFilter, FaSearch, FaCheckCircle, FaClock, FaQuoteLeft,
  FaTimes, FaPaperPlane, FaChartLine, FaStarHalfAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const Reviews = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterRating, setFilterRating] = useState('All');
  const [replyModal, setReplyModal] = useState({ show: false, review: null, text: '' });

  // Initial dummy data
  const initialReviews = [
    {
      id: 'REV-001',
      guest: 'John Doe',
      rating: 5,
      comment: 'Excellent service and beautiful rooms. The staff was very helpful and friendly. The breakfast spread was particularly impressive and the location is perfect for sightseeing.',
      date: '2024-01-15',
      room: 'Presidential Suite',
      status: 'Published',
      reply: 'Thank you for your kind words! We are glad you enjoyed the breakfast.'
    },
    {
      id: 'REV-002',
      guest: 'Jane Smith',
      rating: 4,
      comment: 'Great experience overall. The amenities were top-notch and the location is perfect. Only small issue was the Wi-Fi speed in the evening, but otherwise fantastic.',
      date: '2024-01-12',
      room: 'Deluxe Suite',
      status: 'Pending',
      reply: null
    },
    {
      id: 'REV-003',
      guest: 'Mike Johnson',
      rating: 5,
      comment: 'Outstanding hospitality! Will definitely come back. Highly recommended for couples and families alike. The view from the suite was breathtaking.',
      date: '2024-01-10',
      room: 'Executive Room',
      status: 'Published',
      reply: null
    },
    {
      id: 'REV-004',
      guest: 'Sarah Wilson',
      rating: 3,
      comment: 'Average stay. The room was clean but a bit noisy due to nearby construction. Management was responsive though.',
      date: '2024-01-05',
      room: 'Standard Room',
      status: 'Published',
      reply: 'We apologize for the noise. We are working to improve soundproofing.'
    }
  ];

  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('hotel_reviews');
    return saved ? JSON.parse(saved) : initialReviews;
  });

  useEffect(() => {
    localStorage.setItem('hotel_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Analytics Calculation
  const stats = {
    total: reviews.length,
    average: (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length || 0).toFixed(1),
    pending: reviews.filter(r => r.status === 'Pending').length,
    positive: reviews.filter(r => r.rating >= 4).length
  };

  const renderStars = (rating, size = 10) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} size={size} className={`${i < rating ? 'text-amber-400' : 'text-gray-200'}`} />
    ));
  };

  const getStatusStyle = (status) => {
    return status === 'Published'
      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
      : 'bg-amber-50 text-amber-600 border-amber-100';
  };

  const handleStatusToggle = (id) => {
    setReviews(reviews.map(rev => {
      if (rev.id === id) {
        const newStatus = rev.status === 'Published' ? 'Pending' : 'Published';
        toast.info(`Review status set to ${newStatus}`);
        return { ...rev, status: newStatus };
      }
      return rev;
    }));
  };

  const handleDelete = (id, guest) => {
    Swal.fire({
      title: 'Delete Review?',
      text: `Are you sure you want to remove ${guest}'s feedback?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#111827',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setReviews(reviews.filter(r => r.id !== id));
        toast.success('Review removed successfully');
      }
    });
  };

  const handleReplySubmit = () => {
    if (!replyModal.text.trim()) return;

    setReviews(reviews.map(rev =>
      rev.id === replyModal.review.id
        ? { ...rev, reply: replyModal.text, status: 'Published' }
        : rev
    ));

    toast.success('Reply posted successfully!');
    setReplyModal({ show: false, review: null, text: '' });
  };

  const filteredReviews = reviews.filter(rev => {
    const matchesSearch = rev.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || rev.status === filterStatus;
    const matchesRating = filterRating === 'All' || rev.rating.toString() === filterRating;
    return matchesSearch && matchesStatus && matchesRating;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-10 pb-12"
    >
      {/* Header & Stats Section */}
      <div className="space-y-8 text-left">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Guest Feedback</h1>
            <p className="text-gray-500 font-medium">Manage testimonials and respond to guest experiences.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 mb-3 gap-4 w-full lg:w-auto">
            {[
              { label: 'Total Reviews', value: stats.total, icon: FaQuoteLeft, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Avg Rating', value: stats.average, icon: FaStar, color: 'text-amber-500', bg: 'bg-amber-50' },
              { label: 'Pending', value: stats.pending, icon: FaClock, color: 'text-rose-500', bg: 'bg-rose-50' },
              { label: 'Positive', value: `${((stats.positive / stats.total) * 100 || 0).toFixed(0)}%`, icon: FaChartLine, color: 'text-emerald-500', bg: 'bg-emerald-50' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-2 min-w-[140px]">
                <div className={`w-8 h-8 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                  <p className="text-xl font-black text-gray-900 tabular-nums leading-none">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex mb-4 flex-wrap items-center gap-4 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              placeholder="Search by guest or comment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/20 transition-all font-bold text-gray-700 placeholder:text-gray-300"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/20 font-black text-[11px] text-gray-600 uppercase tracking-widest cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Published">Published</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Rating:</span>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/20 font-black text-[11px] text-gray-600 uppercase tracking-widest cursor-pointer"
            >
              <option value="All">All Stars</option>
              {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Review List */}
      <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Guest Info</th>
                <th className="px-6 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Rating & Content</th>
                <th className="px-6 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-10 py-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {filteredReviews.map((review) => (
                  <motion.tr
                    key={review.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="group hover:bg-slate-50/50 transition-colors duration-500"
                  >
                    <td className="px-10 py-8 align-top">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-400 border border-gray-100 group-hover:from-amber-50 group-hover:to-amber-100/50 group-hover:text-amber-600 transition-all duration-500 relative overflow-hidden">
                          <FaUser size={16} />
                          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
                        </div>
                        <div className="text-left space-y-1">
                          <p className="font-black text-gray-900 tracking-tight text-base leading-none">{review.guest}</p>
                          <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest leading-none">{review.room}</p>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tight pt-1">
                            <FaCalendarAlt size={10} className="text-gray-200" />
                            {new Date(review.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-8 align-top">
                      <div className="space-y-4 max-w-2xl text-left">
                        <div className="flex gap-1">{renderStars(review.rating, 14)}</div>
                        <div className="relative">
                          <FaQuoteLeft className="absolute -left-6 -top-2 text-gray-100 text-3xl opacity-50" />
                          <p className="text-gray-700 leading-relaxed font-bold italic text-[15px] relative z-10">
                            {review.comment}
                          </p>
                        </div>
                        {review.reply && (
                          <div className="mt-4 p-4 bg-emerald-50/50 border-l-4 border-emerald-400 rounded-r-2xl space-y-1">
                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Admin Response</p>
                            <p className="text-sm text-emerald-800 font-medium italic">"{review.reply}"</p>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-8 align-top">
                      <button
                        onClick={() => handleStatusToggle(review.id)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-[9px] font-black uppercase tracking-[0.15em] transition-all cursor-pointer select-none active:scale-95 ${getStatusStyle(review.status)}`}
                      >
                        {review.status === 'Published' ? <FaCheckCircle size={10} /> : <FaClock size={10} />}
                        {review.status}
                      </button>
                    </td>
                    <td className="px-10 py-8 text-center align-top">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => setReplyModal({ show: true, review: review, text: review.reply || '' })}
                          className="w-10 h-10 bg-white border-2 border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 hover:border-blue-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex items-center justify-center"
                          title="Reply to Review"
                        >
                          <FaReply size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(review.id, review.guest)}
                          className="w-10 h-10 bg-white border-2 border-gray-100 rounded-2xl text-gray-400 hover:text-rose-500 hover:border-rose-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex items-center justify-center"
                          title="Delete Review"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {replyModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-[#D4AF37] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <FaQuoteLeft size={80} />
                </div>
                <div className="relative z-10 flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black italic tracking-tighter">Respond to Guest</h3>
                    <p className="text-amber-50 text-xs font-bold uppercase tracking-widest">{replyModal.review?.guest} — {replyModal.review?.room}</p>
                  </div>
                  <button
                    onClick={() => setReplyModal({ show: false, review: null, text: '' })}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
                  >
                    <FaTimes size={18} />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Guest Feedback:</p>
                  <p className="text-gray-700 italic font-medium bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    "{replyModal.review?.comment}"
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Your Response:</label>
                    <span className="text-[9px] font-bold text-gray-400">{replyModal.text.length} / 500 characters</span>
                  </div>
                  <textarea
                    rows="5"
                    value={replyModal.text}
                    onChange={(e) => setReplyModal(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="Type your reply here..."
                    maxLength={500}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-[#D4AF37] focus:ring-0 outline-none transition-all font-bold text-gray-700 resize-none selection:bg-amber-100"
                  ></textarea>
                </div>

                <button
                  onClick={handleReplySubmit}
                  disabled={!replyModal.text.trim()}
                  className="w-full py-5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <FaPaperPlane size={14} />
                  Send Response
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {filteredReviews.length === 0 && (
        <div className="bg-white rounded-[3rem] border-2 border-dashed border-gray-100 py-32 text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
            <FaQuoteLeft size={40} />
          </div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Zero Matches Found</h3>
          <p className="text-gray-500 font-medium max-w-sm mx-auto mt-2">No reviews currently match your specific search criteria or selected filters.</p>
          <button
            onClick={() => { setSearchTerm(''); setFilterStatus('All'); setFilterRating('All'); }}
            className="mt-8 text-[11px] font-black text-[#D4AF37] uppercase tracking-widest hover:underline cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default Reviews;