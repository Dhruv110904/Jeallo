import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { 
  ChevronLeft, ChevronRight, Calendar, 
  User as UserIcon, Clock, Filter, List as ListIcon
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

export default function Timeline() {
  const { projectId } = useParams();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/v1/projects/${projectId}`).then(res => res.data.data),
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: () => api.get(`/v1/projects/${projectId}/tasks`).then(res => res.data.data),
  });

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  if (isLoading) return <div className="flex items-center justify-center h-full text-slate-400 font-bold uppercase tracking-widest">Generating Timeline...</div>;

  return (
    <div className="h-full flex flex-col bg-white animate-in fade-in duration-500 overflow-hidden">
      <header className="p-8 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Timeline</h1>
          <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest">{project?.name} / Project Schedule</p>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-1 shadow-sm">
              <button 
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-3 hover:bg-white hover:shadow-sm rounded-xl text-slate-400 hover:text-jeallo-primary transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="px-6 py-2 flex items-center justify-center min-w-[180px]">
                 <span className="font-black text-slate-900 uppercase tracking-widest text-sm">
                    {format(currentDate, 'MMMM yyyy')}
                 </span>
              </div>
              <button 
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-3 hover:bg-white hover:shadow-sm rounded-xl text-slate-400 hover:text-jeallo-primary transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
           </div>
           
           <div className="w-px h-10 bg-slate-100"></div>
           
           <button className="flex items-center gap-2 text-slate-400 hover:text-jeallo-primary font-black text-xs uppercase tracking-widest transition-all">
              <Filter className="w-4 h-4" />
              Filters
           </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Task List Sidebar */}
        <div className="w-80 border-r border-slate-100 flex flex-col shrink-0 bg-slate-50/30">
            <div className="p-4 h-12 flex items-center border-b border-slate-50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Task Name</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {tasks?.map(task => (
                    <div key={task.id} className="h-16 px-6 flex items-center border-b border-slate-50 hover:bg-white transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: project?.color }}></div>
                            <span className="text-sm font-bold text-slate-700 truncate group-hover:text-jeallo-primary transition-colors">{task.title}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Timeline Grid */}
        <div className="flex-1 overflow-auto custom-scrollbar relative">
            {/* Grid Header (Days) */}
            <div className="inline-flex h-12 border-b border-slate-100 sticky top-0 bg-white z-10">
                {days.map(day => (
                    <div key={day.toString()} className={`w-12 border-r border-slate-50 flex flex-col items-center justify-center shrink-0 ${
                        isSameDay(day, new Date()) ? 'bg-jeallo-primary/5' : ''
                    }`}>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{format(day, 'EEE')}</span>
                        <span className={`text-[11px] font-black ${isSameDay(day, new Date()) ? 'text-jeallo-primary' : 'text-slate-600'}`}>{format(day, 'd')}</span>
                    </div>
                ))}
            </div>

            {/* Grid Body */}
            <div className="relative inline-flex flex-col min-w-full">
                {tasks?.map(task => {
                    const taskDate = task.due_date ? new Date(task.due_date) : null;
                    const isVisible = taskDate && taskDate >= startOfMonth(currentDate) && taskDate <= endOfMonth(currentDate);
                    const dayIndex = taskDate ? days.findIndex(d => isSameDay(d, taskDate)) : -1;

                    return (
                        <div key={task.id} className="h-16 border-b border-slate-50 flex relative hover:bg-slate-50/50 transition-colors group">
                            {days.map(day => (
                                <div key={day.toString()} className={`w-12 border-r border-slate-50 shrink-0 h-full ${
                                    isSameDay(day, new Date()) ? 'bg-jeallo-primary/[0.02]' : ''
                                }`}></div>
                            ))}

                            {isVisible && dayIndex !== -1 && (
                                <div 
                                    className="absolute h-10 top-3 rounded-2xl flex items-center px-4 shadow-xl shadow-jeallo-primary/10 border-l-4 border-black/10 group-hover:scale-[1.02] transition-all cursor-pointer animate-in zoom-in duration-500"
                                    style={{ 
                                        left: `${dayIndex * 48 + 4}px`, 
                                        width: '180px', 
                                        backgroundColor: project?.color || '#1B3A6B' 
                                    }}
                                >
                                    <span className="text-[10px] font-black text-white truncate uppercase tracking-tighter">
                                        {task.status}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
                
                {/* Current Day Indicator */}
                {days.findIndex(d => isSameDay(d, new Date())) !== -1 && (
                    <div 
                        className="absolute top-0 bottom-0 w-px bg-jeallo-primary z-0 flex flex-col items-center"
                        style={{ left: `${days.findIndex(d => isSameDay(d, new Date())) * 48 + 24}px` }}
                    >
                        <div className="w-2 h-2 rounded-full bg-jeallo-primary -mt-1 shadow-lg shadow-jeallo-primary/50"></div>
                    </div>
                )}
            </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
}
