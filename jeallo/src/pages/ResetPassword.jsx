import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Lock, Loader2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

const resetSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: emailParam || ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/v1/reset-password', {
        ...data,
        token
      });
      toast.success('Password reset successful. Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden px-4 font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-jeallo-primary/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-jeallo-orange/5 rounded-full blur-[120px]"></div>
      
      <div className="w-full max-w-md p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-jeallo-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-jeallo-primary/20 mb-4">
            <Lock className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Set New Password</h1>
          <p className="text-slate-500 mt-2 text-center font-medium">Enter your new credentials below.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <input type="hidden" value={token} />
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email Address</label>
            <input
              {...register('email')}
              type="email"
              readOnly={!!emailParam}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 px-4 text-slate-900 focus:ring-0 focus:border-jeallo-primary outline-none transition-all placeholder:text-slate-300 font-medium disabled:opacity-50"
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-2 ml-1 font-bold">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">New Password</label>
            <input
              {...register('password')}
              type="password"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 px-4 text-slate-900 focus:ring-0 focus:border-jeallo-primary outline-none transition-all placeholder:text-slate-300 font-medium"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-2 ml-1 font-bold">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Confirm New Password</label>
            <input
              {...register('password_confirmation')}
              type="password"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 px-4 text-slate-900 focus:ring-0 focus:border-jeallo-primary outline-none transition-all placeholder:text-slate-300 font-medium"
              placeholder="••••••••"
            />
            {errors.password_confirmation && <p className="text-red-500 text-xs mt-2 ml-1 font-bold">{errors.password_confirmation.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-jeallo-gradient text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-jeallo-primary/20 flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-95"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Reset Password
                <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
