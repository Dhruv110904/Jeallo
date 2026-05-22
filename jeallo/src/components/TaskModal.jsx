import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from './common/Modal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Tag, 
  Users as UsersIcon,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Save
} from 'lucide-react';

const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'in_review', 'done', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  due_date: z.string().optional(),
  estimated_hours: z.number().min(0).optional(),
  assignee_ids: z.array(z.number()).optional(),
});

export default function TaskModal({ isOpen, onClose, task = null }) {
  const queryClient = useQueryClient();
  const isEditing = !!task;

  const { data: users } = useQuery({
    queryKey: ['users-simple'],
    queryFn: () => api.get('/v1/users').then(res => res.data),
    enabled: isOpen,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(taskSchema),
    values: task ? {
      ...task,
      assignee_ids: task.assignees?.map(a => a.id) || [],
    } : {
      status: 'todo',
      priority: 'medium',
      assignee_ids: [],
    }
  });

  const mutation = useMutation({
    mutationFn: (data) => isEditing 
      ? api.put(`/v1/tasks/${task.id}`, data)
      : api.post('/v1/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['dashboard-stats']);
      toast.success(isEditing ? 'Task updated' : 'Task created');
      onClose();
      reset();
    },
    onError: () => toast.error('Something went wrong'),
  });

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditing ? 'Edit Task' : 'Create New Task'}
    >
      <form onSubmit={handleSubmit(mutation.mutate)} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-400 mb-2">Task Title</label>
          <input 
            {...register('title')}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-medium"
            placeholder="What needs to be done?"
          />
          {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-400 mb-2">Description</label>
          <textarea 
            {...register('description')}
            rows={4}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none"
            placeholder="Add some details..."
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-400">Status</label>
            <div className="relative">
              <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select 
                {...register('status')}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none capitalize"
              >
                {['todo', 'in_progress', 'in_review', 'done', 'cancelled'].map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-400">Priority</label>
            <div className="relative">
              <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select 
                {...register('priority')}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none capitalize"
              >
                {['low', 'medium', 'high', 'critical'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-400">Due Date</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                {...register('due_date')}
                type="date"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-400">Estimated Hours</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                {...register('estimated_hours', { valueAsNumber: true })}
                type="number"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex justify-end gap-4">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={mutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
          >
            {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isEditing ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
