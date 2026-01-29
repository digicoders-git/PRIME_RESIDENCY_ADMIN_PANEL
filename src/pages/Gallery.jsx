import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlus, FaTrash, FaEye, FaUpload, FaFilter, FaImages,
  FaCheckCircle, FaTimes, FaLayerGroup, FaSearch, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [lightbox, setLightbox] = useState({ show: false, index: 0 });
  const [uploadModal, setUploadModal] = useState(false);
  const fileInputRef = useRef(null);

  // Initial dummy data
  const initialImages = [
    { id: 1, url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=60&w=800', category: 'Rooms', title: 'Classic Room', size: '1.2 MB', date: '2024-01-15' },
    { id: 2, url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=60&w=800', category: 'Rooms', title: 'Deluxe Suite', size: '2.4 MB', date: '2024-01-12' },
    { id: 3, url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=60&w=800', category: 'Amenities', title: 'Swimming Pool', size: '3.1 MB', date: '2024-01-10' },
    { id: 4, url: 'https://images.unsplash.com/photo-1544124499-58912cbddaad?q=60&w=800', category: 'Restaurant', title: 'Fine Dining', size: '1.8 MB', date: '2024-01-05' },
    { id: 5, url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=60&w=800', category: 'Rooms', title: 'Presidential Suite', size: '4.2 MB', date: '2023-12-28' },
    { id: 6, url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=60&w=800', category: 'Lobby', title: 'Hotel Lobby', size: '2.7 MB', date: '2023-12-20' },
  ];

  const [images, setImages] = useState(() => {
    const saved = localStorage.getItem('hotel_gallery');
    return saved ? JSON.parse(saved) : initialImages;
  });

  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'Rooms',
    files: []
  });

  useEffect(() => {
    localStorage.setItem('hotel_gallery', JSON.stringify(images));
  }, [images]);

  const categories = ['All', 'Rooms', 'Amenities', 'Restaurant', 'Lobby', 'Events'];

  const filteredImages = images.filter(img => {
    const matchesCategory = selectedCategory === 'All' || img.category === selectedCategory;
    const matchesSearch = img.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Analytics
  const stats = {
    total: images.length,
    byCategory: categories.reduce((acc, cat) => {
      if (cat === 'All') return acc;
      acc[cat] = images.filter(img => img.category === cat).length;
      return acc;
    }, {})
  };

  const handleDelete = (id, title) => {
    Swal.fire({
      title: 'Delete Image?',
      text: `Are you sure you want to remove "${title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#111827',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setImages(images.filter(img => img.id !== id));
        toast.success('Image removed from gallery');
      }
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setUploadForm(prev => ({ ...prev, files: [...prev.files, ...newFiles] }));
  };

  const removeUploadFile = (index) => {
    setUploadForm(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const saveUploads = () => {
    if (uploadForm.files.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    const newGalleryItems = uploadForm.files.map((item, idx) => ({
      id: Date.now() + idx,
      url: item.preview, // In real app, this would be the server URL
      title: uploadForm.title || `Image ${images.length + idx + 1}`,
      category: uploadForm.category,
      size: `${(item.file.size / (1024 * 1024)).toFixed(1)} MB`,
      date: new Date().toISOString().split('T')[0]
    }));

    setImages([...newGalleryItems, ...images]);
    toast.success(`${newGalleryItems.length} images uploaded!`);
    setUploadModal(false);
    setUploadForm({ title: '', category: 'Rooms', files: [] });
  };

  const nextImage = () => {
    setLightbox(prev => ({
      ...prev,
      index: (prev.index + 1) % filteredImages.length
    }));
  };

  const prevImage = () => {
    setLightbox(prev => ({
      ...prev,
      index: (prev.index - 1 + filteredImages.length) % filteredImages.length
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1600px] mx-auto space-y-12 pb-12"
    >
      {/* Header & Stats Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 text-left">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Visual Gallery</h1>
          <p className="text-gray-500 font-medium">Manage and showcase the premium aesthetics of Prime Residency.</p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex -space-x-3">
            {images.slice(0, 4).map((img, i) => (
              <img key={i} src={img.url} className="w-12 h-12 rounded-full border-4 border-white object-cover shadow-sm" alt="guest" />
            ))}
            <div className="w-12 h-12 rounded-full border-4 border-white bg-amber-50 flex items-center justify-center text-[10px] font-black text-amber-600 shadow-sm">
              +{images.length > 4 ? images.length - 4 : 0}
            </div>
          </div>
          <button
            onClick={() => setUploadModal(true)}
            className="flex mb-4 items-center px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-[#D4AF37]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <FaUpload className="mr-3" />
            Upload New Media
          </button>
        </div>
      </div>

      {/* Quick Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {categories.map((cat, i) => (
          <motion.div
            key={cat}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedCategory(cat)}
            className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer group ${selectedCategory === cat
              ? 'bg-[#D4AF37] border-transparent shadow-lg shadow-[#D4AF37]/20'
              : 'bg-white border-gray-100 hover:border-[#D4AF37]/40 shadow-sm'
              }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-amber-50 group-hover:text-amber-500'
              }`}>
              {cat === 'All' ? <FaImages size={16} /> : <FaLayerGroup size={14} />}
            </div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${selectedCategory === cat ? 'text-amber-50' : 'text-gray-400'}`}>
              {cat}
            </p>
            <p className={`text-xl font-black mt-1 ${selectedCategory === cat ? 'text-white' : 'text-gray-900'}`}>
              {cat === 'All' ? images.length : stats.byCategory[cat] || 0}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center mt-3 justify-between gap-6 bg-white p-5 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="relative flex-1 min-w-[300px] ">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            placeholder="Search by image title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/20 transition-all font-bold text-gray-700 placeholder:text-gray-300"
          />
        </div>
        <div className="flex items-center gap-3 pr-4">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Displaying:</span>
          <span className="text-sm font-black text-gray-900 bg-gray-100 px-4 py-1.5 rounded-full">{filteredImages.length} Artifacts</span>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 mt-4 gap-6">

        <AnimatePresence mode="popLayout">
          {filteredImages.map((image, index) => (
            <motion.div
              key={image.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="group relative"
            >
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-slate-200 group-hover:-translate-y-2">

                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4 text-left font-serif">
                  <div className="space-y-0.5 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                    <p className="text-[8px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">{image.category}</p>
                    <h3 className="text-xs font-bold text-white tracking-tight truncate">{image.title}</h3>
                  </div>

                  <div className="flex gap-2 mt-3 translate-y-8 group-hover:translate-y-0 transition-transform duration-500 delay-150">
                    <button
                      onClick={() => setLightbox({ show: true, index: images.findIndex(img => img.id === image.id) })}
                      className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white hover:bg-[#D4AF37] transition-all cursor-pointer"
                    >
                      <FaEye size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(image.id, image.title)}
                      className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white hover:bg-rose-500 transition-all cursor-pointer"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightbox.show && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 lg:p-12">
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onClick={() => setLightbox({ ...lightbox, show: false })}
              className="absolute top-8 right-8 w-14 h-14 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-[210] cursor-pointer"
            >
              <FaTimes size={24} />
            </motion.button>

            <button
              onClick={prevImage}
              className="absolute left-8 w-16 h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-[210] cursor-pointer"
            >
              <FaChevronLeft size={24} />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-8 w-16 h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-[210] cursor-pointer"
            >
              <FaChevronRight size={24} />
            </button>

            <motion.div
              key={filteredImages[lightbox.index]?.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-7xl w-full h-full flex flex-col items-center justify-center gap-8"
            >
              <img
                src={filteredImages[lightbox.index]?.url}
                className="max-h-[75vh] w-auto max-w-full rounded-[2rem] shadow-2xl object-contain border border-white/10"
                alt="Preview"
              />
              <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">{filteredImages[lightbox.index]?.category}</p>
                <h2 className="text-3xl font-black text-white tracking-tighter">{filteredImages[lightbox.index]?.title}</h2>
                <p className="text-white/40 text-sm font-medium">Image {lightbox.index + 1} of {filteredImages.length}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh] no-scrollbar"
            >
              <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] p-10 text-white flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black italic tracking-tighter">Media Importer</h3>
                  <p className="text-amber-50 text-xs font-bold uppercase tracking-widest">Add fresh visuals to your digital showcase</p>
                </div>
                <button
                  onClick={() => setUploadModal(false)}
                  className="p-3 hover:bg-white/20 rounded-2xl transition-colors cursor-pointer"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Visual Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Summer Sunset Deck"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/20 transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Category</label>
                    <select
                      value={uploadForm.category}
                      onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/20 transition-all font-black text-xs uppercase tracking-widest cursor-pointer"
                    >
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 text-left block">Drop Media Files</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-3 border-dashed border-gray-100 rounded-[2.5rem] p-12 text-center hover:border-[#D4AF37]/40 hover:bg-amber-50/20 transition-all cursor-pointer group"
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple accept="image/*" hidden />
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300 group-hover:bg-amber-100 group-hover:text-amber-500 group-hover:scale-110 transition-all duration-500">
                      <FaPlus size={24} />
                    </div>
                    <h4 className="text-xl font-black text-gray-900">Select artifacts to upload</h4>
                    <p className="text-gray-400 font-medium text-sm mt-1">Files supported: JPG, PNG, WEBP (Max 10MB each)</p>
                  </div>
                </div>

                {uploadForm.files.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4">
                    {uploadForm.files.map((file, i) => (
                      <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
                        <img src={file.preview} className="w-full h-full object-cover" alt="upload" />
                        <button
                          onClick={() => removeUploadFile(i)}
                          className="absolute top-2 right-2 w-8 h-8 bg-rose-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={saveUploads}
                  disabled={uploadForm.files.length === 0}
                  className="w-full py-6 bg-gray-900 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-black active:scale-[0.98] disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <FaCheckCircle size={16} />
                  Complete Import & Sync
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {filteredImages.length === 0 && (
        <div className="bg-white rounded-[3rem] border-2 border-dashed border-gray-100 py-32 text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
            <FaImages size={40} />
          </div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Gallery is empty</h3>
          <p className="text-gray-500 font-medium max-w-sm mx-auto mt-2">No visuals currently match your specific search or filter criteria.</p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
            className="mt-8 text-[11px] font-black text-[#D4AF37] uppercase tracking-widest hover:underline cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default Gallery;