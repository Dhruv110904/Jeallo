import { useState } from 'react';
import { Bell, Search, Settings, User, Command } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import NotificationBell from '../NotificationBell';
import UserDropdown from './UserDropdown';

export default function Topbar() {
  const { user } = useAuthStore();
  const { isSidebarCollapsed } = useUiStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="h-20 border-b border-slate-100 bg-white/90 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-[60]">
      {/* Left: Search Bar */}
      <div className="flex items-center gap-6 flex-1">
        <div className="relative max-w-xl w-full group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-jeallo-primary transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search projects, tasks, or team members..."
            className="w-full bg-slate-50 border border-slate-100 rounded-none py-3 pl-12 pr-16 text-slate-900 text-sm font-medium focus:ring-4 focus:ring-jeallo-primary/5 focus:bg-white focus:border-jeallo-primary/30 outline-none transition-all shadow-sm"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
             <Command size={10} className="text-slate-400" />
             <span className="text-[10px] font-black text-slate-400 uppercase">K</span>
          </div>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* Utility Buttons */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-none border border-slate-100">
            <button className="p-2.5 text-slate-400 hover:text-jeallo-primary hover:bg-white hover:shadow-sm rounded-none transition-all relative group">
                <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
            </button>
            
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            
            <NotificationBell />
        </div>

        <div className="w-px h-10 bg-slate-100 mx-2 hidden md:block"></div>

        {/* Profile Trigger */}
        <div className="relative">
            <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center p-1.5 rounded-none transition-all hover:bg-slate-50 group/profile"
            >
                <div className="w-11 h-11 rounded-full bg-jeallo-gradient p-[2px] shadow-lg shadow-jeallo-primary/20 group-hover/profile:scale-105 transition-transform duration-300">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden ring-2 ring-white">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="font-black text-jeallo-primary text-sm">{user?.name?.[0]}</div>
                        )}
                    </div>
                </div>
            </button>

            {/* Dropdown - adjusted for Topbar placement */}
            {isUserMenuOpen && (
                <div className="absolute top-16 right-0 w-72 bg-white rounded-none shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
                    <UserDropdown 
                        user={user} 
                        isOpen={isUserMenuOpen} 
                        onClose={() => setIsUserMenuOpen(false)} 
                        layout="topbar"
                    />
                </div>
            )}
        </div>
      </div>
    </header>
  );
}
