import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  User as UserIcon, Settings, Moon, Sun,
  Users, LogOut, ChevronRight
} from 'lucide-react';

export default function UserDropdown({ user, isOpen, onClose, layout = 'sidebar' }) {
  const { logout } = useAuthStore();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Position classes based on layout
  const positionClasses = layout === 'sidebar'
    ? "absolute bottom-20 left-6"
    : "relative w-full";

  return (
    <div
      ref={dropdownRef}
      className={`${positionClasses} bg-white rounded-none shadow-2xl border border-slate-200 overflow-hidden z-[100] animate-in slide-in-from-top-2 fade-in duration-200`}
    >
      {/* Header - Circular Icon inside Sharp Box */}
      <div className="p-4 bg-slate-50/80 flex items-center gap-4 border-b border-slate-100">
        <div className="w-12 h-12 rounded-full bg-jeallo-gradient flex items-center justify-center text-white text-lg font-black shadow-md ring-2 ring-white shrink-0">
          {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user?.name?.[0]}
        </div>
        <div className="overflow-hidden">
          <h3 className="text-base font-black text-slate-900 truncate tracking-tight">{user?.name}</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{user?.email}</p>
        </div>
      </div>

      {/* Menu Items - Sharp Corners */}
      <div className="p-1 space-y-0.5">
        <Link
          to="/dashboard/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-all group"
        >
          <UserIcon size={16} className="text-slate-400 group-hover:text-jeallo-primary" />
          <span className="text-sm font-semibold text-slate-600 flex-1">Profile</span>
        </Link>

        <Link
          to="/dashboard/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-all group"
        >
          <Settings size={16} className="text-slate-400 group-hover:text-jeallo-primary" />
          <span className="text-sm font-semibold text-slate-600 flex-1">Account settings</span>
        </Link>

        <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-all group cursor-pointer">
          <Moon size={16} className="text-slate-400 group-hover:text-jeallo-primary" />
          <span className="text-sm font-semibold text-slate-600 flex-1">Theme</span>
          <ChevronRight size={14} className="text-slate-300" />
        </div>

        <div className="h-px bg-slate-100 my-1 mx-2"></div>

        <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-all group cursor-pointer">
          <Users size={16} className="text-slate-400 group-hover:text-jeallo-primary" />
          <span className="text-sm font-semibold text-slate-600 flex-1">Switch account</span>
        </div>

        <button
          onClick={() => { logout(); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-slate-600 hover:text-red-600 transition-all group"
        >
          <LogOut size={16} className="text-slate-400 group-hover:text-red-500" />
          <span className="text-sm font-semibold flex-1 text-left">Log out</span>
        </button>
      </div>
    </div>
  );
}
