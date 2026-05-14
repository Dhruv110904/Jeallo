import { useState, useEffect } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import axios from '../../api/axios';

export default function WorkspaceSwitcher() {
  const { currentWorkspace, setCurrentWorkspace, workspaces, setWorkspaces } = useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await axios.get('/v1/workspaces');
        setWorkspaces(response.data.data);
        if (!currentWorkspace && response.data.data.length > 0) {
          setCurrentWorkspace(response.data.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch workspaces', error);
      }
    };
    fetchWorkspaces();
  }, []);

  return (
    <div className="relative mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-3 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl hover:border-jeallo-primary/30 transition-all group shadow-sm"
      >
        <div className="w-10 h-10 bg-jeallo-primary rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-jeallo-primary/20 bg-jeallo-gradient">
          {currentWorkspace?.name?.[0] || 'J'}
        </div>
        <div className="flex-1 text-left overflow-hidden">
          <p className="text-sm font-bold text-slate-900 truncate">{currentWorkspace?.name || 'Loading...'}</p>
          <p className="text-[10px] font-black text-jeallo-primary uppercase tracking-widest">Workspace</p>
        </div>
        <i className={`ti ti-selector text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  setCurrentWorkspace(ws);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${currentWorkspace?.id === ws.id ? 'bg-cloud-white' : 'hover:bg-slate-50'}`}
              >
                <div className="w-8 h-8 bg-slate-200 rounded flex items-center justify-center text-slate-600 font-bold">
                  {ws.name[0]}
                </div>
                <span className="text-sm font-medium text-slate-700 truncate">{ws.name}</span>
                {currentWorkspace?.id === ws.id && <i className="ti ti-check text-done-green ml-auto"></i>}
              </button>
            ))}
          </div>
          <button className="w-full p-3 border-t border-slate-100 text-sm font-bold text-jeallo-primary hover:bg-jeallo-primary/5 flex items-center justify-center gap-2 transition-colors">
            <i className="ti ti-plus"></i>
            Create Workspace
          </button>
        </div>
      )}
    </div>
  );
}
