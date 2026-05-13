import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { User, Mail, Building2, Briefcase, Camera, Save, Lock } from 'lucide-react';
import { useState } from 'react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  department: z.string().optional(),
  designation: z.string().optional(),
});

export default function Profile() {
  const { user, setAuth, token } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      department: user?.department || '',
      designation: user?.designation || '',
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await api.post('/profile', data);
      setAuth(response.data.data, token);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Account Settings</h1>
        <p className="text-slate-400 mt-1">Manage your public profile and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-3xl text-center shadow-xl">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px]">
                <div className="w-full h-full rounded-[30px] bg-slate-900 flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-slate-700" />
                  )}
                </div>
              </div>
              <button className="absolute bottom-[-10px] right-[-10px] bg-indigo-600 hover:bg-indigo-500 p-3 rounded-2xl shadow-xl border-4 border-[#0f172a] transition-all">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <h3 className="text-xl font-bold text-white">{user?.name}</h3>
            <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest">{user?.roles?.[0]?.replace('_', ' ')}</p>
            
            <div className="mt-8 pt-8 border-t border-slate-800 space-y-4">
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <Building2 className="w-4 h-4" />
                {user?.department || 'No Department'}
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <Mail className="w-4 h-4" />
                {user?.email}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Full Name</label>
                <input 
                  {...register('name')}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                />
                {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Designation</label>
                <input 
                  {...register('designation')}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-400">Department</label>
                <input 
                  {...register('department')}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-400" />
              Security
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-200">Password</p>
                <p className="text-xs text-slate-500 mt-1">Last changed 3 months ago</p>
              </div>
              <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 transition-all">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
