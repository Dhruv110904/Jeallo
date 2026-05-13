import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Kanban, 
  Calendar, 
  BarChart3, 
  Users, 
  User, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Target
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['super_admin', 'manager', 'employee'] },
  { icon: CheckSquare, label: 'Tasks', path: '/dashboard/tasks', roles: ['super_admin', 'manager', 'employee'] },
  { icon: Kanban, label: 'Kanban', path: '/dashboard/kanban', roles: ['super_admin', 'manager', 'employee'] },
  { icon: Calendar, label: 'Calendar', path: '/dashboard/calendar', roles: ['super_admin', 'manager', 'employee'] },
  { icon: BarChart3, label: 'Reports', path: '/dashboard/reports', roles: ['super_admin', 'manager'] },
  { icon: Users, label: 'Users', path: '/dashboard/users', roles: ['super_admin', 'manager'] },
];

export default function Sidebar() {
  const { role, logout } = useAuthStore();
  const { isSidebarOpen, toggleSidebar } = useUiStore();

  const filteredItems = MENU_ITEMS.filter(item => item.roles.includes(role));

  return (
    <aside className={`bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="min-w-[40px] w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Target className="text-white w-6 h-6" />
          </div>
          {isSidebarOpen && <span className="text-xl font-bold text-white tracking-tight">Jeallo</span>}
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 lg:hidden"
        >
          {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
              ${isActive 
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(79,70,229,0.1)]' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'}
            `}
          >
            <item.icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110`} />
            {isSidebarOpen && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-1">
        <NavLink
          to="/dashboard/profile"
          className={({ isActive }) => `
            flex items-center gap-4 px-4 py-3 rounded-xl transition-all
            ${isActive ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
          `}
        >
          <User className="w-5 h-5" />
          {isSidebarOpen && <span className="font-medium">My Profile</span>}
        </NavLink>
        <button
          onClick={logout}
          className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          {isSidebarOpen && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
