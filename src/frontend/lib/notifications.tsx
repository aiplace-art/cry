import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto remove after duration
    const duration = notification.duration || 5000;
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string) => {
    showNotification({ type: 'success', title, message });
  }, [showNotification]);

  const error = useCallback((title: string, message?: string) => {
    showNotification({ type: 'error', title, message, duration: 7000 });
  }, [showNotification]);

  const info = useCallback((title: string, message?: string) => {
    showNotification({ type: 'info', title, message });
  }, [showNotification]);

  const warning = useCallback((title: string, message?: string) => {
    showNotification({ type: 'warning', title, message });
  }, [showNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        removeNotification,
        success,
        error,
        info,
        warning,
      }}
    >
      {children}
      <NotificationContainer notifications={notifications} onClose={removeNotification} />
    </NotificationContext.Provider>
  );
}

function NotificationContainer({
  notifications,
  onClose,
}: {
  notifications: Notification[];
  onClose: (id: string) => void;
}) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onClose={onClose} />
      ))}
    </div>
  );
}

function NotificationItem({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: (id: string) => void;
}) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-600" />,
    error: <AlertCircle className="h-5 w-5 text-red-600" />,
    info: <Info className="h-5 w-5 text-blue-600" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
  };

  const colors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right ${colors[notification.type]}`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[notification.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white">{notification.title}</p>
        {notification.message && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
        )}
      </div>
      <button
        onClick={() => onClose(notification.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
