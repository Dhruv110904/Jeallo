import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useUiStore } from '../../store/uiStore';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import ProjectModal from '../ProjectModal';
import axios from '../../api/axios';
import {
  PanelLeftClose, PanelLeftOpen,
  Plus, Target
} from 'lucide-react';

const PRIMARY_MENU = [
  { icon: 'ti ti-layout-dashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: 'ti ti-checkbox', label: 'My Tasks', path: '/dashboard/my-tasks' },
  { icon: 'ti ti-clock', label: 'Attendance', path: '/dashboard/attendance' },
  { icon: 'ti ti-calendar', label: 'Leaves', path: '/dashboard/leaves' },
  { icon: 'ti ti-calendar-event', label: 'Calendar', path: '/dashboard/calendar' },
  { icon: 'ti ti-users', label: 'Team', path: '/dashboard/users' },
  { icon: 'ti ti-inbox', label: 'Inbox', path: '/dashboard/inbox' },
];

export default function Sidebar() {
  const { currentWorkspace } = useWorkspaceStore();
  const { logout, user } = useAuthStore();
  const { isSidebarCollapsed, toggleCollapse } = useUiStore();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  useEffect(() => {
    if (currentWorkspace) {
      const fetchProjects = async () => {
        try {
          const response = await axios.get(`/v1/workspaces/${currentWorkspace.id}/projects`);
          setProjects(response.data.data);
        } catch (error) {
          console.error('Failed to fetch projects', error);
        }
      };
      fetchProjects();
    }
  }, [currentWorkspace]);

  return (
    <aside className={`${isSidebarCollapsed ? 'w-24' : 'w-72'} bg-white border-r border-slate-200 flex flex-col h-screen overflow-visible transition-all duration-300 relative group`}>
      {/* Collapse Toggle Button */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-4 top-10 w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-md z-[100] hover:bg-slate-50 hover:text-jeallo-primary hover:border-jeallo-primary/30 transition-all opacity-100"
      >
        {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </button>

      {/* Brand & Workspace */}
      <div className={`p-6 pb-2 ${isSidebarCollapsed ? 'px-4' : ''}`}>
        <div className={`flex items-center gap-3 mb-6 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 bg-jeallo-gradient rounded-xl flex items-center justify-center shadow-lg shadow-jeallo-primary/20 shrink-0">
            <Target className="text-white w-6 h-6" />
          </div>
          {!isSidebarCollapsed && (
            <span className="text-xl font-black text-jeallo-primary tracking-tight uppercase animate-in fade-in duration-500">Jeallo</span>
          )}
        </div>

        <div className={isSidebarCollapsed ? 'hidden' : 'block'}>
          <WorkspaceSwitcher />
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto px-4 space-y-4 custom-scrollbar mt-4 ${isSidebarCollapsed ? 'px-2' : ''}`}>
        {/* Primary Menu */}
        <div className="space-y-1">
          {PRIMARY_MENU
            .filter(item => !(item.label === 'Team' && user?.role === 'employee'))
            .map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                title={isSidebarCollapsed ? item.label : ''}
                className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-xl transition-all group
                ${isSidebarCollapsed ? 'justify-center px-0' : ''}
                ${isActive
                    ? 'bg-jeallo-primary/5 text-jeallo-primary font-black shadow-sm ring-1 ring-jeallo-primary/10'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-jeallo-primary'}
              `}
              >
                <i className={`${item.icon} text-xl shrink-0`}></i>
                {!isSidebarCollapsed && (
                  <span className="text-sm font-bold animate-in fade-in slide-in-from-left-2 duration-300">{item.label}</span>
                )}
              </NavLink>
            ))}
        </div>

        {/* Projects Section */}
        <div className="space-y-1">
          {!isSidebarCollapsed ? (
            <>
              <div
                className="flex items-center justify-between px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600 transition-colors"
                onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
              >
                <span>Projects</span>
                <i className={`ti ti-chevron-${isProjectsExpanded ? 'down' : 'right'} transition-transform`}></i>
              </div>

              {isProjectsExpanded && (
                <div className="space-y-6 mt-4 animate-in fade-in slide-in-from-left-2 duration-300">
                  {/* Active Projects */}
                  <div className="space-y-1">
                    <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active</p>
                    {projects.filter(p => p.status === 'active').map((project) => (
                      <div key={project.id} className="space-y-1">
                        <NavLink
                          to={`/dashboard/projects/${project.id}`}
                          className={({ isActive }) => `
                                flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                                ${isActive || location.pathname.includes(`/projects/${project.id}`)
                              ? 'text-jeallo-primary font-bold'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-jeallo-primary'}
                            `}
                        >
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }}></div>
                          <span className="text-sm truncate font-medium">{project.name}</span>
                        </NavLink>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Completed</p>
                    {projects.filter(p => p.status === 'completed' || p.status === 'archived').length > 0 ? (
                      projects.filter(p => p.status === 'completed' || p.status === 'archived').map((project) => (
                        <NavLink
                          key={project.id}
                          to={`/dashboard/projects/${project.id}`}
                          className={({ isActive }) => `
                                flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                                ${isActive ? 'text-slate-400 font-semibold' : 'text-slate-400 hover:text-jeallo-primary'}
                            `}
                        >
                          <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                          <span className="text-sm truncate line-through font-medium">{project.name}</span>
                        </NavLink>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-[10px] text-slate-300 italic font-medium">No completed projects yet</p>
                    )}
                  </div>

                  {user?.role !== 'employee' && (
                    <button
                      onClick={() => setIsProjectModalOpen(true)}
                      className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-jeallo-primary text-sm transition-colors w-full border-t border-slate-50 pt-4 font-bold"
                    >
                      <Plus size={16} />
                      <span>Add Project</span>
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-px bg-slate-100"></div>
              {projects.filter(p => p.status === 'active').slice(0, 3).map(project => (
                <NavLink
                  key={project.id}
                  to={`/dashboard/projects/${project.id}`}
                  title={project.name}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-100 hover:border-jeallo-primary/30 transition-all shadow-sm"
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color }}></div>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Footer / Logout Fallback or Empty */}
      <div className={`p-4 border-t border-slate-100 flex items-center justify-center bg-slate-50/50 relative ${isSidebarCollapsed ? 'px-2' : ''}`}>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Jeallo v2.0</p>
      </div>

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        workspaceId={currentWorkspace?.id}
      />
    </aside>
  );
}
