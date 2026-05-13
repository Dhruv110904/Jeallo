import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { 
  Plus, Search, Filter, MoreVertical, 
  Clock, AlertTriangle, CheckCircle2, User as UserIcon,
  ChevronRight, Calendar as CalendarIcon, Tag
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import TaskModal from '../../components/TaskModal';

const STATUS_COLORS = {
  todo: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  in_progress: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  in_review: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  done: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const PRIORITY_COLORS = {
  low: 'text-slate-400',
  medium: 'text-amber-400',
  high: 'text-orange-400',
  critical: 'text-red-500',
};

export default function TaskList() {
  const [params, setParams] = useState({ page: 1, search: '', status: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', params],
    queryFn: () => api.get('/tasks', { params }).then(res => res.data),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Tasks</h1>
          <p className="text-slate-400 mt-1">Manage and track your project tasks</p>
        </div>
        <button 
          onClick={() => { setSelectedTask(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create New Task
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-slate-900/40 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by title, description..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
            value={params.search}
            onChange={(e) => setParams({ ...params, search: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <select 
            className="bg-slate-800/50 border border-slate-700 rounded-xl py-2 px-4 text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
            value={params.status}
            onChange={(e) => setParams({ ...params, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="done">Done</option>
          </select>
          <button className="p-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-400 transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left bg-slate-800/30">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Task Detail</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Priority</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Assignees</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Due Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {tasksData?.data.map((task) => (
                <tr 
                  key={task.id} 
                  className="hover:bg-slate-800/20 group transition-all cursor-pointer"
                  onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}
                >
                  <td className="px-6 py-5 min-w-[300px]">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">{task.title}</span>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-800/50 px-2 py-0.5 rounded-lg border border-slate-700/50">
                          <Tag className="w-3 h-3" />
                          {task.category || 'General'}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.estimated_hours}h est.
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 ${PRIORITY_COLORS[task.priority]}`}>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${STATUS_COLORS[task.status]}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex -space-x-2 overflow-hidden">
                      {task.assignees.slice(0, 3).map((assignee) => (
                        <div 
                          key={assignee.id}
                          className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300 overflow-hidden ring-1 ring-slate-800"
                          title={assignee.name}
                        >
                          {assignee.avatar ? (
                            <img src={assignee.avatar} alt={assignee.name} className="w-full h-full object-cover" />
                          ) : (
                            assignee.name.charAt(0)
                          )}
                        </div>
                      ))}
                      {task.assignees.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 ring-1 ring-slate-800">
                          +{task.assignees.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <CalendarIcon className="w-4 h-4 text-slate-500" />
                      {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : 'No Date'}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-6 border-t border-slate-800 flex items-center justify-between bg-slate-800/10">
          <span className="text-sm text-slate-500 font-medium">Showing {tasksData?.data.length || 0} tasks</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-bold border border-slate-700 transition-all disabled:opacity-50">Previous</button>
            <button className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-bold border border-slate-700 transition-all">Next</button>
          </div>
        </div>
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        task={selectedTask}
      />
    </div>
  );
}
