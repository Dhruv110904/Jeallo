import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { 
  Search, Plus, Filter, MoreHorizontal, 
  ChevronRight, ChevronDown, List as ListIcon,
  Calendar, User as UserIcon, AlertCircle, Loader2
} from 'lucide-react';
import TaskDetailPanel from '../components/tasks/TaskDetailPanel';

export default function Backlog() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState(['backlog']);

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/v1/projects/${projectId}`).then(res => res.data.data),
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: () => api.get(`/v1/projects/${projectId}/tasks`).then(res => res.data.data),
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const handleTaskClick = (task) => {
    setActiveTask(task);
    setIsPanelOpen(true);
  };

  if (isLoading) return <div className="flex items-center justify-center h-full text-slate-400 font-bold">LOADING BACKLOG...</div>;

  return (
    <div className="h-full flex flex-col bg-slate-50/50 animate-in fade-in duration-500">
      <header className="p-8 bg-white border-b border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Backlog</h1>
          <div className="flex items-center gap-3 mt-1">
             <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{project?.name}</span>
             <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
             <span className="text-xs font-bold text-jeallo-primary uppercase">{tasks?.length || 0} Issues</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex bg-slate-50 border border-slate-100 rounded-2xl p-1">
              <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
                 <Search className="w-4 h-4 text-slate-400" />
                 <input type="text" placeholder="Search backlog..." className="bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0 w-40" />
              </div>
           </div>
           <button className="bg-jeallo-gradient text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-jeallo-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Issue
           </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
        {/* Backlog Section */}
        <div className="space-y-4">
            <div 
                className="flex items-center justify-between cursor-pointer group"
                onClick={() => toggleSection('backlog')}
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-jeallo-primary transition-colors shadow-sm">
                        {expandedSections.includes('backlog') ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </div>
                    <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">Backlog Tasks</h2>
                    <span className="bg-slate-200 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full">{tasks?.length || 0}</span>
                </div>
                <button className="p-2 text-slate-400 hover:text-jeallo-primary opacity-0 group-hover:opacity-100 transition-all">
                    <MoreHorizontal size={18} />
                </button>
            </div>

            {expandedSections.includes('backlog') && (
                <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm divide-y divide-slate-50 animate-in slide-in-from-top-2 duration-300">
                    {tasks?.length > 0 ? (
                        tasks.map((task) => (
                            <div 
                                key={task.id}
                                onClick={() => handleTaskClick(task)}
                                className="group flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-all cursor-pointer"
                            >
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <ListIcon className="w-5 h-5 text-slate-400" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-[10px] font-black text-jeallo-primary uppercase tracking-tighter bg-jeallo-primary/5 px-2 py-0.5 rounded-md border border-jeallo-primary/10">
                                            {project?.slug}-{task.id}
                                        </span>
                                        <p className="text-sm font-bold text-slate-700 truncate">{task.title}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <AlertCircle className={`w-3 h-3 ${
                                                task.priority === 'critical' ? 'text-red-500' : 'text-slate-400'
                                            }`} />
                                            {task.priority}
                                        </div>
                                        {task.due_date && (
                                            <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(task.due_date).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-2">
                                        {task.assignees?.map((u) => (
                                            <div key={u.id} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 overflow-hidden shadow-sm" title={u.name}>
                                                {u.avatar ? <img src={u.avatar} alt="" /> : u.name[0]}
                                            </div>
                                        ))}
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                        task.status === 'Done' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {task.status}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                <Plus className="w-8 h-8 text-slate-200" />
                            </div>
                            <p className="text-sm font-bold text-slate-400">No tasks in the backlog</p>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>

      <TaskDetailPanel 
        task={activeTask} 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)}
        onUpdate={() => queryClient.invalidateQueries(['project-tasks'])}
      />
    </div>
  );
}
