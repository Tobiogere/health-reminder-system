import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, StatusBar,
} from 'react-native';

const MAROON = '#6B0F1A';
const GOLD   = '#C9A84C';
const BG     = '#faf9f7';

const initialNotifications = [
  {
    id: 1,
    type: 'reminder',
    title: '💊 Medication Reminder',
    message: 'Time to take your Paracetamol 500mg.',
    time: '08:00 AM',
    date: 'Today',
    read: false,
  },
  {
    id: 2,
    type: 'missed',
    title: '⚠️ Missed Dose Alert',
    message: 'You missed your Paracetamol 500mg dose scheduled at 08:00 AM.',
    time: '09:35 AM',
    date: 'Today',
    read: false,
  },
  {
    id: 3,
    type: 'renewal',
    title: '🔄 Renewal Approved',
    message: 'Your renewal request for Malaria prescription has been approved by the pharmacist.',
    time: '11:20 AM',
    date: 'Today',
    read: true,
  },
  {
    id: 4,
    type: 'reminder',
    title: '💊 Medication Reminder',
    message: 'Time to take your Amoxicillin 250mg.',
    time: '12:00 PM',
    date: 'Today',
    read: true,
  },
  {
    id: 5,
    type: 'prescription',
    title: '📋 New Prescription',
    message: 'Dr. Adebayo has issued a new prescription for Malaria treatment.',
    time: '09:00 AM',
    date: 'Yesterday',
    read: true,
  },
  {
    id: 6,
    type: 'reminder',
    title: '💊 Medication Reminder',
    message: 'Time to take your Vitamin C 1000mg.',
    time: '06:00 PM',
    date: 'Yesterday',
    read: true,
  },
];

const typeConfig = {
  reminder:    { color: '#0d6efd', bg: '#e8f0fe' },
  missed:      { color: '#dc3545', bg: '#fff5f5' },
  renewal:     { color: '#198754', bg: '#e8f5ee' },
  prescription:{ color: MAROON,    bg: '#fdf0f0' },
};

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const filtered = filter === 'all'
    ? notifications
    : filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.type === filter);

  const grouped = filtered.reduce((acc, n) => {
    if (!acc[n.date]) acc[n.date] = [];
    acc[n.date].push(n);
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={MAROON} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllBtn}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all',         label: 'All'          },
            { key: 'unread',      label: 'Unread'       },
            { key: 'reminder',    label: 'Reminders'    },
            { key: 'missed',      label: 'Missed'       },
            { key: 'renewal',     label: 'Renewals'     },
            { key: 'prescription',label: 'Prescriptions'},
          ].map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[
                styles.filterChipText,
                filter === f.key && styles.filterChipTextActive,
              ]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {Object.keys(grouped).length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyText}>
              You're all caught up! Notifications will appear here.
            </Text>
          </View>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <View key={date} style={styles.group}>
              <Text style={styles.groupDate}>{date}</Text>
              {items.map(notif => {
                const config = typeConfig[notif.type];
                return (
                  <TouchableOpacity
                    key={notif.id}
                    style={[
                      styles.notifCard,
                      !notif.read && styles.notifCardUnread,
                    ]}
                    onPress={() => markRead(notif.id)}
                    activeOpacity={0.8}
                  >
                    {/* Unread dot */}
                    {!notif.read && <View style={styles.unreadDot} />}

                    <View style={[styles.notifIcon, { backgroundColor: config.bg }]}>
                      <Text style={styles.notifIconText}>
                        {notif.type === 'reminder'     ? '💊' :
                         notif.type === 'missed'       ? '⚠️' :
                         notif.type === 'renewal'      ? '🔄' : '📋'}
                      </Text>
                    </View>

                    <View style={styles.notifContent}>
                      <View style={styles.notifHeader}>
                        <Text style={[
                          styles.notifTitle,
                          !notif.read && styles.notifTitleUnread,
                        ]}>
                          {notif.title}
                        </Text>
                        <Text style={styles.notifTime}>{notif.time}</Text>
                      </View>
                      <Text style={styles.notifMessage} numberOfLines={2}>
                        {notif.message}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: MAROON },

  // Header
  header: {
    backgroundColor: MAROON,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  unreadBadge: {
    backgroundColor: GOLD,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  unreadBadgeText: {
    color: MAROON,
    fontSize: 11,
    fontWeight: '800',
  },
  markAllBtn: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '600',
  },

  // Filter
  filterRow: {
    backgroundColor: MAROON,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: GOLD,
  },
  filterChipText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: MAROON,
    fontWeight: '800',
  },

  scroll: {
    flex: 1,
    backgroundColor: BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  // Groups
  group: { paddingHorizontal: 16, paddingTop: 16 },
  groupDate: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6c757d',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  // Notification card
  notifCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    position: 'relative',
  },
  notifCardUnread: {
    backgroundColor: '#fffbf0',
    borderColor: GOLD + '60',
  },
  unreadDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: MAROON,
  },
  notifIcon: {
    width: 42, height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifIconText: { fontSize: 20 },
  notifContent: { flex: 1 },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 8,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
    flex: 1,
  },
  notifTitleUnread: {
    color: '#212529',
    fontWeight: '700',
  },
  notifTime: {
    fontSize: 11,
    color: '#adb5bd',
    flexShrink: 0,
  },
  notifMessage: {
    fontSize: 12,
    color: '#6c757d',
    lineHeight: 18,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 50, marginBottom: 16 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
  },
});