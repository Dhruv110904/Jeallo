import { useState } from 'react';
import { Search, Command, ArrowRight, Sparkles, Building2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import NotificationBell from '../NotificationBell';
import UserDropdown from './UserDropdown';

export default function Topbar() {
  const { user } = useAuthStore();
  const { currentWorkspace } = useWorkspaceStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Extract first name for welcome tag
  const firstName = user?.name ? user.name.split(' ')[0] : 'Member';

  return (
    <header className="h-20 border-b border-slate-100/80 bg-white/80 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-[60] shadow-sm shadow-slate-100/10">
      {/* Left Area: Welcome Tag & Active Workspace Pill */}
      <div className="flex items-center gap-6 shrink-0">
        <div className="hidden lg:flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-slate-800">Hey, {firstName}!</span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          </div>
          <p className="text-[10px] text-slate-400 font-bold tracking-tight">Let's build something great today.</p>
        </div>

        {currentWorkspace && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-none shadow-sm hover:border-slate-200 transition-all select-none">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
              {currentWorkspace.name}
            </span>
          </div>
        )}
      </div>

      {/* Middle: Floating Glassmorphic Search Bar */}
      <div className="flex items-center justify-center flex-1 max-w-xl mx-8">
        <div className="relative w-full group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-jeallo-primary transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search projects, tasks, or team members..."
            className="w-full bg-slate-50/50 border border-slate-100 rounded-none py-2.5 pl-12 pr-16 text-slate-850 text-xs font-semibold focus:ring-4 focus:ring-jeallo-primary/5 focus:bg-white focus:border-jeallo-primary/20 outline-none transition-all shadow-inner"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded-md shadow-sm">
             <Command size={8} className="text-slate-400" />
             <span className="text-[8px] font-black text-slate-400 uppercase">K</span>
          </div>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-5 shrink-0">
        {/* Notification Bell Component */}
        <div className="bg-slate-50/80 p-0.5 rounded-none border border-slate-100">
          <NotificationBell />
        </div>

        <div className="w-px h-8 bg-slate-100 hidden md:block"></div>

        {/* Profile Card Trigger */}
        <div className="relative">
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 p-1.5 rounded-none transition-all hover:bg-slate-50 group/profile select-none"
          >
            {/* User Meta text */}
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-black text-slate-850 group-hover/profile:text-jeallo-primary transition-colors">{user?.name}</span>
              <span className="text-[9px] font-black text-slate-400 capitalize tracking-wider">{user?.role?.replace('_', ' ')}</span>
            </div>

            {/* Glowing Avatar */}
            <div className="w-10 h-10 rounded-full bg-jeallo-gradient p-[1.5px] shadow-md shadow-jeallo-primary/10 group-hover/profile:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden ring-1 ring-white">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="font-black text-jeallo-primary text-xs uppercase">{user?.name?.[0]}</div>
                )}
              </div>
            </div>
          </button>

          {/* User Menu Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute top-14 right-0 w-72 bg-white rounded-none shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in slide-in-from-top-4 fade-in duration-350">
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
