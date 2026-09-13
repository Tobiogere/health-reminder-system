import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// How notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
});

// Request notification permissions
export async function registerForPushNotifications() {
  if (!Device.isDevice) return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.log('Notification permission denied.');
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medication-reminders', {
      name:             'Medication Reminders',
      importance:       Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor:       '#6B0F1A',
      sound:            true,
    });
  }
}

// Cancel all scheduled notifications
export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Schedule reminders for all today's pending medications
export async function scheduleAllMedicationReminders(medications) {
  await cancelAllReminders();

  for (const med of medications) {
    if (med.status !== 'pending' || !med.time) continue;

    try {
      // Convert "08:00 AM" → 24h hour/minute
      const [timePart, period] = med.time.split(' ');
      let [hour, minute] = timePart.split(':').map(Number);
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;

      const now = new Date();
      const scheduled = new Date();
      scheduled.setHours(hour, minute, 0, 0);

      // Only schedule if dose is in the future
      if (scheduled <= now) continue;

      await Notifications.scheduleNotificationAsync({
        identifier: `dose-${med.id}`,
        content: {
          title: '💊 Medication Reminder',
          body:  `Time to take your ${med.name}`,
          data:  { doseId: med.id, screen: 'Dashboard' },
          sound: true,
        },
        trigger: {
          date: scheduled,
          channelId: 'medication-reminders',
        },
      });

      // Also schedule a 15-min early reminder
      const early = new Date(scheduled.getTime() - 15 * 60 * 1000);
      if (early > now) {
        await Notifications.scheduleNotificationAsync({
          identifier: `dose-early-${med.id}`,
          content: {
            title: '⏰ Upcoming Medication',
            body:  `${med.name} due in 15 minutes`,
            data:  { doseId: med.id, screen: 'Dashboard' },
            sound: true,
          },
          trigger: {
            date: early,
            channelId: 'medication-reminders',
          },
        });
      }
    } catch (err) {
      console.log('Could not schedule reminder for', med.name, err);
    }
  }
}