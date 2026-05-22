import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function TaskDetailPanel({ task, isOpen, onClose, onUpdate }) {
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState('details');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [epicId, setEpicId] = useState('');

  const [members, setMembers] = useState([]);
  const [epics, setEpics] = useState([]);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showEpicDropdown, setShowEpicDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const priorityOptions = [
    { value: 'low', label: 'Low', icon: 'ti ti-flag-filled text-slate-400' },
    { value: 'medium', label: 'Medium', icon: 'ti ti-flag-filled text-jeallo-primary' },
    { value: 'high', label: 'High', icon: 'ti ti-flag-filled text-deadline-amber' },
    { value: 'critical', label: 'Critical', icon: 'ti ti-flag-filled text-overdue-red' },
  ];

  useEffect(() => {
    if (projectId) {
      fetchMembers();
      fetchEpics();
    }
  }, [projectId]);

  useEffect(() => {
    const handleCloseAll = () => {
      setShowAssigneeDropdown(false);
      setShowEpicDropdown(false);
      setShowPriorityDropdown(false);
    };
    document.addEventListener('click', handleCloseAll);
    return () => document.removeEventListener('click', handleCloseAll);
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`/v1/projects/${projectId}/members`);
      setMembers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch project members', error);
    }
  };

  const fetchEpics = async () => {
    try {
      const response = await axios.get(`/v1/projects/${projectId}/epics`);
      setEpics(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch project epics', error);
    }
  };

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setDueDate(task.due_date || '');
      
      const activeAssigneeId = task.assignees?.[0]?.id || task.assignee?.id || '';
      setAssigneeId(activeAssigneeId);

      const activeEpicId = task.epic?.id || '';
      setEpicId(activeEpicId);
      
      fetchComments();
    }
  }, [task]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/v1/tasks/${task.id}/comments`);
      setComments(response.data.data);
    } catch (error) {
      console.error('Failed to fetch comments', error);
    }
  };

  const handleSaveComment = async () => {
    if (!newComment.trim()) return;
    try {
      await axios.post(`/v1/tasks/${task.id}/comments`, {
        comment: newComment.trim()
      });
      setNewComment('');
      fetchComments();
      toast.success('Comment added');
    } catch (error) {
      console.error('Failed to add comment', error);
      toast.error('Failed to add comment');
    }
  };

  const generateAiDescription = async () => {
    setIsAiLoading(true);
    try {
      const response = await axios.post('/v1/ai/generate-description', {
        task_id: task.id
      });
      setDescription(response.data.description);
      toast.success('AI description generated!');
    } catch (error) {
      toast.error('AI generation failed. Check API key.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleUpdateTask = async () => {
    setIsUpdating(true);
    try {
      await axios.patch(`/v1/tasks/${task.id}`, {
        title: title.trim(),
        description: description,
        priority: priority,
        due_date: dueDate || null,
        assignee_ids: assigneeId ? [parseInt(assigneeId)] : [],
        epic_id: epicId ? parseInt(epicId) : null
      });
      toast.success('Task updated successfully');
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Failed to update task', error);
      toast.error('Failed to update task');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this task? All tracking and checklists associated with it will be deleted.')) return;
    try {
      await axios.delete(`/v1/tasks/${task.id}`);
      toast.success('Task deleted successfully');
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Failed to delete task', error);
      toast.error('Failed to delete task');
    }
  };

  if (!task) return null;

  const selectedMember = members.find(m => String(m.id) === String(assigneeId)) || 
                         (task.assignees?.[0] && String(task.assignees[0].id) === String(assigneeId) ? task.assignees[0] : null) ||
                         (task.assignee && String(task.assignee.id) === String(assigneeId) ? task.assignee : null);

  const selectedEpic = epics.find(e => String(e.id) === String(epicId)) || task.epic;

  return (
    <>
      {/* Dim backdrop overlay for focused drawer view */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/15 backdrop-blur-[2px] z-[140] transition-opacity duration-300 animate-in fade-in"
        />
      )}

      <div className={`fixed inset-y-0 right-0 w-[600px] bg-white shadow-2xl z-[150] transform transition-transform duration-300 ease-in-out border-l border-slate-200 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{task.identifier}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
              <span className="text-sm font-bold text-jeallo-primary tracking-tight">Edit Task</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all"><i className="ti ti-dots-vertical text-xl"></i></button>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all ml-2"><i className="ti ti-x text-xl"></i></button>
            </div>
          </div>

          {/* Content Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
            {/* Title Area */}
            <textarea 
              className="w-full text-2xl font-black text-slate-900 border-none focus:ring-0 resize-none p-0 placeholder-slate-300 focus:bg-slate-50/50 rounded-xl transition-all px-2 py-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task Title..."
              rows={1}
            />

            {/* Controls Bar */}
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all text-xs font-bold text-slate-600">
                <i className="ti ti-link"></i> Link Issue
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all text-xs font-bold text-slate-600">
                <i className="ti ti-git-branch"></i> Create Subtask
              </button>
              <button 
                onClick={generateAiDescription}
                disabled={isAiLoading}
                className="flex items-center gap-2 px-3 py-1.5 bg-jeallo-primary/5 text-jeallo-primary hover:bg-jeallo-primary/10 rounded-lg transition-all text-xs font-bold disabled:opacity-50"
              >
                <i className={`ti ti-sparkles ${isAiLoading ? 'animate-pulse' : ''}`}></i> {isAiLoading ? 'Generating...' : 'AI Enhance'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8 bg-slate-50/40 p-5 rounded-2xl border border-slate-100">
              {/* Left Column: Properties */}
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Assignee</label>
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAssigneeDropdown(!showAssigneeDropdown);
                      setShowEpicDropdown(false);
                      setShowPriorityDropdown(false);
                    }}
                    className="flex items-center justify-between gap-2 p-2.5 bg-white border border-slate-150 hover:bg-slate-50 hover:border-slate-350 rounded-xl transition-all cursor-pointer relative shadow-sm"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-cloud-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                        {selectedMember?.avatar ? (
                          <img src={selectedMember.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <i className="ti ti-user text-slate-400 text-sm"></i>
                        )}
                      </div>
                      <span className="text-sm font-bold text-slate-800 truncate">{selectedMember?.name || 'Unassigned'}</span>
                    </div>
                    <i className="ti ti-chevron-down text-slate-400 text-xs"></i>

                    {showAssigneeDropdown && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute left-0 top-12 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150 custom-scrollbar"
                      >
                        <div className="px-3.5 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
                          Select Project Member
                        </div>
                        <button
                          onClick={() => {
                            setAssigneeId('');
                            setShowAssigneeDropdown(false);
                          }}
                          className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50/50 transition-all text-left"
                        >
                          <div className="w-6 h-6 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                            <i className="ti ti-user-x text-[10px]"></i>
                          </div>
                          <span>Unassigned</span>
                        </button>

                        {members.map(member => (
                          <button
                            key={member.id}
                            onClick={() => {
                              setAssigneeId(member.id);
                              setShowAssigneeDropdown(false);
                            }}
                            className={`flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-bold transition-all text-left ${
                              String(assigneeId) === String(member.id) 
                                ? 'text-jeallo-primary bg-jeallo-primary/5' 
                                : 'text-slate-600 hover:text-jeallo-primary hover:bg-slate-50'
                            }`}
                          >
                            <div className="w-6 h-6 rounded-full bg-cloud-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                              {member.avatar ? (
                                <img src={member.avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <i className="ti ti-user text-[10px] text-slate-400"></i>
                              )}
                            </div>
                            <span className="truncate">{member.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Epic</label>
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEpicDropdown(!showEpicDropdown);
                      setShowAssigneeDropdown(false);
                      setShowPriorityDropdown(false);
                    }}
                    className="flex items-center justify-between gap-2 p-2.5 bg-white border border-slate-150 hover:bg-slate-50 hover:border-slate-350 rounded-xl transition-all cursor-pointer relative shadow-sm"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div 
                        className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border border-slate-200" 
                        style={{ backgroundColor: selectedEpic?.color || '#cbd5e1' }}
                      />
                      <span className="text-sm font-bold text-slate-800 truncate">{selectedEpic?.name || 'No Epic'}</span>
                    </div>
                    <i className="ti ti-chevron-down text-slate-400 text-xs"></i>

                    {showEpicDropdown && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute left-0 top-12 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150 custom-scrollbar"
                      >
                        <div className="px-3.5 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
                          Select Epic
                        </div>
                        <button
                          onClick={() => {
                            setEpicId('');
                            setShowEpicDropdown(false);
                          }}
                          className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50/50 transition-all text-left"
                        >
                          <div className="w-4 h-4 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                            <i className="ti ti-x text-[10px]"></i>
                          </div>
                          <span>No Epic</span>
                        </button>

                        {epics.map(epic => (
                          <button
                            key={epic.id}
                            onClick={() => {
                              setEpicId(epic.id);
                              setShowEpicDropdown(false);
                            }}
                            className={`flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-bold transition-all text-left ${
                              String(epicId) === String(epic.id) 
                                ? 'text-jeallo-primary bg-jeallo-primary/5' 
                                : 'text-slate-600 hover:text-jeallo-primary hover:bg-slate-50'
                            }`}
                          >
                            <div 
                              className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border border-white shadow-sm" 
                              style={{ backgroundColor: epic.color }}
                            />
                            <span className="truncate">{epic.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Properties */}
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Priority</label>
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPriorityDropdown(!showPriorityDropdown);
                      setShowAssigneeDropdown(false);
                      setShowEpicDropdown(false);
                    }}
                    className="flex items-center justify-between gap-2 p-2.5 bg-white border border-slate-150 hover:bg-slate-50 hover:border-slate-350 rounded-xl transition-all cursor-pointer relative shadow-sm"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {(() => {
                        const activeOpt = priorityOptions.find(o => o.value === priority) || priorityOptions[1];
                        return (
                          <>
                            <i className={`${activeOpt.icon} text-sm`}></i>
                            <span className="text-sm font-bold text-slate-800 truncate">{activeOpt.label}</span>
                          </>
                        );
                      })()}
                    </div>
                    <i className="ti ti-chevron-down text-slate-400 text-xs"></i>

                    {showPriorityDropdown && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute left-0 top-12 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      >
                        <div className="px-3.5 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
                          Select Priority
                        </div>
                        {priorityOptions.map(option => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setPriority(option.value);
                              setShowPriorityDropdown(false);
                            }}
                            className={`flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-bold transition-all text-left ${
                              priority === option.value 
                                ? 'text-jeallo-primary bg-jeallo-primary/5' 
                                : 'text-slate-600 hover:text-jeallo-primary hover:bg-slate-50'
                            }`}
                          >
                            <i className={`${option.icon} text-sm shrink-0`}></i>
                            <span>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Due Date</label>
                  <input 
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-white border border-slate-150 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-jeallo-primary/10 p-2.5 focus:border-jeallo-primary transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description</label>
              <textarea 
                className="w-full min-h-[150px] p-4 bg-slate-50 border border-slate-150 rounded-2xl text-sm text-slate-700 leading-relaxed focus:bg-white focus:ring-2 focus:ring-jeallo-primary/10 focus:border-jeallo-primary transition-all resize-none outline-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this task..."
              />
            </div>

            {/* Tabs: Comments, Activity, Links */}
            <div className="space-y-4">
              <div className="flex gap-6 border-b border-slate-100">
                {['Comments', 'History', 'Subtasks'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`pb-3 text-sm font-black transition-all relative ${activeTab === tab.toLowerCase() ? 'text-jeallo-primary' : 'text-slate-400'}`}
                  >
                    {tab}
                    {activeTab === tab.toLowerCase() && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-jeallo-primary animate-in slide-in-from-left-full"></div>}
                  </button>
                ))}
              </div>

              <div className="min-h-[200px]">
                {activeTab === 'comments' && (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 flex items-center justify-center text-xs font-black text-slate-600">DJ</div>
                      <div className="flex-1 space-y-2">
                        <textarea 
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:bg-white focus:ring-jeallo-primary/20 outline-none transition-all resize-none"
                          placeholder="Add a comment..."
                          rows={1}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSaveComment();
                            }
                          }}
                        />
                        {newComment.trim() && (
                          <button 
                            onClick={handleSaveComment}
                            className="px-4 py-1.5 bg-jeallo-primary text-white text-xs font-bold rounded-lg hover:shadow-lg hover:shadow-jeallo-primary/20 transition-all"
                          >
                            Save
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {comments.length === 0 ? (
                      <p className="text-xs text-slate-450 italic text-center py-4">No comments yet. Type above to start discussion!</p>
                    ) : (
                      comments.map(comment => (
                        <div key={comment.id} className="flex gap-4 group">
                          <div className="w-8 h-8 rounded-full bg-jeallo-primary/10 flex items-center justify-center text-xs font-black text-jeallo-primary shrink-0">
                            {comment.user.name[0]}
                          </div>
                          <div className="flex-1 bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-black text-jeallo-primary">{comment.user.name}</span>
                              <span className="text-[10px] text-slate-400 font-bold">Just now</span>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">{comment.comment}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                {activeTab === 'subtasks' && (
                  <div className="space-y-2">
                     <p className="text-sm text-slate-400 italic text-center py-8">No subtasks defined yet.</p>
                  </div>
                )}
                {activeTab === 'history' && (
                  <div className="space-y-2">
                     <p className="text-sm text-slate-400 italic text-center py-8">No history events recorded yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <button 
              onClick={handleDeleteTask}
              className="text-sm font-bold text-slate-400 hover:text-rose-600 transition-all"
            >
              Delete Task
            </button>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-6 py-2 text-sm font-bold text-slate-500">Cancel</button>
              <button 
                onClick={handleUpdateTask}
                disabled={isUpdating}
                className="px-6 py-2 bg-jeallo-primary text-white text-sm font-black rounded-xl hover:shadow-lg hover:shadow-jeallo-primary/20 transition-all bg-jeallo-gradient disabled:opacity-50 flex items-center gap-2"
              >
                {isUpdating && <i className="ti ti-loader animate-spin text-sm"></i>}
                <span>Update Task</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
