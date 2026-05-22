import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { 
  Plus, Search, Filter, MoreVertical, 
  Clock, AlertTriangle, CheckCircle2, User as UserIcon,
  ChevronRight, Calendar as CalendarIcon, Tag,
  LayoutGrid, List as ListIcon, HelpCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import TaskModal from '../../components/TaskModal';
import TaskDetailPanel from '../../components/tasks/TaskDetailPanel';

const STATUS_STYLES = {
  todo: { bg: 'bg-slate-100 text-slate-500 border-slate-200', label: 'To Do' },
  in_progress: { bg: 'bg-indigo-50 text-indigo-650 border-indigo-100', label: 'In Progress' },
  in_review: { bg: 'bg-amber-50 text-amber-650 border-amber-100', label: 'In Review' },
  done: { bg: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Done' },
  cancelled: { bg: 'bg-rose-50 text-rose-600 border-rose-100', label: 'Cancelled' },
};

const PRIORITY_STYLES = {
  critical: { text: 'text-rose-600', bg: 'bg-rose-50 border-rose-100', icon: 'ti ti-flag-filled text-rose-500', stripe: 'bg-rose-500' },
  high: { text: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', icon: 'ti ti-flag-filled text-amber-500', stripe: 'bg-amber-500' },
  medium: { text: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100', icon: 'ti ti-flag-filled text-jeallo-primary', stripe: 'bg-indigo-400' },
  low: { text: 'text-slate-550', bg: 'bg-slate-50 border-slate-200', icon: 'ti ti-flag-filled text-slate-400', stripe: 'bg-slate-350' },
};

export default function TaskList() {
  const { currentWorkspace } = useWorkspaceStore();
  const [params, setParams] = useState({ search: '' });
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'active', 'overdue', 'completed'
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid'
  
  const [isModalOpen, setIsModalOpen] = useState(false); // Create Task
  const [selectedTask, setSelectedTask] = useState(null); // Active Detail Task
  const [isPanelOpen, setIsPanelOpen] = useState(false); // Detail Slide-out

  const { data: tasksResponse, isLoading, refetch } = useQuery({
    queryKey: ['tasks', params, currentWorkspace?.id],
    queryFn: () => api.get('/v1/tasks', { 
      params: { 
        ...params, 
        workspace_id: currentWorkspace?.id 
      } 
    }).then(res => res.data),
    enabled: !!currentWorkspace,
  });

  const rawTasksList = tasksResponse?.data || [];
  const tasksList = rawTasksList.map(task => {
    let normalizedStatus = task.status;
    let originalStatus = task.status || '';
    if (task.status) {
      const lower = task.status.toLowerCase().trim();
      if (['done', 'complete', 'completed', 'comlete', 'finished'].includes(lower)) {
        normalizedStatus = 'done';
      } else if (['in progress', 'in_progress', 'doing', 'active'].includes(lower)) {
        normalizedStatus = 'in_progress';
      } else if (['in review', 'in_review', 'review', 'testing'].includes(lower)) {
        normalizedStatus = 'in_review';
      } else if (['todo', 'to do', 'backlog', 'to_do'].includes(lower)) {
        normalizedStatus = 'todo';
      } else if (['cancelled', 'canceled', 'cancel', 'discarded'].includes(lower)) {
        normalizedStatus = 'cancelled';
      }
    }
    return {
      ...task,
      status: normalizedStatus,
      originalStatus: originalStatus
    };
  });

  // Filter tasks dynamically based on status groups
  const filteredTasks = tasksList.filter(task => {
    const todayStr = new Date().toISOString().split('T')[0];
    const isOverdue = task.due_date && task.due_date < todayStr && task.status !== 'done';
    
    if (activeTab === 'active') {
      return ['todo', 'in_progress', 'in_review'].includes(task.status);
    }
    if (activeTab === 'overdue') {
      return isOverdue;
    }
    if (activeTab === 'completed') {
      return task.status === 'done';
    }
    return true; // 'all'
  });

  // Calculate metrics
  const totalCount = tasksList.length;
  const inProgressCount = tasksList.filter(t => t.status === 'in_progress').length;
  const completedCount = tasksList.filter(t => t.status === 'done').length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = tasksList.filter(t => t.due_date && t.due_date < todayStr && t.status !== 'done').length;

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsPanelOpen(true);
  };

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center text-slate-400 font-bold tracking-wider">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>LOADING ASSIGNMENTS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-16">
      {/* Upper Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Tasks</h1>
          <p className="text-slate-500 font-medium mt-1">
            Manage your personal backlog and tracking inside <span className="text-jeallo-primary font-black">{currentWorkspace?.name || 'Workspace'}</span>
          </p>
        </div>
        <button 
          onClick={() => { setSelectedTask(null); setIsModalOpen(true); }}
          className="flex items-center gap-3 bg-jeallo-gradient text-white px-6 py-4 rounded-2xl font-black text-sm shadow-xl shadow-jeallo-primary/20 hover:scale-[1.02] active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>CREATE TASK</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Assigned Tasks', count: totalCount, icon: <UserIcon size={20} />, color: 'bg-jeallo-primary/5 text-jeallo-primary border-jeallo-primary/10', glowColor: 'hover:shadow-jeallo-primary/5' },
          { label: 'In Progress', count: inProgressCount, icon: <Clock size={20} />, color: 'bg-indigo-50 text-indigo-600 border-indigo-100', glowColor: 'hover:shadow-indigo-500/5' },
          { label: 'Overdue Items', count: overdueCount, icon: <AlertTriangle size={20} />, color: 'bg-rose-50 text-rose-600 border-rose-100', glowColor: 'hover:shadow-rose-500/5', warning: overdueCount > 0 },
          { label: 'Completed', count: completedCount, icon: <CheckCircle2 size={20} />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', glowColor: 'hover:shadow-emerald-500/5' },
        ].map((card, i) => (
          <div 
            key={i} 
            className={`group relative bg-white border border-slate-100 rounded-[2rem] p-6 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-slate-150/40 cursor-pointer ${card.glowColor}`}
          >
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{card.label}</span>
              <span className={`text-3xl font-black tracking-tight ${card.warning ? 'text-rose-500 animate-pulse' : 'text-slate-900'}`}>{card.count}</span>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center border transition-all duration-300`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-100 p-3.5 rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Tasks', count: totalCount },
            { id: 'active', label: 'Active', count: totalCount - completedCount },
            { id: 'overdue', label: 'Overdue', count: overdueCount, highlight: overdueCount > 0 },
            { id: 'completed', label: 'Completed', count: completedCount }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                activeTab === tab.id 
                  ? tab.highlight ? 'bg-rose-500 text-white' : 'bg-slate-800 text-white'
                  : tab.highlight ? 'bg-rose-500/20 text-rose-600' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tasks..."
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-jeallo-primary/10 focus:border-jeallo-primary outline-none transition-all shadow-inner"
              value={params.search}
              onChange={(e) => setParams({ ...params, search: e.target.value })}
            />
          </div>

          {/* View Toggle */}
          <div className="flex bg-slate-50 border border-slate-100 rounded-xl p-1 shrink-0">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-jeallo-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="List view"
            >
              <ListIcon size={16} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-jeallo-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Task Rendering Area */}
      {filteredTasks.length === 0 ? (
        <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-emerald-500 shadow-xl shadow-slate-100">
            <CheckCircle2 size={32} />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-lg font-black text-slate-900">All Completed!</h3>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              No tasks assigned to you match this selection filter. Rest, or take on something new!
            </p>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        /* Sleek Premium Custom List View matching Attendance History */
        <div className="bg-white border border-slate-100 rounded-[3rem] shadow-xl shadow-slate-200/40 p-8 min-h-[500px] flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-450">
                  <th className="px-6 pb-2">Task Detail</th>
                  <th className="px-6 pb-2">Priority</th>
                  <th className="px-6 pb-2">Status</th>
                  <th className="px-6 pb-2">Due Date</th>
                  <th className="px-6 pb-2">Assignees</th>
                  <th className="px-6 pb-2"></th>
                </tr>
              </thead>
              <tbody className="space-y-4">
                {filteredTasks.map((task) => {
                  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;
                  const statusStyle = STATUS_STYLES[task.status] || STATUS_STYLES.todo;
                  const isOverdue = task.due_date && task.due_date < todayStr && task.status !== 'done';
                  
                  return (
                    <tr 
                      key={task.id}
                      onClick={() => handleTaskClick(task)}
                      className="bg-white hover:bg-slate-50 transition-colors border border-slate-100 group cursor-pointer"
                    >
                      {/* Task details */}
                      <td className="px-6 py-5 rounded-l-2xl border-y border-l border-slate-50 group-hover:border-slate-100 relative">
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${priorityStyle.stripe}`}></div>
                        <div className="flex flex-col pl-2">
                          <span className="text-sm font-black text-slate-800 group-hover:text-jeallo-primary transition-colors line-clamp-1">
                            {task.title}
                          </span>
                          {task.epic && (
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-0.5 mt-1.5 rounded-md text-[9px] font-extrabold text-slate-500 w-fit">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.epic.color }}></div>
                              <span className="uppercase">{task.epic.name}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="px-6 py-5 border-y border-slate-50 group-hover:border-slate-100">
                        <span className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit ${priorityStyle.bg}`}>
                          <i className={`${priorityStyle.icon}`}></i>
                          <span>{task.priority}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5 border-y border-slate-50 group-hover:border-slate-100">
                        <span className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${statusStyle.bg}`}>
                          {task.originalStatus || statusStyle.label}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="px-6 py-5 border-y border-slate-50 group-hover:border-slate-100">
                        <div className={`flex items-center gap-2 text-xs font-bold ${isOverdue ? 'text-rose-600 font-black' : 'text-slate-500'}`}>
                          <CalendarIcon size={14} className={isOverdue ? 'text-rose-500 animate-pulse' : 'text-slate-400'} />
                          <span>{task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : 'No Date'}</span>
                        </div>
                      </td>

                      {/* Assignees */}
                      <td className="px-6 py-5 border-y border-slate-50 group-hover:border-slate-100">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {task.assignees.slice(0, 3).map((assignee) => (
                            <div 
                              key={assignee.id}
                              className="w-7 h-7 rounded-full border border-white bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-600 overflow-hidden shadow-sm"
                              title={assignee.name}
                            >
                              {assignee.avatar ? (
                                <img src={assignee.avatar} alt={assignee.name} className="w-full h-full object-cover" />
                              ) : (
                                assignee.name.charAt(0)
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Action Dot */}
                      <td className="px-6 py-5 rounded-r-2xl border-y border-r border-slate-50 group-hover:border-slate-100 text-right">
                        <button className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors border border-transparent">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Premium Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => {
            const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;
            const statusStyle = STATUS_STYLES[task.status] || STATUS_STYLES.todo;
            const isOverdue = task.due_date && task.due_date < todayStr && task.status !== 'done';

            return (
              <div 
                key={task.id}
                onClick={() => handleTaskClick(task)}
                className="group relative bg-white border border-slate-150 hover:border-slate-250 hover:shadow-xl rounded-3xl p-6 flex flex-col gap-4 cursor-pointer transition-all duration-300 relative overflow-hidden shadow-sm"
              >
                {/* Glowing Top Priority Accent */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${priorityStyle.stripe}`}></div>

                {/* Card Header Info */}
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TASK</span>
                    {task.epic && (
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-[9px] font-extrabold text-slate-500">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.epic.color }}></div>
                        <span className="uppercase text-[8px]">{task.epic.name}</span>
                      </div>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded-md border text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${priorityStyle.bg}`}>
                    <i className={`${priorityStyle.icon} text-[10px]`}></i>
                    <span>{task.priority}</span>
                  </div>
                </div>

                {/* Card Title & Desc */}
                <div className="space-y-2">
                  <h4 className="text-sm font-black text-slate-800 group-hover:text-jeallo-primary transition-colors line-clamp-2 leading-snug">
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-slate-400 text-xs font-semibold line-clamp-2 leading-relaxed">
                      {task.description.replace(/<[^>]*>/g, '')}
                    </p>
                  )}
                </div>

                {/* Bottom stats row */}
                <div className="mt-auto border-t border-slate-100 pt-4 flex items-center justify-between">
                  <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`}>
                    <CalendarIcon size={12} className={isOverdue ? 'text-rose-500 animate-pulse' : ''} />
                    <span>{task.due_date ? format(new Date(task.due_date), 'MMM d') : 'No Date'}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status badge */}
                    <div className={`px-2 py-0.5 rounded-md border text-[8px] font-extrabold uppercase tracking-widest ${statusStyle.bg}`}>
                      {task.originalStatus || statusStyle.label}
                    </div>

                    {/* Comment tracker */}
                    {task.comments_count > 0 && (
                      <div className="flex items-center gap-1 text-[10px] font-extrabold text-slate-400">
                        <i className="ti ti-message-2 text-xs"></i>
                        <span>{task.comments_count}</span>
                      </div>
                    )}

                    {/* Single Avatar */}
                    <div className="w-6 h-6 rounded-full border border-slate-100 bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500 overflow-hidden">
                      {task.assignees?.[0]?.avatar ? (
                        <img src={task.assignees[0].avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <i className="ti ti-user text-[10px] text-slate-400"></i>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task detail slider */}
      <TaskDetailPanel 
        task={selectedTask} 
        isOpen={isPanelOpen} 
        onClose={() => {
          setIsPanelOpen(false);
          setSelectedTask(null);
        }}
        onUpdate={() => refetch()}
      />

      {/* Standard create task modal */}
      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          refetch();
        }} 
        task={null}
      />
    </div>
  );
}
