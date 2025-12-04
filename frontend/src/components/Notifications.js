import React, { useEffect, useState } from 'react';

const Notifications = ({ cards }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const checkDueDates = () => {
      const now = new Date();
      const newNotifications = [];

      cards.forEach(card => {
        if (card.dueDate) {
          const dueDate = new Date(card.dueDate);
          const timeDiff = dueDate - now;
          const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

          if (daysDiff < 0) {
            newNotifications.push({
              id: `${card.id}-overdue`,
              type: 'overdue',
              message: `Card "${card.title}" is overdue!`,
              cardId: card.id
            });
          } else if (daysDiff === 0) {
            newNotifications.push({
              id: `${card.id}-today`,
              type: 'due-today',
              message: `Card "${card.title}" is due today!`,
              cardId: card.id
            });
          } else if (daysDiff === 1) {
            newNotifications.push({
              id: `${card.id}-tomorrow`,
              type: 'due-soon',
              message: `Card "${card.title}" is due tomorrow`,
              cardId: card.id
            });
          }
        }
      });

      setNotifications(newNotifications);
    };

    checkDueDates();
    const interval = setInterval(checkDueDates, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [cards]);

  const dismissNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '70px',
      right: '20px',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          style={{
            backgroundColor: notification.type === 'overdue' ? '#dc3545' :
                           notification.type === 'due-today' ? '#ffc107' : '#17a2b8',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: '500' }}>
            {notification.message}
          </span>
          <button
            onClick={() => dismissNotification(notification.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '18px',
              cursor: 'pointer',
              marginLeft: '10px',
              padding: '0'
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
