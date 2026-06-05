import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.1.22.20:8000';

// ── Configure how notifications appear when app is open ──
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
});

// ── Request permission and get push token ──
export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices.');
    return null;
  }

  // Check existing permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Ask if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied.');
    return null;
  }

  // Android channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medications', {
      name:             'Medication Reminders',
      importance:       Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor:       '#6B0F1A',
      sound:            true,
    });
  }

  // Get Expo push token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId
      ?? Constants.easConfig?.projectId;

    const tokenData = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    const pushToken = tokenData.data;
    console.log('Expo Push Token:', pushToken);

    // Save locally
    await AsyncStorage.setItem('pushToken', pushToken);

    // Send to backend
    await sendTokenToBackend(pushToken);

    return pushToken;
  } catch (err) {
    console.error('Error getting push token:', err);
    return null;
  }
}

// ── Send token to backend ──
async function sendTokenToBackend(pushToken) {
  try {
    const token    = await AsyncStorage.getItem('token');
    const userData = await AsyncStorage.getItem('user');
    if (!token || !userData) return;

    await fetch(`${API_URL}/notifications/register-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ push_token: pushToken }),
    });
    console.log('Push token sent to backend.');
  } catch (err) {
    console.error('Failed to send push token to backend:', err);
  }
}

// ── Schedule local notification (fallback if backend push fails) ──
export async function scheduleLocalNotification({ title, body, triggerTime }) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      data:  { type: 'medication_reminder' },
    },
    trigger: triggerTime
      ? { date: triggerTime }
      : null,
  });
}

// ── Schedule medication reminders from schedule data ──
export async function scheduleMedicationReminders(schedules) {
  // Cancel all existing scheduled notifications first
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();

  for (const schedule of schedules) {
    for (const dose of schedule.doses) {
      const doseTime = new Date(dose.scheduledTime);

      // Only schedule future doses
      if (doseTime > now && dose.status === 'pending') {
        // Notify 5 minutes before
        const reminderTime = new Date(doseTime.getTime() - 5 * 60 * 1000);

        if (reminderTime > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '💊 Medication Reminder',
              body:  `Time to take your ${schedule.medication} in 5 minutes`,
              sound: true,
              data:  { type: 'reminder', scheduleId: schedule.scheduleId },
            },
            trigger: { date: reminderTime },
          });
        }

        // Notify at exact dose time
        if (doseTime > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '💊 Take Your Medication Now',
              body:  `Take your ${schedule.medication} — ${schedule.dosage}`,
              sound: true,
              data:  { type: 'reminder', doseId: dose.id },
            },
            trigger: { date: doseTime },
          });
        }
      }
    }
  }

  console.log('Medication reminders scheduled.');
}

// ── Cancel all scheduled notifications ──
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ── Listen for notification interactions ──
export function addNotificationListeners(onReceive, onResponse) {
  const receiveListener = Notifications.addNotificationReceivedListener(onReceive);
  const responseListener = Notifications.addNotificationResponseReceivedListener(onResponse);
  return { receiveListener, responseListener };
}

export function removeNotificationListeners({ receiveListener, responseListener }) {
  Notifications.removeNotificationSubscription(receiveListener);
  Notifications.removeNotificationSubscription(responseListener);
}