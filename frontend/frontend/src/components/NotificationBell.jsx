import React, { useState, useRef, useEffect } from 'react';
import useNotifications from '../hooks/useNotifications';

const typeStyles = {
  reminder: { bg: '#cfe2ff', color: '#084298', icon: '💊' },
  missed:   { bg: '#f8d7da', color: '#842029', icon: '⚠️' },
  renewal:  { bg: '#d1e7dd', color: '#0f5132', icon: '🔄' },
};

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef         = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now  = new Date();
    const diff = Math.floor((now - date) / 60000); // minutes

    if (diff < 1)  return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>

      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: 'none',
          border: '1px solid #dee2e6',
          borderRadius: '6px',
          padding: '0.35rem 0.5rem',
          cursor: 'pointer',
          fontSize: '1.1rem',
          lineHeight: 1,
          backgroundColor: isOpen ? '#f8f9fa' : 'transparent',
          transition: 'all 0.15s',
        }}
        aria-label="Notifications"
      >
        🔔
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              backgroundColor: '#dc3545',
              color: '#fff',
              borderRadius: '999px',
              fontSize: '0.62rem',
              fontWeight: 700,
              minWidth: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
              lineHeight: 1,
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '320px',
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            border: '1px solid #e9ecef',
            zIndex: 2000,
            overflow: 'hidden',
          }}
        >
          {/* Dropdown header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.85rem 1rem',
              borderBottom: '1px solid #e9ecef',
              backgroundColor: '#f8f9fa',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
              🔔 Notifications
              {unreadCount > 0 && (
                <span
                  style={{
                    marginLeft: '0.4rem',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    padding: '0.1rem 0.45rem',
                    fontWeight: 700,
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0d6efd',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: 'var(--muted)',
                  fontSize: '0.85rem',
                }}
              >
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => {
                const style = typeStyles[n.type] || typeStyles.reminder;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      padding: '0.85rem 1rem',
                      borderBottom: '1px solid #f0f0f0',
                      backgroundColor: n.read ? '#fff' : '#f8f9ff',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f4ff'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = n.read ? '#fff' : '#f8f9ff'}
                  >
                    {/* Icon */}
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: style.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.95rem',
                        flexShrink: 0,
                      }}
                    >
                      {style.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: n.read ? 400 : 600,
                          color: '#212529',
                          marginBottom: '0.2rem',
                          lineHeight: 1.4,
                        }}
                      >
                        {n.message}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                        {n.time && <span>🕐 {n.time} · </span>}
                        {formatTime(n.createdAt)}
                      </div>
                    </div>

                    {/* Unread dot */}
                    {!n.read && (
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#0d6efd',
                          flexShrink: 0,
                          marginTop: '4px',
                        }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '0.6rem 1rem',
              borderTop: '1px solid #e9ecef',
              textAlign: 'center',
              backgroundColor: '#f8f9fa',
            }}
          >
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
              Reminders update every 60 seconds
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;