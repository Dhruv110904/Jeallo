import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { 
  FileDown, TrendingUp, BarChart as BarIcon, 
  PieChart as PieIcon, CheckCircle2, AlertTriangle, Clock, Users, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';

const STATUS_COLORS = {
  todo: '#94a3b8',        // slate-400
  in_progress: '#6366f1', // indigo-500
  in_review: '#f59e0b',   // amber-500
  done: '#10b981',        // emerald-500
  cancelled: '#f43f5e',   // rose-500
};

const PRIORITY_COLORS = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#6366f1',
  low: '#94a3b8',
};

export default function Reports() {
  const { projectId } = useParams();

  // 1. Overview metrics & status/priority counts
  const { data: overviewResponse, isLoading: isOverviewLoading } = useQuery({
    queryKey: ['project-reports-overview', projectId],
    queryFn: () => api.get(`/v1/projects/${projectId}/reports/overview`).then(res => res.data),
  });

  // 2. Sprint completion velocity
  const { data: velocityData, isLoading: isVelocityLoading } = useQuery({
    queryKey: ['project-reports-velocity', projectId],
    queryFn: () => api.get(`/v1/projects/${projectId}/reports/velocity`).then(res => res.data),
  });

  // 3. Project members
  const { data: membersResponse, isLoading: isMembersLoading } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => api.get(`/v1/projects/${projectId}/members`).then(res => res.data.data),
  });

  // 4. Project tasks
  const { data: tasksResponse, isLoading: isTasksLoading } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: () => api.get(`/v1/projects/${projectId}/tasks`).then(res => res.data.data),
  });

  const handleExport = async () => {
    try {
      const response = await api.get(`/v1/projects/${projectId}/reports/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `jeallo-project-${projectId}-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      toast.success('Excel report downloaded successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const isLoading = isOverviewLoading || isVelocityLoading || isMembersLoading || isTasksLoading;

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center text-slate-450 font-black tracking-widest">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-jeallo-primary border-t-transparent rounded-full animate-spin"></div>
          <span>COMPILING ANALYTICS...</span>
        </div>
      </div>
    );
  }

  const stats = overviewResponse?.stats || {};
  const totalTasks = stats.total_tasks || 0;
  const completedTasksCount = stats.completed || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  // Group Pie Data safely
  const pieData = [];
  (overviewResponse?.by_status || []).forEach(item => {
    const lowerStatus = (item.status || '').toLowerCase().trim();
    let name = 'To Do';
    let color = STATUS_COLORS.todo;
    
    if (['done', 'complete', 'completed', 'comlete', 'finished'].includes(lowerStatus)) {
      name = 'Done';
      color = STATUS_COLORS.done;
    } else if (['in progress', 'in_progress', 'doing', 'active'].includes(lowerStatus)) {
      name = 'In Progress';
      color = STATUS_COLORS.in_progress;
    } else if (['in review', 'in_review', 'review', 'testing'].includes(lowerStatus)) {
      name = 'In Review';
      color = STATUS_COLORS.in_review;
    } else if (['todo', 'to do', 'backlog', 'to_do'].includes(lowerStatus)) {
      name = 'To Do';
      color = STATUS_COLORS.todo;
    } else if (['cancelled', 'canceled', 'cancel', 'discarded'].includes(lowerStatus)) {
      name = 'Cancelled';
      color = STATUS_COLORS.cancelled;
    }
    
    const existing = pieData.find(d => d.name === name);
    if (existing) {
      existing.value += item.count;
    } else {
      pieData.push({ name, value: item.count, color });
    }
  });

  // Group Bar Data
  const barData = (overviewResponse?.by_priority || []).map(item => {
    const name = item.priority ? item.priority.charAt(0).toUpperCase() + item.priority.slice(1) : 'Medium';
    const color = PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.medium;
    return { name, count: item.count, fill: color };
  });

  // Dynamically compute employee metrics on active project tasks
  const members = membersResponse || [];
  const tasks = tasksResponse || [];
  
  const employeeStats = members.map(member => {
    const memberTasks = tasks.filter(t => t.assignees?.some(a => a.id === member.id));
    const completed = memberTasks.filter(t => {
      const lower = (t.status || '').toLowerCase().trim();
      return ['done', 'complete', 'completed', 'comlete', 'finished'].includes(lower);
    });
    
    const rate = memberTasks.length > 0 
      ? Math.round((completed.length / memberTasks.length) * 100) 
      : 0;

    return {
      id: member.id,
      name: member.name,
      avatar: member.avatar,
      completed: completed.length,
      total: memberTasks.length,
      completion_rate: rate
    };
  }).sort((a, b) => b.completion_rate - a.completion_rate);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-slate-500 font-medium mt-1">Deep dive into project execution trends, employee metrics, and board velocity</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-3 bg-jeallo-gradient text-white px-6 py-4 rounded-2xl font-black text-sm shadow-xl shadow-jeallo-primary/20 hover:scale-[1.02] active:scale-95 transition-all shrink-0"
        >
          <FileDown className="w-5 h-5" />
          <span>EXPORT TO EXCEL</span>
        </button>
      </div>

      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Completion Rate */}
        <div className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 rounded-bl-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Completion Rate</p>
              <h4 className="text-3xl font-black text-slate-900">{completionRate}%</h4>
            </div>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
          <p className="text-[10px] font-black text-slate-450 uppercase mt-4 tracking-widest">{completedTasksCount} OF {totalTasks} TOTAL TASKS CLOSED</p>
        </div>

        {/* Active Tasks */}
        <div className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-indigo-600/5 rounded-bl-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Active Backlog</p>
              <h4 className="text-3xl font-black text-slate-900">{stats.in_progress || 0}</h4>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-6">
            Tasks currently being processed in progress or pending active review stages.
          </p>
        </div>

        {/* Overdue Tasks */}
        <div className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-500/5 to-rose-600/5 rounded-bl-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
              (stats.overdue || 0) > 0 
                ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' 
                : 'bg-slate-50 text-slate-450 border-slate-200'
            }`}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Overdue Backlog</p>
              <h4 className={`text-3xl font-black ${ (stats.overdue || 0) > 0 ? 'text-rose-500' : 'text-slate-900'}`}>{stats.overdue || 0}</h4>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-6">
            Active items that have missed their due date. Address these blockers immediately.
          </p>
        </div>
      </div>

      {/* Main Visualizations Row */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Status Distribution */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 flex-1 flex flex-col min-h-[420px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Status Distribution</h3>
              <p className="text-xs text-slate-400 font-bold">Workflow progression of all project tasks</p>
            </div>
            <PieIcon className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            {pieData.length === 0 ? (
              <span className="text-xs text-slate-400 font-bold italic">No status data to plot</span>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', fontSize: '11px', fontWeight: 'bold' }} 
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    iconSize={10} 
                    iconType="circle"
                    wrapperStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', paddingTop: '20px' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Priority Counts */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 flex-1 flex flex-col min-h-[420px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Task Priorities</h3>
              <p className="text-xs text-slate-400 font-bold">Severity classification of issue tags</p>
            </div>
            <BarIcon className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            {barData.length === 0 ? (
              <span className="text-xs text-slate-400 font-bold italic">No priority data to plot</span>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Sprint Velocity Row */}
      <div className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-xl shadow-slate-200/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Sprint Velocity</h3>
            <p className="text-xs text-slate-400 font-bold">Committed vs. Completed Story Points per sprint cycle</p>
          </div>
          <Sparkles className="w-5 h-5 text-jeallo-orange" />
        </div>
        <div className="h-[280px]">
          {(!velocityData || velocityData.length === 0) ? (
            <div className="h-full flex items-center justify-center text-slate-400 font-bold text-xs italic">
              Create and complete active sprints to visualize velocity
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCommitted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', fontSize: '11px', fontWeight: 'bold' }} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', paddingTop: '10px' }} />
                <Area type="monotone" name="Committed Points" dataKey="committed" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCommitted)" />
                <Area type="monotone" name="Completed Points" dataKey="completed" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Team Productivity Ranking Table */}
      <div className="bg-white border border-slate-100 rounded-[3rem] shadow-xl shadow-slate-200/40 p-8">
        <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Employee Productivity Ranking</h3>
            <p className="text-xs text-slate-400 font-bold">Completion success rates for all active project team members</p>
          </div>
          <Users className="w-5 h-5 text-slate-450" />
        </div>

        <div className="overflow-x-auto">
          {employeeStats.length === 0 ? (
            <p className="text-center text-slate-400 font-bold py-6 text-xs italic">No project assignees registered yet</p>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-450">
                  <th className="px-6 pb-2">Member</th>
                  <th className="px-6 pb-2">Status</th>
                  <th className="px-6 pb-2">Task Ratio</th>
                  <th className="px-6 pb-2">Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {employeeStats.map((emp, idx) => (
                  <tr key={emp.id} className="bg-slate-50/50 hover:bg-slate-50/90 transition-all">
                    <td className="px-6 py-4 rounded-l-2xl border-y border-l border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-black text-xs w-4">{idx + 1}.</span>
                        <div className="w-9 h-9 rounded-full border border-slate-200 bg-slate-100 overflow-hidden shadow-sm flex items-center justify-center text-xs font-black text-slate-650">
                          {emp.avatar ? (
                            <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                          ) : (
                            emp.name.charAt(0)
                          )}
                        </div>
                        <span className="text-sm font-black text-slate-800">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-y border-slate-100">
                      <span className={`px-2.5 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${
                        emp.completion_rate >= 80 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : emp.completion_rate >= 40
                            ? 'bg-amber-50 text-amber-600 border-amber-100'
                            : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {emp.completion_rate >= 80 ? 'EXCELLENT' : emp.completion_rate >= 40 ? 'ON TRACK' : 'NEEDS FOCUS'}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-y border-slate-100">
                      <span className="text-xs font-extrabold text-slate-600">{emp.completed} / {emp.total} Tasks</span>
                    </td>
                    <td className="px-6 py-4 rounded-r-2xl border-y border-r border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              emp.completion_rate >= 80 
                                ? 'bg-emerald-500'
                                : emp.completion_rate >= 40
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                            }`}
                            style={{ width: `${emp.completion_rate}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-black text-slate-800">{emp.completion_rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
