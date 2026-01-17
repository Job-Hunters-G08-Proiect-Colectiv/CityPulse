import React from 'react';
import './NotificationCenter.css';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface UINotification {
  id: string;
  message: string;
  type?: NotificationType;
}

interface NotificationCenterProps {
  notifications: UINotification[];
  onDismiss: (id: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onDismiss }) => {
  if (!notifications?.length) return null;

  return (
    <div className="notification-center" role="status" aria-live="polite">
      {notifications.map((n) => (
        <div key={n.id} className={`toast toast-${n.type || 'info'}`}>
          <div className="toast-message">{n.message}</div>
          <button
            aria-label="Dismiss notification"
            className="toast-close"
            onClick={() => onDismiss(n.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;
