import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { 
  UserPlus, Search, Mail, Building2, 
  ShieldCheck, MoreVertical, MapPin 
} from 'lucide-react';

export default function Users() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then(res => res.data),
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Team Directory</h1>
          <p className="text-slate-400 mt-1">Manage users, roles and department assignments</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
          <UserPlus className="w-5 h-5" />
          Add Member
        </button>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by name, email, department..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select className="bg-slate-800/50 border border-slate-700 rounded-xl py-2 px-4 text-slate-200 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/50">
            <option>All Departments</option>
            <option>Engineering</option>
            <option>Product</option>
            <option>Design</option>
          </select>
          <select className="bg-slate-800/50 border border-slate-700 rounded-xl py-2 px-4 text-slate-200 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/50">
            <option>All Roles</option>
            <option>Manager</option>
            <option>Employee</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-slate-900 border border-slate-800 rounded-3xl animate-pulse"></div>
          ))
        ) : (
          users?.data.map((user) => (
            <div key={user.id} className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-3xl shadow-xl hover:shadow-indigo-500/5 hover:border-slate-700 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 p-[1px]">
                  <div className="w-full h-full rounded-[15px] bg-slate-900 flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-indigo-400">{user.name.charAt(0)}</span>
                    )}
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-800 rounded-xl text-slate-600 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{user.name}</h3>
              <p className="text-slate-400 text-sm mb-4 font-medium">{user.designation || 'Team Member'}</p>

              <div className="space-y-3 pt-4 border-t border-slate-800/50">
                <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  {user.department || 'General'}
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                  <Mail className="w-4 h-4 text-slate-500" />
                  {user.email}
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span className="capitalize">{user.roles?.[0]?.replace('_', ' ') || 'User'}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button className="flex-1 bg-slate-800/50 hover:bg-slate-800 text-slate-200 py-2 rounded-xl text-xs font-bold transition-all border border-slate-700">
                  View Profile
                </button>
                <button className="px-3 bg-slate-800/50 hover:bg-slate-800 text-slate-200 py-2 rounded-xl border border-slate-700">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
