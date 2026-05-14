import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ShieldCheck, Loader2, ArrowRight, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await api.post('/v1/verify-otp', {
        email,
        otp: data.otp,
      });
      // Verification successful, if the API doesn't return a token here, 
      // we might need to log them in or redirect to login.
      // My updated verifyOtp returns user and message, but maybe not a new token.
      // Wait, I should make it return a token if possible, or just ask them to login.
      // Actually, my backend code for verifyOtp returns:
      // return response()->json([
      //     'message' => 'Email verified successfully.',
      //     'user' => new UserResource($user->load('roles')),
      // ]);
      // I'll update the backend to also return a token if it's a seamless flow.
      
      toast.success('Email verified! You can now sign in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-jeallo-primary/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-jeallo-orange/5 rounded-full blur-[120px]"></div>
      
      <div className="w-full max-w-md p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-jeallo-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-jeallo-primary/20 mb-4">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Verify Your Email</h1>
          <p className="text-slate-500 mt-2 text-center font-medium">
            We've sent a 6-digit code to <br />
            <span className="text-jeallo-primary font-bold">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Verification Code</label>
            <input
              {...register('otp')}
              type="text"
              maxLength={6}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 text-center text-3xl font-black tracking-[0.5em] text-slate-900 focus:ring-0 focus:border-jeallo-primary outline-none transition-all placeholder:text-slate-200"
              placeholder="000000"
            />
            {errors.otp && <p className="text-red-400 text-xs mt-2 text-center">{errors.otp.message}</p>}
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
                Verify Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm font-medium">
            Didn't receive the code?{' '}
            <button className="text-jeallo-primary hover:underline font-bold">Resend Code</button>
          </p>
        </div>
      </div>
    </div>
  );
}
