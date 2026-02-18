import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import api from '../api/api';

const ResetPassword = ({ setIsAuthenticated }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { resettoken } = useParams();
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!password || !confirmPassword) {
            toast.error('Please fill all fields', { autoClose: 2000 });
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match', { autoClose: 2000 });
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters', { autoClose: 2000 });
            return;
        }

        setLoading(true);
        try {
            const response = await api.put(`/auth/resetpassword/${resettoken}`, { password });

            if (response.data.success) {
                toast.success('Password reset successful! Logging you in...', { autoClose: 2000 });

                localStorage.setItem('token', response.data.token);
                const userData = response.data.user || response.data.data;
                const userRole = userData.role || 'admin';

                localStorage.setItem('user', JSON.stringify({
                    ...userData,
                    role: userRole,
                    isManager: userRole === 'Manager'
                }));

                setTimeout(() => {
                    setIsAuthenticated(true);
                    navigate('/');
                }, 1500);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid or expired token', { autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
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
                    <p className="text-gray-600">Set New Password</p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6A87C] focus:border-transparent"
                                placeholder="Enter new password"
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6A87C] focus:border-transparent"
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full mt-4 py-3 bg-[#C6A87C] text-white rounded-lg hover:bg-[#B8996F] transition-colors font-medium cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
