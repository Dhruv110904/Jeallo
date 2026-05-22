import { useState, useEffect } from 'react';
import { 
  Bell, Check, Eye, Trash2, Clipboard, 
  MessageSquare, RefreshCw, CheckCircle2, 
  ArrowRight, Inbox as InboxIcon, UserPlus, 
  Sparkles, Calendar, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { useNotifStore } from '../store/notifStore';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Inbox() {
  const { unreadCount, notifications, setNotifications, markRead } = useNotifStore();
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/v1/notifications');
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      toast.error('Failed to sync inbox');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/v1/notifications/${id}/read`);
      markRead(id);
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Failed to mark notification as read', error);
      toast.error('Action failed');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await api.post('/v1/notifications/read-all');
      // Update local state for all notifications
      const updated = notifications.map(notif => ({
        ...notif,
        read_at: notif.read_at || new Date().toISOString()
      }));
      setNotifications(updated);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read', error);
      toast.error('Bulk update failed');
    }
  };

  const handleNavigateToTask = (notif) => {
    const taskId = notif.data?.task_id;
    if (taskId) {
      // If we have a project context or task details, let's navigate to tasks section
      navigate('/dashboard/my-tasks');
      toast.success(`Opening tasks view for: ${notif.data.task_title || 'Task'}`);
    } else {
      toast.error('Navigation details not available');
    }
  };

  // Filter notifications based on active tab state
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read_at;
    if (filter === 'read') return !!notif.read_at;
    return true;
  });

  const getNotificationStyles = (type) => {
    if (type.includes('TaskAssignedNotification') || type === 'task_assigned') {
      return {
        bg: 'bg-indigo-50/50 hover:bg-indigo-50 border-indigo-100',
        iconBg: 'bg-indigo-500 shadow-indigo-200',
        icon: <UserPlus className="w-5 h-5 text-white animate-pulse" />,
        badgeText: 'Task Assigned',
        badgeBg: 'bg-indigo-100 text-indigo-800'
      };
    }
    if (type.includes('TaskCommentNotification') || type === 'task_comment') {
      return {
        bg: 'bg-amber-50/50 hover:bg-amber-50 border-amber-100',
        iconBg: 'bg-amber-500 shadow-amber-200',
        icon: <MessageSquare className="w-5 h-5 text-white" />,
        badgeText: 'New Comment',
        badgeBg: 'bg-amber-100 text-amber-800'
      };
    }
    if (type.includes('TaskCompletedNotification') || type === 'task_completed') {
      return {
        bg: 'bg-emerald-50/50 hover:bg-emerald-50 border-emerald-100',
        iconBg: 'bg-emerald-500 shadow-emerald-200',
        icon: <CheckCircle2 className="w-5 h-5 text-white" />,
        badgeText: 'Task Completed',
        badgeBg: 'bg-emerald-100 text-emerald-800'
      };
    }
    return {
      bg: 'bg-emerald-50/50 hover:bg-emerald-50 border-emerald-100',
      iconBg: 'bg-emerald-500 shadow-emerald-200',
      icon: <RefreshCw className="w-5 h-5 text-white animate-spin-slow" />,
      badgeText: 'Status Shifted',
      badgeBg: 'bg-emerald-100 text-emerald-800'
    };
  };

  return (
    <div className="min-h-screen bg-slate-50/40 p-8">
      {/* Top Header Section */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Inbox</h1>
            {unreadCount > 0 && (
              <span className="bg-jeallo-gradient text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md shadow-jeallo-primary/25 animate-bounce">
                {unreadCount} UNREAD
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Stay updated with your latest task assignments, team comments, and status shifts.
          </p>
        </div>

        <button
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
          className={`flex items-center gap-2 px-5 py-3 rounded-none font-bold text-sm shadow-sm transition-all border ${
            unreadCount > 0 
              ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-jeallo-primary hover:shadow active:scale-98'
              : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Mark All as Read
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto bg-white border border-slate-100 shadow-xl shadow-slate-100/50 rounded-none overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 bg-slate-50/65">
          <div className="flex gap-6">
            {[
              { id: 'all', label: 'All Notifications', count: notifications.length },
              { id: 'unread', label: 'Unread Only', count: unreadCount },
              { id: 'read', label: 'Read / Archived', count: notifications.length - unreadCount }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setFilter(tab.id);
                  setExpandedId(null);
                }}
                className={`py-4 px-1 border-b-2 font-black text-sm relative transition-all ${
                  filter === tab.id
                    ? 'border-jeallo-primary text-jeallo-primary'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  {tab.label}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all ${
                    filter === tab.id
                      ? 'bg-jeallo-primary/10 text-jeallo-primary'
                      : 'bg-slate-200/80 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <button 
            onClick={fetchNotifications}
            className="p-2 text-slate-400 hover:text-jeallo-primary hover:bg-slate-100 rounded-lg transition-all"
            title="Sync Inbox"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications Body list */}
        <div className="divide-y divide-slate-100">
          {loading ? (
            // Skeleton View
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="p-6 flex gap-4 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/6"></div>
                </div>
              </div>
            ))
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => {
              const styles = getNotificationStyles(notif.type);
              const isExpanded = expandedId === notif.id;

              return (
                <div
                  key={notif.id}
                  className={`transition-all duration-300 ${styles.bg} ${
                    !notif.read_at ? 'border-l-4 border-l-jeallo-primary' : 'border-l-4 border-l-transparent'
                  }`}
                >
                  {/* Card Header/Row */}
                  <div 
                    onClick={() => setExpandedId(isExpanded ? null : notif.id)}
                    className="p-6 flex items-start gap-4 cursor-pointer select-none"
                  >
                    {/* Action Icon */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg shrink-0 ${styles.iconBg}`}>
                      {styles.icon}
                    </div>

                    {/* Metadata and Content Snippet */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${styles.badgeBg}`}>
                          {styles.badgeText}
                        </span>
                        {!notif.read_at && (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-semibold ml-auto">
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                        </span>
                      </div>

                      <p className="text-slate-800 text-sm font-bold line-clamp-1">
                        {notif.data.message}
                      </p>

                      {/* Display quick details based on category when collapsed */}
                      {!isExpanded && notif.data.task_title && (
                        <p className="text-slate-400 text-xs mt-1 font-medium truncate">
                          Task Reference: <span className="text-slate-500 font-bold">{notif.data.task_title}</span>
                        </p>
                      )}
                    </div>

                    {/* Dropdown Chevron */}
                    <div className="text-slate-400 self-center pl-2">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-1 border-t border-slate-100 bg-white/60 animate-in slide-in-from-top-2 duration-300">
                      <div className="pl-15 space-y-4">
                        {/* Custom visual cards for each notification payload */}
                        {/* 1. Comment Detail Card */}
                        {(notif.type.includes('TaskCommentNotification') || notif.type === 'task_comment') && (
                          <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl shadow-inner max-w-2xl relative">
                            <div className="flex items-center gap-2.5 mb-2.5">
                              <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-[10px] text-white font-black">
                                {notif.data.commenter_name?.[0] || 'C'}
                              </div>
                              <span className="text-xs font-black text-slate-700">{notif.data.commenter_name} posted:</span>
                            </div>
                            <blockquote className="text-sm font-medium italic text-slate-600 border-l-2 border-slate-350 pl-3">
                              "{notif.data.message.split('commented on:')[0]}... Check out the discussion on this task."
                            </blockquote>
                          </div>
                        )}

                        {/* 2. Task Assignment Card */}
                        {(notif.type.includes('TaskAssignedNotification') || notif.type === 'task_assigned') && (
                          <div className="bg-slate-50 border border-indigo-100 p-4 rounded-xl shadow-inner max-w-2xl">
                            <div className="flex items-center gap-2 mb-2 text-indigo-950">
                              <Clipboard className="w-4 h-4" />
                              <span className="text-xs font-black">Project Task Info</span>
                            </div>
                            <div className="space-y-1 text-xs font-medium text-slate-650">
                              <p>Task Title: <span className="text-slate-900 font-bold">{notif.data.task_title}</span></p>
                              <p>Workspace: <span className="text-slate-900 font-bold">Jeallo Corporate Suite</span></p>
                              <p className="text-slate-400 mt-2">Open the task list view to review full instructions, update checklists, or change status fields.</p>
                            </div>
                          </div>
                        )}

                        {/* 3. Column Status Shift Card */}
                        {(notif.type.includes('TaskStatusChangedNotification') || notif.type === 'task_status_changed') && (
                          <div className="bg-slate-50 border border-emerald-100 p-4 rounded-xl shadow-inner max-w-2xl">
                            <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Status Workflow</span>
                            <div className="flex items-center gap-4 mt-3">
                              <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-black text-slate-500 shadow-sm">
                                {notif.data.old_status || 'To Do'}
                              </div>
                              <ArrowRight className="w-4 h-4 text-slate-400 animate-pulse" />
                              <div className="bg-emerald-500 border border-emerald-600 px-3 py-1.5 rounded-lg text-xs font-black text-white shadow shadow-emerald-200">
                                {notif.data.new_status || 'In Progress'}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 4. Task Completed Card */}
                        {(notif.type.includes('TaskCompletedNotification') || notif.type === 'task_completed') && (
                          <div className="bg-slate-50 border border-emerald-100 p-4 rounded-xl shadow-inner max-w-2xl">
                            <div className="flex items-center gap-2 mb-2 text-emerald-950">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span className="text-xs font-black">Completed Task Details</span>
                            </div>
                            <div className="space-y-1 text-xs font-medium text-slate-650">
                              <p>Task Title: <span className="text-slate-900 font-bold">{notif.data.task_title}</span></p>
                              <p>Completed By: <span className="text-emerald-700 font-bold">{notif.data.completed_by_name}</span></p>
                              <p className="text-slate-400 mt-2">Congratulations! This task is successfully completed.</p>
                            </div>
                          </div>
                        )}

                        {/* Card Action Controls */}
                        <div className="flex items-center gap-3 pt-2">
                          {!notif.read_at && (
                            <button
                              onClick={() => handleMarkAsRead(notif.id)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-none font-bold text-xs shadow hover:bg-indigo-700 active:scale-98 transition-all"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Mark as Read
                            </button>
                          )}
                          <button
                            onClick={() => handleNavigateToTask(notif)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-none font-bold text-xs hover:bg-slate-50 active:scale-98 transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Open Task View
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            // Gorgeous Glassmorphic Empty State
            <div className="p-16 text-center bg-slate-50/20 relative overflow-hidden">
              {/* Decorative radial lighting */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-jeallo-primary/5 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 max-w-md mx-auto">
                <div className="w-16 h-16 bg-white border border-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-150/40">
                  <InboxIcon className="w-8 h-8 text-jeallo-primary animate-bounce" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Your inbox is clear!</h3>
                <p className="text-sm font-medium text-slate-500">
                  Excellent! You are all caught up. Any new comments, task assignments, or status moves will appear here in real time.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
