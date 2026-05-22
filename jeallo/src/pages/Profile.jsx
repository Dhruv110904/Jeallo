import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
  User, Mail, Building2, Camera, Save, Lock, 
  Fingerprint, ShieldCheck, Phone, MapPin, 
  Calendar, Briefcase, X, Loader2, Key
} from 'lucide-react';
import { useState } from 'react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  password: z.string().min(8, 'New password must be at least 8 characters'),
  password_confirmation: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

export default function Profile() {
  const { user, setAuth, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
    }
  });

  const { 
    register: registerPass, 
    handleSubmit: handleSubmitPass, 
    reset: resetPass,
    formState: { errors: passErrors } 
  } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await api.put(`/v1/users/${user.id}`, data);
      setAuth(response.data.user || response.data, token);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setPasswordLoading(true);
    try {
      await api.put('/v1/me/password', data);
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      resetPass();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    const uploadToast = toast.loading('Uploading photo...');
    try {
      const response = await api.post('/v1/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAuth(response.data.user || response.data, token);
      toast.success('Photo updated!', { id: uploadToast });
    } catch (error) {
      toast.error('Upload failed', { id: uploadToast });
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
            <p className="text-slate-500 font-medium">View and manage your professional identity within Jeallo.</p>
        </div>
        <div className="bg-slate-900 px-6 py-3 rounded-2xl flex items-center gap-4 text-white shadow-xl shadow-slate-900/20">
            <Fingerprint className="w-5 h-5 text-jeallo-orange" />
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Employee ID</p>
                <p className="text-sm font-black">{user?.employee_id}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Avatar & Professional Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-100 p-10 rounded-[3rem] text-center shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-jeallo-primary/5 rounded-bl-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500"></div>
            
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-jeallo-primary uppercase">{user?.name?.charAt(0)}</span>
                )}
              </div>
              <label className="absolute bottom-[-5px] right-[-5px] bg-jeallo-primary hover:bg-jeallo-primary/90 p-3 rounded-2xl shadow-lg shadow-jeallo-primary/20 text-white transition-all hover:scale-110 active:scale-95 cursor-pointer">
                <Camera className="w-4 h-4" />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              </label>
            </div>
            
            <h3 className="text-xl font-black text-slate-900">{user?.name}</h3>
            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{user?.role?.replace('_', ' ')}</p>
            
            <div className="mt-8 pt-8 border-t border-slate-50 space-y-4 text-left">
              <div className="flex items-center gap-3 text-slate-500 text-sm font-bold">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                </div>
                <span>{user?.designation || 'Team Member'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 text-sm font-bold">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-slate-400" />
                </div>
                <span>{user?.department || 'General'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 text-sm font-bold">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-slate-400" />
                </div>
                <span>Joined {user?.joining_date || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="bg-jeallo-gradient p-10 rounded-[3rem] text-white shadow-xl shadow-jeallo-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700"></div>
            <div className="relative z-10">
                <ShieldCheck className="w-10 h-10 mb-4 opacity-80" />
                <h4 className="text-lg font-black leading-tight mb-2">Verified Profile</h4>
                <p className="text-xs font-bold opacity-70 leading-relaxed">Your professional records are verified and synced with the central HR system.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Details */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
                    <div className="w-10 h-10 bg-jeallo-primary/10 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-jeallo-primary" />
                    </div>
                    Personal Information
                </h3>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-sm transition-all shadow-lg shadow-slate-900/20 flex items-center gap-2 hover:bg-slate-800 active:scale-95 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <input 
                  {...register('name')}
                  className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-5 text-slate-900 font-bold focus:ring-2 focus:ring-jeallo-primary/20 outline-none transition-all"
                />
                {errors.name && <p className="text-red-500 text-xs font-bold">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Phone</label>
                <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        {...register('phone')}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-5 text-slate-900 font-bold focus:ring-2 focus:ring-jeallo-primary/20 outline-none transition-all"
                    />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Resident Address</label>
                <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                    <textarea 
                        {...register('address')}
                        rows={3}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-5 text-slate-900 font-bold focus:ring-2 focus:ring-jeallo-primary/20 outline-none transition-all resize-none"
                        placeholder="Enter your current residential address"
                    />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2 opacity-60">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email (Read Only)</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        value={user?.email}
                        readOnly
                        className="w-full bg-slate-100 border-none rounded-2xl py-3.5 pl-12 pr-5 text-slate-600 font-bold outline-none cursor-not-allowed"
                    />
                </div>
              </div>
            </div>
          </form>

          <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-jeallo-orange/10 rounded-2xl flex items-center justify-center">
                            <Lock className="w-6 h-6 text-jeallo-orange" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900">Security & Credentials</h3>
                            <p className="text-sm font-bold text-slate-400">Protect your account with a strong password.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowPasswordModal(true)}
                        className="px-8 py-3 bg-slate-50 hover:bg-slate-100 text-slate-900 font-black rounded-xl border border-slate-100 transition-all flex items-center gap-2"
                    >
                        <Key className="w-4 h-4" />
                        Change Password
                    </button>
                </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-xl font-black text-slate-900">Update Password</h3>
                    <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmitPass(onPasswordSubmit)} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Password</label>
                        <input {...registerPass('current_password')} type="password" required className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-jeallo-primary/20 outline-none" />
                        {passErrors.current_password && <p className="text-red-500 text-xs font-bold">{passErrors.current_password.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Password</label>
                        <input {...registerPass('password')} type="password" required className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-jeallo-primary/20 outline-none" />
                        {passErrors.password && <p className="text-red-500 text-xs font-bold">{passErrors.password.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm New Password</label>
                        <input {...registerPass('password_confirmation')} type="password" required className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-jeallo-primary/20 outline-none" />
                        {passErrors.password_confirmation && <p className="text-red-500 text-xs font-bold">{passErrors.password_confirmation.message}</p>}
                    </div>
                    <button 
                        disabled={passwordLoading}
                        className="w-full bg-jeallo-gradient text-white py-4 rounded-xl font-black shadow-lg shadow-jeallo-primary/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    >
                        {passwordLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
