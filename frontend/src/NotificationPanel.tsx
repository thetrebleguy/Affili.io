import React from 'react';
import { X, Bell, ArrowRight } from 'lucide-react';
import './NotificationPanel.css';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onShowAll: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, onShowAll }) => {
  const notifications = [
    {
      id: 1,
      title: 'Revenue Alert',
      message: 'Your revenue increased by 28% this week!',
      time: '2 minutes ago',
      type: 'success',
      icon: '📈',
    },
    {
      id: 2,
      title: 'High Refund Rate',
      message: 'Refund rate exceeded 5%. Check your products.',
      time: '1 hour ago',
      type: 'warning',
      icon: '⚠️',
    },
    {
      id: 3,
      title: 'New Product Trending',
      message: 'Smart LED Desk Lamp showing +34% growth!',
      time: '3 hours ago',
      type: 'info',
      icon: '🚀',
    },
  ];

  return (
    <>
      {isOpen && <div className="notification-overlay" onClick={onClose}></div>}
      <div className={`notification-panel ${isOpen ? 'open' : ''}`}>
        <div className="notification-header">
          <div className="notification-title-group">
            <Bell size={20} />
            <h3>Notifications</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="notification-list">
          {notifications.map((notif) => (
            <div key={notif.id} className={`notification-item ${notif.type}`}>
              <div className="notif-icon">{notif.icon}</div>
              <div className="notif-content">
                <h4 className="notif-title">{notif.title}</h4>
                <p className="notif-message">{notif.message}</p>
                <span className="notif-time">{notif.time}</span>
              </div>
            </div>
          ))}
        </div>

        <button className="show-all-btn" onClick={onShowAll}>
          <span>View All Notifications</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </>
  );
};

export default NotificationPanel;
