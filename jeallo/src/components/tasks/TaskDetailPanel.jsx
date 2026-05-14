import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function TaskDetailPanel({ task, isOpen, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState('details');
  const [description, setDescription] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (task) {
      setDescription(task.description || '');
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

  if (!task) return null;

  return (
    <div className={`fixed inset-y-0 right-0 w-[600px] bg-white shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out border-l border-slate-200 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{task.identifier}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
            <span className="text-sm font-bold text-jeallo-primary tracking-tight">Edit Task</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all"><i className="ti ti-share text-xl"></i></button>
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all"><i className="ti ti-dots-vertical text-xl"></i></button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all ml-2"><i className="ti ti-x text-xl"></i></button>
          </div>
        </div>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
          {/* Title Area */}
          <textarea 
            className="w-full text-2xl font-black text-slate-900 border-none focus:ring-0 resize-none p-0 placeholder-slate-300"
            defaultValue={task.title}
            placeholder="Task Title..."
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

          <div className="grid grid-cols-2 gap-8">
            {/* Left Column: Properties */}
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Assignee</label>
                <div className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-xl transition-all cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-cloud-white border border-slate-200 flex items-center justify-center overflow-hidden">
                    {task.assignee?.avatar ? <img src={task.assignee.avatar} alt="" /> : <i className="ti ti-user text-slate-400"></i>}
                  </div>
                  <span className="text-sm font-bold text-slate-800">{task.assignee?.name || 'Unassigned'}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Epic</label>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.epic?.color || '#cbd5e1' }}></div>
                  <span className="text-xs font-bold text-slate-600">{task.epic?.name || 'None'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Properties */}
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Priority</label>
                <select 
                  defaultValue={task.priority}
                  className="w-full bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-800 focus:ring-jeallo-primary/20"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Story Points</label>
                <input 
                  type="number"
                  defaultValue={task.story_points}
                  className="w-full bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-800 focus:ring-jeallo-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description</label>
            <textarea 
              className="w-full min-h-[150px] p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-700 leading-relaxed focus:ring-jeallo-primary/20 transition-all"
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
                    <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <textarea 
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-jeallo-primary/20"
                        placeholder="Add a comment..."
                        rows={1}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      {newComment && (
                        <button className="px-4 py-1.5 bg-jeallo-primary text-white text-xs font-bold rounded-lg hover:shadow-lg hover:shadow-jeallo-primary/20 transition-all">Save</button>
                      )}
                    </div>
                  </div>
                  
                  {comments.map(comment => (
                    <div key={comment.id} className="flex gap-4 group">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                        {comment.user.name[0]}
                      </div>
                      <div className="flex-1 bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black text-jeallo-primary">{comment.user.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold">2h ago</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{comment.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'subtasks' && (
                <div className="space-y-2">
                   <p className="text-sm text-slate-400 italic text-center py-8">No subtasks defined yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button className="text-sm font-bold text-slate-400 hover:text-overdue-red transition-all">Delete Task</button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2 text-sm font-bold text-slate-500">Cancel</button>
            <button className="px-6 py-2 bg-jeallo-primary text-white text-sm font-black rounded-xl hover:shadow-lg hover:shadow-jeallo-primary/20 transition-all bg-jeallo-gradient">Update Task</button>
          </div>
        </div>
      </div>
    </div>
  );
}
