import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from '../../utils/formatters';

export function NotificationBell() {
  const { notifications, setNotifications } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg shadow-red-500/50">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-2xl border border-white/10 bg-[#0d1b2a]/95 p-2 shadow-2xl backdrop-blur-xl z-50">
          <div className="mb-2 px-3 py-2 border-b border-white/5">
            <h3 className="font-semibold text-white">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-400">No new notifications</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`flex flex-col gap-1 rounded-xl p-3 cursor-pointer transition-colors ${
                    notif.read ? 'hover:bg-white/5' : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => handleMarkAsRead(notif._id)}
                >
                  <p className={`text-sm ${notif.read ? 'text-slate-300' : 'text-white font-medium'}`}>
                    {notif.title}
                  </p>
                  <p className="text-xs text-slate-400">{notif.message}</p>
                  <span className="text-[10px] text-slate-500 mt-1">
                    {formatDistanceToNow(notif.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
