import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { 
  UserPlus, MoreHorizontal, Edit2, Trash2, 
  LayoutDashboard, ListTodo, Kanban, Clock 
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import ProjectMemberModal from './ProjectMemberModal';
import ProjectModal from './ProjectModal';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';

export default function ProjectHeader() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [project, setProject] = useState(null);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const moreMenuRef = useRef(null);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`/v1/projects/${projectId}`);
      setProject(response.data.data);
    } catch (error) {
      console.error('Failed to fetch project', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    
    try {
      await axios.delete(`/v1/projects/${projectId}`);
      toast.success('Project deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  if (!project) return null;

  const tabs = [
    { label: 'Summary', path: `/dashboard/projects/${projectId}/summary`, icon: LayoutDashboard },
    { label: 'List', path: `/dashboard/projects/${projectId}/backlog`, icon: ListTodo },
    { label: 'Board', path: `/dashboard/projects/${projectId}/board`, icon: Kanban },
    { label: 'Timeline', path: `/dashboard/projects/${projectId}/timeline`, icon: Clock },
  ];

  return (
    <div className="bg-white border-b border-slate-100 px-8 pt-6 relative shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {project.name}
            </h1>
            
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
                <div className="flex items-center gap-2">
                    {/* Add People Button */}
                    <button 
                        onClick={() => setIsMemberModalOpen(true)}
                        className="w-9 h-9 border border-slate-200 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-jeallo-primary transition-all"
                    >
                        <UserPlus size={18} />
                    </button>

                    {/* More Menu Trigger */}
                    <div className="relative" ref={moreMenuRef}>
                        <button 
                            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
                        >
                            <MoreHorizontal size={20} />
                        </button>

                        {/* Dropdown Menu */}
                        {isMoreMenuOpen && (
                            <div className="absolute top-10 left-0 w-48 bg-white border border-slate-100 shadow-xl z-50 rounded-none overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                                <button 
                                    onClick={() => {
                                        setIsEditModalOpen(true);
                                        setIsMoreMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all text-left"
                                >
                                    <Edit2 size={16} className="text-slate-400" />
                                    <span>Edit Project</span>
                                </button>
                                <div className="h-px bg-slate-100 mx-2"></div>
                                <button 
                                    onClick={handleDeleteProject}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-all text-left"
                                >
                                    <Trash2 size={16} className="text-red-400" />
                                    <span>Delete Project</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
          >
            {({ isActive }) => (
              <div className={`
                flex items-center gap-2 px-4 py-3 border-b-2 transition-all relative group
                ${isActive 
                  ? 'border-jeallo-primary text-jeallo-primary font-black' 
                  : 'border-transparent text-slate-500 hover:text-slate-900 font-bold'}
              `}>
                <tab.icon size={16} className={isActive ? 'text-jeallo-primary' : 'text-slate-400 group-hover:text-slate-600'} />
                <span className="text-sm whitespace-nowrap">{tab.label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </div>

      {/* Modals */}
      <ProjectMemberModal 
        isOpen={isMemberModalOpen} 
        onClose={() => setIsMemberModalOpen(false)} 
        project={project} 
      />

      <ProjectModal 
        isOpen={isEditModalOpen}
        onClose={() => {
            setIsEditModalOpen(false);
            fetchProject();
        }}
        workspaceId={project.workspace_id}
        project={project}
      />
    </div>
  );
}
