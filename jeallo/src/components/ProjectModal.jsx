import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { X, Users, Calendar, Type, Palette, Target, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProjectModal({ isOpen, onClose, workspaceId, project = null }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: '',
    type: 'kanban',
    color: '#1B3A6B',
    team_members: []
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        deadline: project.deadline ? project.deadline.split('T')[0] : '',
        type: project.type || 'kanban',
        color: project.color || '#1B3A6B',
        team_members: project.users?.map(u => u.id) || []
      });
    } else {
      setFormData({ name: '', description: '', deadline: '', type: 'kanban', color: '#1B3A6B', team_members: [] });
    }
  }, [project, isOpen]);

  const { data: users } = useQuery({
    queryKey: ['workspace-users'],
    queryFn: () => api.get('/v1/users').then(res => res.data.data),
    enabled: isOpen
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      if (project) {
        return api.put(`/v1/projects/${project.id}`, data);
      }
      return api.post(`/v1/workspaces/${workspaceId}/projects`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workspace-projects']);
      queryClient.invalidateQueries(['project', project?.id]);
      toast.success(project ? 'Project updated successfully!' : 'Project created successfully!');
      onClose();
    },
    onError: (error) => toast.error(error.response?.data?.message || `Failed to ${project ? 'update' : 'create'} project`),
  });

  const toggleMember = (userId) => {
    setFormData(prev => ({
      ...prev,
      team_members: prev.team_members.includes(userId)
        ? prev.team_members.filter(id => id !== userId)
        : [...prev.team_members, userId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-2xl rounded-none p-10 shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar border border-slate-200">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{project ? 'Edit Project' : 'Create Project'}</h2>
            <p className="text-slate-500 font-medium mt-1">{project ? 'Update project details and team access.' : 'Start a new venture and assemble your team.'}</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Project Title</label>
                <div className="relative">
                    <Type className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Website Redesign"
                        className="w-full bg-slate-50 border-none rounded-none py-4 pl-14 pr-6 font-bold text-slate-700 focus:ring-2 focus:ring-jeallo-primary/20"
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Project Type</label>
                <div className="grid grid-cols-2 gap-3">
                    {['kanban', 'scrum'].map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setFormData({...formData, type})}
                            className={`py-3 rounded-none font-black text-xs uppercase tracking-widest border-2 transition-all ${
                                formData.type === type 
                                ? 'border-jeallo-primary bg-jeallo-primary/5 text-jeallo-primary' 
                                : 'border-slate-100 text-slate-400 hover:border-slate-200'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Deadline</label>
                <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-none py-4 pl-14 pr-6 font-bold text-slate-700 focus:ring-2 focus:ring-jeallo-primary/20"
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Brand Color</label>
                <div className="flex gap-3">
                    {['#1B3A6B', '#F43F5E', '#F97316', '#10B981', '#6366F1'].map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setFormData({...formData, color: c})}
                            className={`w-10 h-10 rounded-full border-4 transition-all ${
                                formData.color === c ? 'border-slate-200 scale-110 shadow-lg' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Assign Team Members</label>
                <div className="bg-slate-50 rounded-none p-6 max-h-[300px] overflow-y-auto custom-scrollbar border border-slate-100">
                    <div className="space-y-3">
                        {users?.map((u) => (
                            <div 
                                key={u.id}
                                onClick={() => toggleMember(u.id)}
                                className={`flex items-center gap-3 p-3 rounded-none cursor-pointer transition-all ${
                                    formData.team_members.includes(u.id)
                                    ? 'bg-white shadow-sm ring-1 ring-jeallo-primary/20'
                                    : 'hover:bg-white/50'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${
                                    formData.team_members.includes(u.id) ? 'bg-jeallo-primary text-white' : 'bg-slate-200 text-slate-500'
                                }`}>
                                    {u.name[0]}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-black text-slate-700 truncate">{u.name}</p>
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{u.designation || 'Member'}</p>
                                </div>
                                {formData.team_members.includes(u.id) && (
                                    <Target className="w-5 h-5 text-jeallo-primary" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
                <textarea 
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="What's this project about?"
                    className="w-full bg-slate-50 border-none rounded-none py-4 px-6 font-bold text-slate-700 focus:ring-2 focus:ring-jeallo-primary/20 resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button 
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-50 text-slate-400 py-5 rounded-none font-black text-lg hover:bg-slate-100 transition-all uppercase tracking-widest"
            >
                Cancel
            </button>
            <button 
                type="submit"
                disabled={mutation.isPending}
                className="flex-[2] bg-jeallo-gradient text-white py-5 rounded-none font-black text-lg shadow-xl shadow-jeallo-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
                {mutation.isPending ? (
                    <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        {project ? 'UPDATING...' : 'CREATING...'}
                    </>
                ) : (
                    project ? 'UPDATE PROJECT' : 'CREATE PROJECT'
                )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
