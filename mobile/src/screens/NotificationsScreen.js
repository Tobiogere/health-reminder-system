import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const MAROON = '#6B0F1A';
const GOLD   = '#C9A84C';
const API    = 'http://10.201.102.198:8000';

export default function NotificationsScreen({ navigation }) {
  const { theme: t } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [filter, setFilter]               = useState('all');

  const load = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API}/notifications/`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setNotifications(data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`${API}/notifications/${id}/read`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`${API}/notifications/read-all`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    if (filter === 'all')    return true;
    if (filter === 'unread') return !n.read;
    if (filter === 'missed') return n.missed;
    return true;
  });

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const diff = (Date.now() - d) / 1000;
    if (diff < 60)    return 'Just now';
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString('en-GB');
  };

  const getIcon = (n) => n.missed ? '⚠️' : n.type === 'renewal' ? '🔄' : '💊';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: MAROON }}>
      <StatusBar barStyle="light-content" backgroundColor={MAROON} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={{ backgroundColor: GOLD, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 }}>
              <Text style={{ color: MAROON, fontSize: 11, fontWeight: '800' }}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0
          ? <TouchableOpacity onPress={markAllRead}><Text style={{ color: GOLD, fontSize: 12, fontWeight: '600' }}>Mark all</Text></TouchableOpacity>
          : <View style={{ width: 60 }} />}
      </View>

      {/* Filter tabs */}
      <View style={{ backgroundColor: MAROON, paddingHorizontal: 16, paddingBottom: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all',    label: 'All'    },
            { key: 'unread', label: 'Unread' },
            { key: 'missed', label: 'Missed' },
          ].map(f => (
            <TouchableOpacity key={f.key}
              style={[styles.filterChip, filter === f.key && { backgroundColor: GOLD }]}
              onPress={() => setFilter(f.key)}>
              <Text style={[styles.filterChipText, filter === f.key && { color: MAROON, fontWeight: '800' }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={{ flex: 1, backgroundColor: t.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={MAROON} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1, backgroundColor: t.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[MAROON]} />}>

          {filtered.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 80 }}>
              <Text style={{ fontSize: 50, marginBottom: 16 }}>🔔</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: t.text }}>No notifications</Text>
              <Text style={{ fontSize: 14, color: t.muted, marginTop: 8 }}>You're all caught up!</Text>
            </View>
          ) : (
            <View style={{ padding: 16 }}>
              {filtered.map(n => (
                <TouchableOpacity key={n.id}
                  style={[styles.notifCard, { backgroundColor: t.card, borderColor: t.border },
                    !n.read && { backgroundColor: t.dark ? '#2a2510' : '#fffbf0', borderColor: GOLD + '60' }]}
                  onPress={() => markRead(n.id)} activeOpacity={0.8}>
                  {!n.read && <View style={styles.unreadDot} />}
                  <View style={[styles.notifIcon, { backgroundColor: n.missed ? (t.dark ? '#3a1a1a' : '#fff5f5') : (t.dark ? '#1a3a2a' : '#f0fff4') }]}>
                    <Text style={{ fontSize: 20 }}>{getIcon(n)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, gap: 8 }}>
                      <Text style={{ fontSize: 13, fontWeight: !n.read ? '700' : '600', color: t.text, flex: 1 }} numberOfLines={2}>
                        {n.message}
                      </Text>
                      <Text style={{ fontSize: 11, color: t.muted, flexShrink: 0 }}>{formatTime(n.createdAt)}</Text>
                    </View>
                    {n.drug && <Text style={{ fontSize: 12, color: t.muted }}>💊 {n.drug}{n.time ? ` · ${n.time}` : ''}</Text>}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backBtn: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.15)', marginRight: 8 },
  filterChipText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  notifCard: { borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, position: 'relative' },
  unreadDot: { position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: 4, backgroundColor: MAROON },
  notifIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});