import React, { createContext, useState, useEffect, useCallback } from 'react';
// import { getNotifications, markNotificationRead, markAllRead } from '../services/notificationService';
import useAuth from '../hooks/useAuth';

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    if (!user || user.role !== 'patient') return;
    try {
      setLoading(true);
      // TODO: Uncomment when backend is ready
      // const data = await getNotifications();
      // setNotifications(data);

      // ── Dummy notifications for now ──
      setNotifications([
        {
          id: 1,
          type: 'reminder',
          message: 'Time to take Paracetamol 500mg',
          time: '08:00 AM',
          drug: 'Paracetamol 500mg',
          read: false,
          missed: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          type: 'missed',
          message: 'You missed your Amoxicillin 250mg dose',
          time: '08:00 AM',
          drug: 'Amoxicillin 250mg',
          read: false,
          missed: true,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 3,
          type: 'reminder',
          message: 'Time to take Vitamin C 1000mg',
          time: '12:00 PM',
          drug: 'Vitamin C 1000mg',
          read: true,
          missed: false,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 4,
          type: 'renewal',
          message: 'Your renewal request has been approved',
          time: null,
          drug: null,
          read: false,
          missed: false,
          createdAt: new Date(Date.now() - 10800000).toISOString(),
        },
      ]);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch on mount + poll every 60 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    // TODO: await markNotificationRead(id);
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = async () => {
    // TODO: await markAllRead();
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getMissedDoses = () => notifications.filter(n => n.missed && n.type === 'missed');

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      markAsRead,
      markAllAsRead,
      getMissedDoses,
      fetchNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};