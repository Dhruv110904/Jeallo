import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import {
  CheckCircle2, Clock, AlertTriangle, Users, Target,
  Calendar as CalendarIcon, TrendingUp, Layers, ArrowUpRight,
  Zap, Activity, Briefcase
} from 'lucide-react';
import { format } from 'date-fns';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

/* ─── Color Palette ──────────────────────────── */
const STATUS_MAP = {
  todo:        { label: 'To Do',       color: '#64748b', gradient: 'from-slate-400 to-slate-500' },
  in_progress: { label: 'In Progress', color: '#6366f1', gradient: 'from-indigo-400 to-indigo-600' },
  in_review:   { label: 'In Review',   color: '#f59e0b', gradient: 'from-amber-400 to-amber-500' },
  done:        { label: 'Completed',   color: '#10b981', gradient: 'from-emerald-400 to-emerald-600' },
  cancelled:   { label: 'Cancelled',   color: '#f43f5e', gradient: 'from-rose-400 to-rose-500' },
};

const PRIORITY_COLORS = {
  critical: { color: '#ef4444', bg: 'bg-rose-50 text-rose-600 border-rose-100' },
  high:     { color: '#f59e0b', bg: 'bg-amber-50 text-amber-600 border-amber-100' },
  medium:   { color: '#6366f1', bg: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  low:      { color: '#94a3b8', bg: 'bg-slate-50 text-slate-500 border-slate-200' },
};

/* ─── Normalizer ──────────────────────────────── */
function normalizeStatus(raw) {
  const lower = (raw || '').toLowerCase().trim();
  if (['done', 'complete', 'completed', 'comlete', 'finished'].includes(lower)) return 'done';
  if (['in progress', 'in_progress', 'doing', 'active'].includes(lower)) return 'in_progress';
  if (['in review', 'in_review', 'review', 'testing'].includes(lower)) return 'in_review';
  if (['todo', 'to do', 'backlog', 'to_do'].includes(lower)) return 'todo';
  if (['cancelled', 'canceled', 'cancel', 'discarded'].includes(lower)) return 'cancelled';
  return 'todo';
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0];
  const color = d.payload?.color || d.color || '#64748b';
  const name = d.name || d.payload?.name || 'Unknown';
  const value = d.value !== undefined ? d.value : (d.payload?.value || 0);
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-100 rounded-2xl px-5 py-3 shadow-2xl shadow-slate-200/50 animate-in fade-in duration-200">
      <div className="flex items-center gap-2.5">
        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: color }} />
        <span className="text-sm font-black text-slate-800">{name}</span>
      </div>
      <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
    </div>
  );
};

const PriorityTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0];
  const name = d.payload?.name || d.name || 'Unknown';
  const value = d.value !== undefined ? d.value : (d.payload?.count || 0);
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-100 rounded-2xl px-5 py-3 shadow-2xl shadow-slate-200/50 animate-in fade-in duration-200">
      <span className="text-sm font-black text-slate-800">{name}</span>
      <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
    </div>
  );
};

/* ─── Component ───────────────────────────────── */
export default function ProjectSummary() {
  const { projectId } = useParams();

  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/v1/projects/${projectId}`).then(r => r.data.data),
  });

  const { data: tasksRaw, isLoading: isTasksLoading } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: () => api.get(`/v1/projects/${projectId}/tasks`).then(r => r.data.data),
  });

  const { data: members, isLoading: isMembersLoading } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => api.get(`/v1/projects/${projectId}/members`).then(r => r.data.data),
  });

  const isLoading = isProjectLoading || isTasksLoading || isMembersLoading;

  if (isLoading) {
    return (
      <div className="h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-jeallo-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Summary...</span>
        </div>
      </div>
    );
  }

  const tasks = (tasksRaw || []).map(t => ({ ...t, _status: normalizeStatus(t.status) }));
  const total = tasks.length;
  const membersList = (members || []).filter(Boolean);

  /* ── Status counts ── */
  const statusCounts = {};
  tasks.forEach(t => {
    statusCounts[t._status] = (statusCounts[t._status] || 0) + 1;
  });

  const pieData = Object.entries(STATUS_MAP)
    .filter(([key]) => statusCounts[key])
    .map(([key, meta]) => ({
      name: meta.label,
      value: statusCounts[key],
      color: meta.color,
    }));

  const doneCount   = statusCounts.done || 0;
  const todoCount   = statusCounts.todo || 0;
  const ipCount     = statusCounts.in_progress || 0;
  const irCount     = statusCounts.in_review || 0;
  const cancelCount = statusCounts.cancelled || 0;

  const completionRate = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  /* ── Priority counts ── */
  const priorityCounts = {};
  tasks.forEach(t => {
    const p = t.priority || 'medium';
    priorityCounts[p] = (priorityCounts[p] || 0) + 1;
  });

  const barData = Object.entries(PRIORITY_COLORS)
    .filter(([key]) => priorityCounts[key])
    .map(([key, meta]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      count: priorityCounts[key],
      fill: meta.color,
    }));

  /* ── Overdue ── */
  const today = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(t => t.due_date && t.due_date < today && t._status !== 'done');

  /* ── Recent tasks ── */
  const recentTasks = [...tasks].sort((a, b) => {
    const dateA = new Date(a.updated_at || a.created_at || 0);
    const dateB = new Date(b.updated_at || b.created_at || 0);
    return isNaN(dateB.getTime()) || isNaN(dateA.getTime()) ? 0 : dateB - dateA;
  }).slice(0, 5);

  /* ── Status breakdown items for legend cards ── */
  const statusBreakdown = [
    { key: 'todo',        label: 'To Do',       count: todoCount,   icon: Target,        iconBg: 'bg-slate-100 text-slate-500' },
    { key: 'in_progress', label: 'In Progress',  count: ipCount,     icon: Zap,           iconBg: 'bg-indigo-50 text-indigo-600' },
    { key: 'in_review',   label: 'In Review',    count: irCount,     icon: Activity,      iconBg: 'bg-amber-50 text-amber-600' },
    { key: 'done',        label: 'Completed',    count: doneCount,   icon: CheckCircle2,  iconBg: 'bg-emerald-50 text-emerald-600' },
  ];

  /* ── Safe formatted project deadline ── */
  let formattedDeadline = null;
  if (project?.deadline) {
    try {
      const d = new Date(project.deadline);
      if (!isNaN(d.getTime())) {
        formattedDeadline = format(d, 'MMM d, yyyy');
      }
    } catch (e) {
      console.error('Invalid project deadline', e);
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">

      {/* ═══ Project Header ═══ */}
      <div className="relative bg-white border border-slate-100 rounded-[3rem] p-10 shadow-xl shadow-slate-200/30 overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-jeallo-primary/5 to-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-gradient-to-tr from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div
              className="w-16 h-16 rounded-[1.2rem] flex items-center justify-center text-white text-2xl font-black shadow-xl border-2 border-white/50"
              style={{ background: `linear-gradient(135deg, ${project?.color || '#1B3A6B'}, ${project?.color || '#1B3A6B'}dd)` }}
            >
              {project?.icon || project?.name?.[0] || 'P'}
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{project?.name}</h1>
              <p className="text-sm font-semibold text-slate-400 mt-1 max-w-lg leading-relaxed">
                {project?.description || 'No description provided for this project.'}
              </p>
            </div>
          </div>

          {/* Quick Stats Pills */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl">
              <Briefcase size={14} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{project?.type || 'kanban'}</span>
            </div>
            {formattedDeadline && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-100 rounded-2xl">
                <CalendarIcon size={14} className="text-amber-500" />
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider">
                  Due {formattedDeadline}
                </span>
              </div>
            )}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border ${
              overdueTasks.length > 0 
                ? 'bg-rose-50 border-rose-100' 
                : 'bg-emerald-50 border-emerald-100'
            }`}>
              <AlertTriangle size={14} className={overdueTasks.length > 0 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'} />
              <span className={`text-[10px] font-black uppercase tracking-wider ${overdueTasks.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {overdueTasks.length} Overdue
              </span>
            </div>
          </div>
        </div>

        {/* Members Row */}
        {membersList.length > 0 && (
          <div className="relative z-10 mt-8 pt-6 border-t border-slate-100 flex items-center gap-4">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Team</span>
            <div className="flex -space-x-2.5">
              {membersList.slice(0, 8).map(m => (
                <div
                  key={m.id}
                  className="w-9 h-9 rounded-full border-[3px] border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 overflow-hidden shadow-sm hover:scale-110 hover:z-10 transition-transform cursor-pointer"
                  title={m.name}
                >
                  {m.avatar ? (
                    <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    m.name?.[0]
                  )}
                </div>
              ))}
              {membersList.length > 8 && (
                <div className="w-9 h-9 rounded-full border-[3px] border-white bg-jeallo-primary text-white flex items-center justify-center text-[9px] font-black shadow-sm">
                  +{membersList.length - 8}
                </div>
              )}
            </div>
            <span className="text-xs font-bold text-slate-500 ml-2">{membersList.length} member{membersList.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* ═══ Metric Cards ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statusBreakdown.map(item => (
          <div key={item.key} className="group relative bg-white border border-slate-100 rounded-[2rem] p-6 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-slate-200/30 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${STATUS_MAP[item.key].gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{item.label}</span>
                <span className="text-3xl font-black text-slate-900 tracking-tight">{item.count}</span>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${item.iconBg} flex items-center justify-center border border-slate-100/50 transition-transform group-hover:scale-110 duration-300`}>
                <item.icon size={20} />
              </div>
            </div>
            {/* Mini progress line */}
            <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: total > 0 ? `${(item.count / total) * 100}%` : '0%',
                  backgroundColor: STATUS_MAP[item.key].color,
                }}
              />
            </div>
            <span className="text-[9px] font-bold text-slate-400 mt-2 block">
              {total > 0 ? Math.round((item.count / total) * 100) : 0}% of all tasks
            </span>
          </div>
        ))}
      </div>

      {/* ═══ Pie Chart + Priority Bar ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* Status Pie — 3 cols */}
        <div className="lg:col-span-3 bg-white border border-slate-100 rounded-[3rem] p-8 shadow-xl shadow-slate-200/30 overflow-hidden relative">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-indigo-500/5 to-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-2 relative z-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Task Status Distribution</h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">Visual breakdown of workflow progression</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <TrendingUp size={14} className="text-emerald-500" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">{completionRate}% Done</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 mt-4 relative z-10">
            {/* Pie Chart */}
            <div className="w-full md:w-1/2 min-h-[300px] flex items-center justify-center">
              {pieData.length === 0 ? (
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <Layers size={40} className="text-slate-200" />
                  <span className="text-xs font-bold">No tasks yet</span>
                </div>
              ) : (
                <div className="relative w-full h-[300px]">
                  {/* Center label overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                    <span className="text-3xl font-black text-slate-900">{total}</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Tasks</span>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <defs>
                        {pieData.map((entry, i) => (
                          <linearGradient key={`grad-${i}`} id={`pieGrad-${i}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                            <stop offset="100%" stopColor={entry.color} stopOpacity={1} />
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={pieData}
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={4}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {pieData.map((entry, idx) => (
                          <Cell
                            key={`cell-${idx}`}
                            fill={`url(#pieGrad-${idx})`}
                            className="hover:opacity-80 transition-opacity cursor-pointer"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Legend Cards */}
            <div className="w-full md:w-1/2 grid grid-cols-2 gap-3">
              {Object.entries(STATUS_MAP).map(([key, meta]) => {
                const count = statusCounts[key] || 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={key} className="bg-slate-50/60 hover:bg-slate-50 border border-slate-100 rounded-2xl p-4 transition-all group cursor-pointer">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: meta.color }} />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{meta.label}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-black text-slate-900">{count}</span>
                      <span className="text-xs font-bold text-slate-400 mb-0.5">{pct}%</span>
                    </div>
                    <div className="mt-2 h-1 bg-slate-200/60 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: meta.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Priority Breakdown — 2 cols */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[3rem] p-8 shadow-xl shadow-slate-200/30 flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Priority Breakdown</h3>
            <p className="text-xs text-slate-400 font-bold mt-0.5">Task severity classification</p>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-[260px]">
            {barData.length === 0 ? (
              <span className="text-xs text-slate-400 font-bold italic">No priority data available</span>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
                  <Tooltip content={<PriorityTooltip />} cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="count" radius={[10, 10, 4, 4]}>
                    {barData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Priority Legend Pills */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
            {Object.entries(PRIORITY_COLORS).map(([key, meta]) => (
              <div key={key} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider ${meta.bg}`}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                <span>{key}</span>
                <span className="ml-1 opacity-60">({priorityCounts[key] || 0})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Completion Progress + Recent Tasks ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* Overall Progress — 2 cols */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[3rem] p-8 shadow-xl shadow-slate-200/30 flex flex-col relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Project Progress</h3>
            <p className="text-xs text-slate-400 font-bold mt-0.5">Overall completion tracking</p>
          </div>

          {/* Big Donut */}
          <div className="relative z-10 flex-1 flex items-center justify-center py-6">
            <div className="relative w-44 h-44">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray={`${completionRate}, 100`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-900">{completionRate}%</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Complete</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="relative z-10 grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 rounded-2xl p-4">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Done</span>
              <span className="text-xl font-black text-emerald-600">{doneCount}</span>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Remaining</span>
              <span className="text-xl font-black text-slate-700">{total - doneCount}</span>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Overdue</span>
              <span className={`text-xl font-black ${overdueTasks.length > 0 ? 'text-rose-500' : 'text-slate-400'}`}>{overdueTasks.length}</span>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Members</span>
              <span className="text-xl font-black text-jeallo-primary">{membersList.length}</span>
            </div>
          </div>
        </div>

        {/* Recent Tasks — 3 cols */}
        <div className="lg:col-span-3 bg-white border border-slate-100 rounded-[3rem] p-8 shadow-xl shadow-slate-200/30 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Activity</h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">Latest updated tasks in this project</p>
            </div>
            <div className="w-10 h-10 bg-jeallo-primary/5 text-jeallo-primary rounded-2xl flex items-center justify-center border border-jeallo-primary/10">
              <Clock size={18} />
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {recentTasks.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <span className="text-xs text-slate-400 font-bold italic">No tasks in this project yet</span>
              </div>
            ) : (
              recentTasks.map(task => {
                const statusMeta = STATUS_MAP[task._status] || STATUS_MAP.todo;
                const priorityMeta = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
                const isOverdue = task.due_date && task.due_date < today && task._status !== 'done';

                return (
                  <div key={task.id} className="group flex items-center gap-4 px-5 py-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                    {/* Status indicator */}
                    <div className="w-2 h-8 rounded-full shrink-0" style={{ backgroundColor: statusMeta.color }} />

                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-800 group-hover:text-jeallo-primary transition-colors truncate">{task.title}</h4>
                        <ArrowUpRight size={12} className="text-slate-300 group-hover:text-jeallo-primary opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border ${priorityMeta.bg}`}>
                          {task.priority}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider bg-white border border-slate-100 text-slate-500" style={{ color: statusMeta.color }}>
                          {statusMeta.label}
                        </span>
                        {(() => {
                          if (!task.due_date) return null;
                          try {
                            const d = new Date(task.due_date);
                            if (!isNaN(d.getTime())) {
                              return (
                                <span className={`text-[10px] font-bold flex items-center gap-1 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`}>
                                  <CalendarIcon size={10} className={isOverdue ? 'animate-pulse' : ''} />
                                  {format(d, 'MMM d')}
                                </span>
                              );
                            }
                          } catch (e) {
                            console.error('Invalid task due date', e);
                          }
                          return null;
                        })()}
                      </div>
                    </div>

                    {/* Assignee */}
                    <div className="flex -space-x-1.5 shrink-0">
                      {(task.assignees || []).filter(Boolean).slice(0, 2).map(a => (
                        <div
                          key={a.id}
                          className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500 overflow-hidden shadow-sm"
                          title={a.name}
                        >
                          {a.avatar ? <img src={a.avatar} alt="" className="w-full h-full object-cover" /> : a.name?.[0]}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
