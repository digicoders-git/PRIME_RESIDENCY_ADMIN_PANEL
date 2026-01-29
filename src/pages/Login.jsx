import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import logo from '../assets/logo.png';

import api from '../api/api';

const Login = ({ setIsAuthenticated }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill all fields', { autoClose: 2000 });
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', formData);

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Login successful!', { autoClose: 1500 });

        setTimeout(() => {
          setIsAuthenticated(true);
        }, 500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed', { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Hotel-themed animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        {/* Animated bubbles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#C6A87C]/30 backdrop-blur-sm"
            style={{
              width: Math.random() * 60 + 20 + 'px',
              height: Math.random() * 60 + 20 + 'px',
              left: Math.random() * 100 + '%',
              top: '100%'
            }}
            animate={{
              y: [-100, -window.innerHeight - 100],
              x: [0, Math.random() * 100 - 50],
              scale: [0.5, 1, 0.8, 1.2, 0],
              opacity: [0, 0.6, 0.8, 0.4, 0]
            }}
            transition={{
              duration: Math.random() * 8 + 6,
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 0.8
            }}
          />
        ))}

        {/* Floating hotel icons */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`icon-${i}`}
            className="absolute text-xl opacity-15"
            animate={{
              y: [-10, -30, -10],
              rotate: [0, 5, -5, 0],
              scale: [0.9, 1.1, 0.9]
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.7
            }}
            style={{
              left: (i * 15 + 10) + '%',
              top: (Math.sin(i) * 15 + 40) + '%',
              color: '#D4AF37'
            }}
          >
            {['🏨', '🛏️', '🔑', '⭐', '🍽️', '🛎️'][i]}
          </motion.div>
        ))}

        {/* Elegant waves */}
        <motion.div
          animate={{
            x: [-100, 100, -100],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[#D4AF37]/10 via-[#C6A87C]/20 to-[#D4AF37]/10 transform -skew-y-1"
        />
        <motion.div
          animate={{
            x: [100, -100, 100],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-0 right-0 w-full h-24 bg-gradient-to-l from-[#B8860B]/10 via-[#D4AF37]/15 to-[#B8860B]/10 transform skew-y-1"
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md relative z-10 border border-white/20"
      >
        <div className="text-center mb-6">
          <div className='flex justify-center items-center mx-auto rounded-full bg-slate-200 w-30 h-30 mb-4'>
            <img src={logo} alt="logo" className='w-30 h-30 object-contain' />
          </div>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6A87C] focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className='mt-5'>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6A87C] focus:border-transparent"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>


          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 py-3 bg-[#C6A87C] text-white rounded-lg hover:bg-[#B8996F] transition-colors font-medium cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account? 
            <a href="#" className="text-[#C6A87C] hover:underline ml-1">Contact Administrator</a>
          </p>
        </div> */}

        <div className="flex items-center justify-between mt-6">
          <label className="flex items-center cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 text-[#C6A87C] focus:ring-[#C6A87C]" />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          <a href="#" className="text-sm text-[#C6A87C] hover:underline">Forgot password?</a>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;