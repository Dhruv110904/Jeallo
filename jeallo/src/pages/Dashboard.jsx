import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  CheckCircle2, Clock, AlertCircle, TrendingUp, 
  Users as UsersIcon, Briefcase, Calendar as CalendarIcon, ArrowUpRight 
} from 'lucide-react';

const COLORS = ['#6366f1', '#a855f7', '#eab308', '#22c55e', '#ef4444'];

const StatCard = ({ icon: Icon, label, value, color, trend }) => (
  <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-3xl shadow-xl hover:shadow-indigo-500/5 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 transition-transform group-hover:scale-110`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      {trend && (
        <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
          <ArrowUpRight className="w-3 h-3 mr-1" />
          {trend}
        </span>
      )}
    </div>
    <p className="text-slate-400 text-sm font-medium">{label}</p>
    <h3 className="text-3xl font-bold text-white mt-1 tracking-tight">{value}</h3>
  </div>
);

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/reports/overview').then(res => res.data),
  });

  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-32 bg-slate-900 rounded-3xl border border-slate-800"></div>
      ))}
    </div>
  );

  const statusData = Object.entries(stats?.tasks_by_status || {}).map(([name, value]) => ({ 
    name: name.replace('_', ' ').toUpperCase(), 
    value 
  }));

  const priorityData = Object.entries(stats?.tasks_by_priority || {}).map(([name, value]) => ({ 
    name: name.toUpperCase(), 
    value 
  }));

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Project Overview</h1>
          <p className="text-slate-400 mt-1">Real-time task analytics and team performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-slate-800/50 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-700 transition-all">
            Last 30 Days
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all">
            Download Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Briefcase} 
          label="Total Tasks" 
          value={stats?.total || 0} 
          color="bg-indigo-500" 
          trend="+12.5%"
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Completed" 
          value={stats?.completed || 0} 
          color="bg-emerald-500" 
          trend="+8.2%"
        />
        <StatCard 
          icon={Clock} 
          label="In Progress" 
          value={stats?.in_progress || 0} 
          color="bg-amber-500" 
        />
        <StatCard 
          icon={AlertCircle} 
          label="Overdue" 
          value={stats?.overdue || 0} 
          color="bg-red-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Chart */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white tracking-tight">Tasks by Status</h3>
            <div className="p-2 bg-slate-800/50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Chart */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white tracking-tight">Tasks by Priority</h3>
            <div className="p-2 bg-slate-800/50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold text-white">{stats?.total || 0}</span>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Table Placeholder */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white tracking-tight">Team Performance</h3>
          <UsersIcon className="w-5 h-5 text-slate-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-slate-800/30">
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Employee</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Tasks</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Done</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {stats?.employee_stats?.slice(0, 5).map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
                        {employee.name.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-slate-200">{employee.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-center text-sm text-slate-400 font-medium">{employee.total}</td>
                  <td className="px-8 py-4 text-center text-sm text-slate-400 font-medium">{employee.completed}</td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                          style={{ width: `${employee.completion_rate}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-400 w-10">{employee.completion_rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
