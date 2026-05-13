import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNotifStore } from '../store/notifStore';
import toast from 'react-hot-toast';

export function useSocket() {
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!user || !token) return;

    window.Pusher = Pusher;
    const echo = new Echo({
      broadcaster: 'pusher',
      key: import.meta.env.VITE_PUSHER_APP_KEY,
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      wsHost: import.meta.env.VITE_PUSHER_HOST,
      wsPort: import.meta.env.VITE_PUSHER_PORT,
      forceTLS: false,
      disableStats: true,
      enabledTransports: ['ws'],
      authEndpoint: import.meta.env.VITE_API_URL + '/broadcasting/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // Listen for private notifications
    echo.private(`App.Models.User.${user.id}`)
      .notification((notification) => {
        useNotifStore.getState().add(notification);
        toast.success(notification.message || 'New notification received!');
      });

    return () => {
      echo.disconnect();
    };
  }, [user?.id, token]);
}
