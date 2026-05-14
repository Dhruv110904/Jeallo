import { useState, useEffect } from 'react';
import { X, Search, UserPlus, UserMinus, Loader2, Check } from 'lucide-react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';

export default function ProjectMemberModal({ isOpen, onClose, project, onUpdate }) {
  const [users, setUsers] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (isOpen && project) {
      fetchData();
    }
  }, [isOpen, project]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all users (adjust per_page as needed for selector)
      const usersRes = await axios.get('/v1/users?per_page=100');
      setUsers(usersRes.data.data);
      
      // Fetch current project members
      const membersRes = await axios.get(`/v1/projects/${project.id}/members`);
      setProjectMembers(membersRes.data.data.map(m => m.id));
    } catch (error) {
      console.error(error);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = async (userId) => {
    setProcessingId(userId);
    const isMember = projectMembers.includes(userId);
    
    try {
      if (isMember) {
        await axios.delete(`/v1/projects/${project.id}/members/${userId}`);
        setProjectMembers(prev => prev.filter(id => id !== userId));
        toast.success('Member removed');
      } else {
        await axios.post(`/v1/projects/${project.id}/members`, { user_id: userId });
        setProjectMembers(prev => [...prev, userId]);
        toast.success('Member added');
      }
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setProcessingId(null);
    }
  };

  if (!isOpen) return null;

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-none shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Project Members</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage team access</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-md transition-all text-slate-400 hover:text-slate-900">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-50">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-jeallo-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-none py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-4 focus:ring-jeallo-primary/5 focus:bg-white focus:border-jeallo-primary/30 outline-none transition-all"
            />
          </div>
        </div>

        {/* User List */}
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="animate-spin" size={24} />
              <span className="text-xs font-black uppercase tracking-widest">Loading team...</span>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {filteredUsers.map((user) => {
                const isMember = projectMembers.includes(user.id);
                const isProcessing = processingId === user.id;

                return (
                  <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-jeallo-gradient flex items-center justify-center text-white text-sm font-black shadow-md ring-2 ring-white shrink-0">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover rounded-full" /> : user.name[0]}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-black text-slate-900 truncate">{user.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 truncate uppercase">{user.email}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => toggleMember(user.id)}
                      disabled={isProcessing}
                      className={`
                        w-10 h-10 flex items-center justify-center transition-all
                        ${isMember 
                          ? 'text-jeallo-primary hover:text-red-500' 
                          : 'text-slate-300 hover:text-jeallo-primary hover:bg-slate-100'}
                      `}
                    >
                      {isProcessing ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : isMember ? (
                        <Check size={20} className="group-hover:hidden" />
                      ) : (
                        <UserPlus size={18} />
                      )}
                      {isMember && !isProcessing && (
                        <UserMinus size={18} className="hidden group-hover:block" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">
                <p className="text-sm font-bold">No users found</p>
                <p className="text-[10px] uppercase tracking-widest mt-1">Try a different search</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
            <button 
                onClick={onClose}
                className="text-[10px] font-black text-jeallo-primary uppercase tracking-widest hover:text-jeallo-orange transition-colors"
            >
                Close Manager
            </button>
        </div>
      </div>
    </div>
  );
}
