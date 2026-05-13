import { Bell, Search, Menu, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import NotificationBell from '../NotificationBell';

export default function Topbar() {
  const { user } = useAuthStore();
  const { toggleSidebar } = useUiStore();

  return (
    <header className="h-20 border-b border-slate-800 bg-slate-900/30 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hidden lg:flex"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="relative max-w-md w-full hidden md:flex">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search tasks, users..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <NotificationBell />
        
        <div className="h-8 w-[1px] bg-slate-800 hidden sm:block"></div>
        
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white leading-tight">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.roles?.[0]?.replace('_', ' ') || 'User'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px]">
            <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-slate-400" />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
