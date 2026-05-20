import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaPhone, FaEnvelope, FaLock, FaCamera, FaBuilding, FaShieldAlt, FaEye, FaEyeSlash, FaCalendarAlt, FaIdBadge, FaCheckCircle } from 'react-icons/fa';
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

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/auth/me');
            if (data.success) {
                setProfile(data.data);
                setProfileForm({ name: data.data.name || '', phone: data.data.phone || '', profilePic: data.data.profilePic || '' });
                setPreviewPic(data.data.profilePic || '');
            }
        } catch { toast.error('Failed to load profile'); }
        finally { setLoading(false); }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast.error('Please select a valid image'); return; }
        if (file.size > 2 * 1024 * 1024) { toast.error('Image size must be less than 2MB'); return; }
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewPic(reader.result);
            setProfileForm(prev => ({ ...prev, profilePic: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        if (!profileForm.name.trim()) { toast.error('Name is required'); return; }
        setSaving(true);
        try {
            const { data } = await api.put('/auth/updateprofile', profileForm);
            if (data.success) {
                setProfile(data.data);
                const stored = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({ ...stored, name: data.data.name, profilePic: data.data.profilePic }));
                toast.success('Profile updated successfully!');
            }
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to update profile'); }
        finally { setSaving(false); }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (pwdForm.newPassword !== pwdForm.confirmPassword) { toast.error('New passwords do not match'); return; }
        if (pwdForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setChangingPwd(true);
        try {
            const { data } = await api.put('/auth/changepassword', { currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
            if (data.success) {
                toast.success('Password changed successfully!');
                setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
        finally { setChangingPwd(false); }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
        </div>
    );

    const isManager = profile?.role === 'Manager';
    const isAdmin = profile?.role === 'Admin';

    const InputField = ({ icon: Icon, label, type = 'text', value, onChange, placeholder, disabled, required, rightEl, error }) => (
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
            <div className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={13} />
                <input
                    type={type} value={value} onChange={onChange} placeholder={placeholder}
                    disabled={disabled} required={required}
                    className={`w-full pl-10 ${rightEl ? 'pr-12' : 'pr-4'} py-3 border rounded-xl text-sm font-medium transition-all
                        ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-100' : 'bg-white border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]'}
                        ${error ? 'border-rose-300' : ''}`}
                />
                {rightEl && <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightEl}</div>}
            </div>
            {error && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{error}</p>}
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6 pb-10">

            {/* Hero Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Cover Banner */}
                <div className="relative h-36 bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-[#B8860B]">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }} />
                    <div className="absolute bottom-4 right-6 flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm
                            ${isAdmin ? 'bg-white/20 text-white border border-white/30' : 'bg-white/20 text-white border border-white/30'}`}>
                            {profile?.role}
                        </span>
                        {profile?.status === 'Active' && (
                            <span className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-white border border-emerald-300/30 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
                                <FaCheckCircle size={8} /> Active
                            </span>
                        )}
                    </div>
                </div>

                {/* Avatar + Info Row */}
                <div className="px-8 pb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 -mt-12 mb-8">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-amber-50">
                                {previewPic ? (
                                    <img src={previewPic} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#D4AF37] text-3xl font-black uppercase">
                                        {profile?.name?.[0] || 'U'}
                                    </div>
                                )}
                            </div>
                            <button onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#D4AF37] rounded-xl flex items-center justify-center text-white shadow-lg hover:bg-[#B8860B] transition-all cursor-pointer">
                                <FaCamera size={12} />
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </div>

                        {/* Name + Meta */}
                        <div className="flex-1 pt-2 sm:pt-0">
                            <h2 className="text-2xl font-black text-gray-900 leading-tight">{profile?.name}</h2>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                                    <FaEnvelope size={10} /> {profile?.email}
                                </span>
                                {profile?.phone && (
                                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <FaPhone size={10} /> {profile.phone}
                                    </span>
                                )}
                                {isManager && profile?.property && (
                                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <FaBuilding size={10} /> {profile.property}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Info Chips */}
                        <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                            {[
                                { label: 'Role', value: profile?.role, icon: FaIdBadge },
                                { label: 'Joined', value: profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A', icon: FaCalendarAlt },
                                ...(isManager ? [{ label: 'Property', value: profile?.property || 'N/A', icon: FaBuilding }] : [])
                            ].map(item => (
                                <div key={item.label} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                                    <item.icon className="text-[#D4AF37] mx-auto mb-1" size={13} />
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                                    <p className="text-xs font-black text-gray-800 mt-0.5">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 mb-6" />

                    {/* Profile Form */}
                    <form onSubmit={handleProfileSave}>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Personal Information</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField icon={FaUser} label="Full Name *" value={profileForm.name}
                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                placeholder="Your full name" required />
                            <InputField icon={FaPhone} label="Phone Number" value={profileForm.phone}
                                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                placeholder="Your phone number" />
                            <div className="md:col-span-2">
                                <InputField icon={FaEnvelope} label="Email Address" value={profile?.email || ''} disabled />
                                <p className="text-[10px] text-gray-400 mt-1">Email address cannot be changed</p>
                            </div>
                        </div>
                        <div className="flex justify-end mt-5">
                            <button type="submit" disabled={saving}
                                className="px-7 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-[#D4AF37]/20 transition-all disabled:opacity-60 cursor-pointer">
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center shrink-0">
                        <FaShieldAlt className="text-rose-500" size={16} />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-gray-900">Change Password</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Keep your account secure with a strong password</p>
                    </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <InputField icon={FaLock} label="Current Password"
                        type={showCurrentPwd ? 'text' : 'password'}
                        value={pwdForm.currentPassword}
                        onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                        placeholder="Enter current password" required
                        rightEl={
                            <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                {showCurrentPwd ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                            </button>
                        }
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField icon={FaLock} label="New Password"
                            type={showNewPwd ? 'text' : 'password'}
                            value={pwdForm.newPassword}
                            onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                            placeholder="Min 6 characters" required
                            rightEl={
                                <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                    {showNewPwd ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                </button>
                            }
                        />
                        <InputField icon={FaLock} label="Confirm New Password"
                            type={showConfirmPwd ? 'text' : 'password'}
                            value={pwdForm.confirmPassword}
                            onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                            placeholder="Re-enter new password" required
                            error={pwdForm.confirmPassword && pwdForm.newPassword !== pwdForm.confirmPassword ? 'Passwords do not match' : ''}
                            rightEl={
                                <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                    {showConfirmPwd ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                </button>
                            }
                        />
                    </div>

                    {/* Password strength hint */}
                    {pwdForm.newPassword && (
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                                    pwdForm.newPassword.length >= i * 3
                                        ? i <= 1 ? 'bg-rose-400' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-yellow-400' : 'bg-emerald-400'
                                        : 'bg-gray-100'
                                }`} />
                            ))}
                            <span className="text-[10px] text-gray-400 font-bold shrink-0">
                                {pwdForm.newPassword.length < 4 ? 'Weak' : pwdForm.newPassword.length < 7 ? 'Fair' : pwdForm.newPassword.length < 10 ? 'Good' : 'Strong'}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-end pt-1">
                        <button type="submit"
                            disabled={changingPwd || !!(pwdForm.confirmPassword && pwdForm.newPassword !== pwdForm.confirmPassword)}
                            className="px-7 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-rose-500/20 transition-all disabled:opacity-60 cursor-pointer">
                            {changingPwd ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Account Info (Manager only) */}
            {isManager && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Account Information</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: 'Property', value: profile?.property, icon: FaBuilding },
                            { label: 'Status', value: profile?.status, icon: FaCheckCircle },
                            { label: 'Joining Date', value: profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-', icon: FaCalendarAlt },
                            { label: 'Role', value: profile?.role, icon: FaIdBadge }
                        ].map(item => (
                            <div key={item.label} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                                <item.icon className="text-[#D4AF37] mb-2" size={14} />
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                                <p className="text-sm font-black text-gray-900 mt-1">{item.value || '-'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Profile;
