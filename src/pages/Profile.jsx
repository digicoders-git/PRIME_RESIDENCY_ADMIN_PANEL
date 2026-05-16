import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaPhone, FaEnvelope, FaLock, FaCamera, FaBuilding, FaShieldAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../api/api';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingPwd, setChangingPwd] = useState(false);
    const [showCurrentPwd, setShowCurrentPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);
    const fileInputRef = useRef(null);

    const [profileForm, setProfileForm] = useState({ name: '', phone: '', profilePic: '' });
    const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [previewPic, setPreviewPic] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/auth/me');
            if (data.success) {
                setProfile(data.data);
                setProfileForm({
                    name: data.data.name || '',
                    phone: data.data.phone || '',
                    profilePic: data.data.profilePic || ''
                });
                setPreviewPic(data.data.profilePic || '');
            }
        } catch (err) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size must be less than 2MB');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewPic(reader.result);
            setProfileForm(prev => ({ ...prev, profilePic: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        if (!profileForm.name.trim()) {
            toast.error('Name is required');
            return;
        }
        setSaving(true);
        try {
            const { data } = await api.put('/auth/updateprofile', profileForm);
            if (data.success) {
                setProfile(data.data);
                // Update localStorage user data
                const stored = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({ ...stored, name: data.data.name, profilePic: data.data.profilePic }));
                toast.success('Profile updated successfully!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (pwdForm.newPassword !== pwdForm.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (pwdForm.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setChangingPwd(true);
        try {
            const { data } = await api.put('/auth/changepassword', {
                currentPassword: pwdForm.currentPassword,
                newPassword: pwdForm.newPassword
            });
            if (data.success) {
                toast.success('Password changed successfully!');
                setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setChangingPwd(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
            </div>
        );
    }

    const isManager = profile?.role === 'Manager';

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">

            {/* Header */}
            <div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">My Profile</h1>
                <p className="text-gray-500 mt-1">Manage your account details and security settings</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Cover */}
                <div className="h-28 bg-gradient-to-r from-[#D4AF37] to-[#B8860B]" />

                {/* Avatar + Info */}
                <div className="px-8 pb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-14 mb-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-amber-50">
                                {previewPic ? (
                                    <img src={previewPic} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-amber-600 text-4xl font-black uppercase">
                                        {profile?.name?.[0] || 'U'}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 w-9 h-9 bg-[#D4AF37] rounded-xl flex items-center justify-center text-white shadow-lg hover:bg-[#B8860B] transition-all cursor-pointer"
                            >
                                <FaCamera size={14} />
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </div>

                        <div className="flex-1 mt-4 sm:mt-0">
                            <h2 className="text-2xl font-black text-gray-900">{profile?.name}</h2>
                            <div className="flex flex-wrap items-center gap-3 mt-1">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isManager ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                    {profile?.role}
                                </span>
                                {isManager && profile?.property && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-bold text-gray-600">
                                        <FaBuilding size={9} /> {profile.property}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                                <FaEnvelope size={11} /> {profile?.email}
                                <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">Email cannot be changed</span>
                            </p>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <form onSubmit={handleProfileSave} className="space-y-5">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-3">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name *</label>
                                <div className="relative">
                                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={13} />
                                    <input
                                        type="text"
                                        value={profileForm.name}
                                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 text-sm font-medium"
                                        placeholder="Your full name"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                                <div className="relative">
                                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={13} />
                                    <input
                                        type="tel"
                                        value={profileForm.phone}
                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 text-sm font-medium"
                                        placeholder="Your phone number"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={13} />
                                    <input
                                        type="email"
                                        value={profile?.email || ''}
                                        disabled
                                        className="w-full pl-10 pr-4 py-3.5 bg-gray-100 border border-gray-200 rounded-2xl text-sm font-medium text-gray-400 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-2xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                        <FaShieldAlt className="text-rose-500" size={16} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-gray-900">Change Password</h3>
                        <p className="text-xs text-gray-400">Keep your account secure with a strong password</p>
                    </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Current Password</label>
                        <div className="relative">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={13} />
                            <input
                                type={showCurrentPwd ? 'text' : 'password'}
                                value={pwdForm.currentPassword}
                                onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                                className="w-full pl-10 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 text-sm font-medium"
                                placeholder="Enter current password"
                                required
                            />
                            <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                                {showCurrentPwd ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={13} />
                                <input
                                    type={showNewPwd ? 'text' : 'password'}
                                    value={pwdForm.newPassword}
                                    onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                                    className="w-full pl-10 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 text-sm font-medium"
                                    placeholder="Min 6 characters"
                                    required
                                />
                                <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                                    {showNewPwd ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={13} />
                                <input
                                    type={showConfirmPwd ? 'text' : 'password'}
                                    value={pwdForm.confirmPassword}
                                    onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                                    className={`w-full pl-10 pr-12 py-3.5 bg-gray-50 border rounded-2xl focus:outline-none focus:ring-2 text-sm font-medium ${pwdForm.confirmPassword && pwdForm.newPassword !== pwdForm.confirmPassword ? 'border-rose-300 focus:ring-rose-500/30' : 'border-gray-200 focus:ring-rose-500/30 focus:border-rose-400'}`}
                                    placeholder="Re-enter new password"
                                    required
                                />
                                <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                                    {showConfirmPwd ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                </button>
                            </div>
                            {pwdForm.confirmPassword && pwdForm.newPassword !== pwdForm.confirmPassword && (
                                <p className="text-[10px] text-rose-500 mt-1 font-bold">Passwords do not match</p>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={changingPwd || (pwdForm.confirmPassword && pwdForm.newPassword !== pwdForm.confirmPassword)}
                            className="px-8 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-2xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
                        >
                            {changingPwd ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Manager Info (read-only) */}
            {isManager && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-3 mb-5">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: 'Property', value: profile?.property },
                            { label: 'Status', value: profile?.status },
                            { label: 'Joining Date', value: profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '-' },
                            { label: 'Role', value: profile?.role }
                        ].map(item => (
                            <div key={item.label} className="bg-gray-50 rounded-2xl p-4">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                                <p className="text-sm font-black text-gray-900">{item.value || '-'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Profile;
