import { useState, useRef, useEffect } from 'react';
import { 
  Bell, UserPlus, MessageSquare, RefreshCw, 
  CheckCircle2, ChevronRight, Inbox as InboxIcon 
} from 'lucide-react';
import { useNotifStore } from '../store/notifStore';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, notifications, setNotifications, markRead } = useNotifStore();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/v1/notifications');
        setNotifications(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };
    fetchNotifications();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation();
    try {
      await api.patch(`/v1/notifications/${id}/read`);
      markRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleNotificationClick = (notif) => {
    setIsOpen(false);
    if (!notif.read_at) {
      api.patch(`/v1/notifications/${notif.id}/read`).then(() => markRead(notif.id));
    }
    navigate('/dashboard/inbox');
  };

  const getNotificationIcon = (type) => {
    if (type.includes('TaskAssignedNotification') || type === 'task_assigned') {
      return (
        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-150 flex items-center justify-center shrink-0">
          <UserPlus className="w-4 h-4 text-indigo-650" />
        </div>
      );
    }
    if (type.includes('TaskCommentNotification') || type === 'task_comment') {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-150 flex items-center justify-center shrink-0">
          <MessageSquare className="w-4 h-4 text-amber-650" />
        </div>
      );
    }
    if (type.includes('TaskCompletedNotification') || type === 'task_completed') {
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-55 bg-opacity-10 border border-emerald-200 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center shrink-0">
        <RefreshCw className="w-4 h-4 text-slate-550" />
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-none text-slate-400 relative transition-all active:scale-95 hover:text-jeallo-primary hover:bg-white hover:shadow-sm ${
          isOpen ? 'text-jeallo-primary bg-white shadow-sm' : ''
        }`}
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-swing' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white animate-pulse shadow-md shadow-red-300">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Bell Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-none shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[9999]">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-black text-sm text-slate-800 tracking-tight">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-indigo-500/10 text-indigo-650 px-2 py-0.5 rounded-full font-bold">
                {unreadCount} Unread
              </span>
            )}
          </div>
          
          {/* Body items list */}
          <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-50">
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-3.5 hover:bg-slate-50/50 transition-colors cursor-pointer flex gap-3 relative items-start ${
                    !notif.read_at ? 'bg-indigo-500/[0.02]' : ''
                  }`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  {/* Category circular icon */}
                  {getNotificationIcon(notif.type)}

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className={`text-xs text-slate-700 leading-relaxed pr-4 ${!notif.read_at ? 'font-bold' : 'font-medium'}`}>
                      {notif.data.message}
                    </p>
                    <p className="text-[9px] text-slate-400 font-semibold">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </p>
                  </div>

                  {/* Inline Mark Read trigger */}
                  {!notif.read_at && (
                    <button
                      onClick={(e) => handleMarkAsRead(e, notif.id)}
                      className="absolute right-3 top-4 w-2.5 h-2.5 bg-indigo-500 rounded-full hover:bg-indigo-600 hover:scale-125 transition-all shadow-sm shadow-indigo-200"
                      title="Mark read"
                    />
                  )}
                </div>
              ))
            ) : (
              // Empty State
              <div className="p-8 text-center bg-white">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <InboxIcon className="w-5 h-5 text-slate-400 opacity-60" />
                </div>
                <p className="text-xs font-bold text-slate-800">Your inbox is clear</p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Any updates will show up here</p>
              </div>
            )}
          </div>
          
          {/* Footer View All link */}
          <button 
            onClick={() => {
              setIsOpen(false);
              navigate('/dashboard/inbox');
            }}
            className="w-full p-3 text-[10px] text-jeallo-primary bg-slate-50/50 hover:bg-slate-50/90 font-black border-t border-slate-100 flex items-center justify-center gap-1 transition-all"
          >
            View All Notifications
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
