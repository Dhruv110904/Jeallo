import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Mail, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import { useState } from 'react';

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/v1/forgot-password', data);
      setSent(true);
      toast.success('Reset link sent to your email.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden px-4 font-sans">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-jeallo-primary/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-jeallo-orange/5 rounded-full blur-[120px]"></div>
      
      <div className="w-full max-w-md p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-10">
        <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-jeallo-primary transition-colors mb-8 text-xs font-black uppercase tracking-widest group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-jeallo-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-jeallo-primary/20 mb-4">
            <KeyRound className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Forgot Password?</h1>
          <p className="text-slate-500 mt-2 text-center font-medium">No worries, we'll send you reset instructions.</p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register('email')}
                  type="email"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-slate-900 focus:ring-0 focus:border-jeallo-primary outline-none transition-all placeholder:text-slate-300 font-medium"
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-2 ml-1 font-bold">{errors.email.message}</p>}
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
                  Send Reset Link
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Check your email</h3>
            <p className="text-slate-500 text-sm mb-8 font-medium leading-relaxed">
              We've sent a password reset link to your email address. Please check your inbox (and spam folder).
            </p>
            <button 
              onClick={() => setSent(false)} 
              className="text-jeallo-primary hover:underline text-xs font-black uppercase tracking-widest transition-colors"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
