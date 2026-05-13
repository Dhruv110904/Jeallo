import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifStore } from '../store/notifStore';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/axios';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, notifications, setNotifications, markRead } = useNotifStore();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        setNotifications(response.data.data);
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

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      markRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 relative transition-all active:scale-95"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-slate-900 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h3 className="font-bold text-white">Notifications</h3>
            <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-full font-medium">
              {unreadCount} New
            </span>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer relative ${!notif.read_at ? 'bg-indigo-500/5' : ''}`}
                  onClick={() => !notif.read_at && handleMarkAsRead(notif.id)}
                >
                  {!notif.read_at && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>}
                  <p className="text-sm text-slate-200 line-clamp-2 pr-2">{notif.data.message}</p>
                  <p className="text-[10px] text-slate-500 mt-2 font-medium">
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 text-slate-700 mx-auto mb-3 opacity-20" />
                <p className="text-sm text-slate-500">No notifications yet</p>
              </div>
            )}
          </div>
          
          <button className="w-full p-3 text-xs text-indigo-400 hover:text-indigo-300 font-semibold border-t border-slate-800 bg-slate-900/50">
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
}
