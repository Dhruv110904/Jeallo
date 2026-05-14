import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Loader2, Lock, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';
import leftIllustration from '../assets/auth/left.png';
import rightIllustration from '../assets/auth/right.png';

export default function Auth() {
  const [formData, setFormData] = useState({
    employee_id: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (formData.employee_id.length !== 5) {
      return toast.error('Employee ID must be exactly 5 digits');
    }
    
    setLoading(true);
    try {
      const response = await api.post('/v1/login', {
          employee_id: formData.employee_id,
          password: formData.password
      });
      setAuth(response.data.user, response.data.token);
      toast.success('Welcome back, ' + response.data.user.name);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication failed. Please check your Employee ID and Password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f9fafb] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Illustrations */}
      <div className="hidden lg:block absolute left-0 bottom-0 w-[25%] max-w-[350px] p-6 opacity-90 animate-in slide-in-from-left-10 duration-700">
        <img src={leftIllustration} alt="Collaboration" className="w-full h-auto" />
      </div>
      <div className="hidden lg:block absolute right-0 bottom-0 w-[25%] max-w-[350px] p-6 opacity-90 animate-in slide-in-from-right-10 duration-700">
        <img src={rightIllustration} alt="Productivity" className="w-full h-auto" />
      </div>

      <div className="w-full max-w-[440px] px-6 py-12 z-10">
        <div className="bg-white rounded-md shadow-[0_8px_24px_rgba(149,157,165,0.2)] p-10 border border-slate-100 transition-all duration-300">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-jeallo-gradient rounded-lg flex items-center justify-center shadow-lg shadow-jeallo-primary/20">
                <Target className="text-white w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Jeallo</span>
            </div>
          </div>

          <h1 className="text-center text-slate-700 font-bold text-base mb-6 uppercase tracking-widest">
            Employee Login
          </h1>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Employee ID (5 digits)"
                  value={formData.employee_id}
                  maxLength={5}
                  onChange={(e) => setFormData({...formData, employee_id: e.target.value.replace(/\D/g, '')})}
                  className="w-full border-2 border-slate-200 rounded-sm pl-10 pr-3 py-2.5 text-sm focus:border-jeallo-primary outline-none transition-all placeholder:text-slate-400 font-medium"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full border-2 border-slate-200 rounded-sm pl-10 pr-3 py-2.5 text-sm focus:border-jeallo-primary outline-none transition-all placeholder:text-slate-400 font-medium"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-jeallo-primary hover:bg-jeallo-primary/90 text-white font-bold py-3 rounded-sm transition-all shadow-md flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log In'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-[10px] font-medium leading-relaxed">
              Only authorized employees can access the Jeallo dashboard. 
              Contact your Administrator if you've lost your credentials.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-10 flex flex-col items-center gap-4 opacity-40">
          <div className="flex items-center gap-2 grayscale">
            <Target className="w-4 h-4" />
            <span className="text-sm font-black tracking-tighter uppercase">JEALLO</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <span>Privacy</span>
            <span>Security</span>
            <span>Help Center</span>
            <span>About</span>
          </div>
        </div>
      </div>
    </div>
  );
}
